import { getSupabaseAdmin } from '../../config/database.js';
import { decrypt } from '../../utils/encryption.js';
import { ExchangeFactory } from '../../exchange/ExchangeFactory.js';
import { OrderRepository } from '../../repositories/OrderRepository.js';
import { ExecutionRepository } from '../../repositories/ExecutionRepository.js';
import { OrderEventRepository } from '../../repositories/OrderEventRepository.js';
import { ExchangeResponseRepository } from '../../repositories/ExchangeResponseRepository.js';
import { ExecutionEvents } from '../events/ExecutionEvents.js';
import { logger } from '../../utils/logger.js';

const orderRepo = new OrderRepository();
const execRepo = new ExecutionRepository();
const eventRepo = new OrderEventRepository();
const responseRepo = new ExchangeResponseRepository();

class QueueManager {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
    this.activeLocks = new Set(); // Prevent concurrent operations per user
  }

  /**
   * Enqueues an execution task
   * @param {object} task - { type: 'place'|'cancel', userId, orderId, symbol, exchangeAccountId, params }
   * @returns {Promise<object>} Result of the execution
   */
  enqueue(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        ...task,
        retries: 0,
        resolve,
        reject
      });
      this.processNext();
    });
  }

  async processNext() {
    if (this.queue.length === 0) {
      this.isProcessing = false;
      return;
    }

    // Find the first task in queue that is not user-locked
    let taskIndex = -1;
    for (let i = 0; i < this.queue.length; i++) {
      if (!this.activeLocks.has(this.queue[i].userId)) {
        taskIndex = i;
        break;
      }
    }

    if (taskIndex === -1) {
      // All tasks are currently locked by ongoing user trades
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;
    const task = this.queue.splice(taskIndex, 1)[0];
    const { userId } = task;

    // Lock user to prevent parallel order executions violating risk/balance rules
    this.activeLocks.add(userId);

    try {
      if (task.type === 'place') {
        const result = await this.executePlaceOrder(task);
        task.resolve(result);
      } else if (task.type === 'cancel') {
        const result = await this.executeCancelOrder(task);
        task.resolve(result);
      }
    } catch (err) {
      task.reject(err);
    } finally {
      this.activeLocks.delete(userId);
      // Continue processing next queue item
      setTimeout(() => this.processNext(), 50);
    }
  }

  async executePlaceOrder(task) {
    const { userId, orderId, exchangeAccountId, params } = task;
    const db = getSupabaseAdmin();

    // 1. Fetch order details from database
    const order = await orderRepo.findById(orderId);
    if (!order) throw new Error(`Order ${orderId} not found in database`);

    // 2. Fetch exchange credentials
    const { data: exchangeAccount } = await db
      .from('connected_exchanges')
      .select('*')
      .eq('id', exchangeAccountId)
      .maybeSingle();

    if (!exchangeAccount) {
      const errMsg = 'Exchange connection credentials not found';
      await orderRepo.updateStatus(orderId, 'failed', errMsg);
      await eventRepo.logEvent(orderId, 'failed', order.status, 'failed', errMsg);
      throw new Error(errMsg);
    }

    // 3. Mark as submitted
    await orderRepo.updateStatus(orderId, 'submitted');
    await eventRepo.logEvent(orderId, 'submitted', order.status, 'submitted');
    let updatedOrder = { ...order, status: 'submitted' };
    await ExecutionEvents.publishOrderUpdate(userId, updatedOrder);

    // Decrypt credentials
    const apiKey = decrypt(exchangeAccount.api_key_encrypted);
    const apiSecret = decrypt(exchangeAccount.api_secret_encrypted);
    const passphrase = exchangeAccount.api_passphrase_encrypted 
      ? decrypt(exchangeAccount.api_passphrase_encrypted) 
      : null;

    const exchangeProvider = ExchangeFactory.create(exchangeAccount.exchange_name, {
      apiKey,
      apiSecret,
      passphrase
    });

    const startTime = Date.now();
    let orderResult;
    let statusCode = 200;

    try {
      // 4. Contact exchange API via driver
      orderResult = await exchangeProvider.placeOrder({
        symbol: order.symbol,
        type: order.type,
        side: order.side,
        quantity: parseFloat(order.quantity),
        price: order.price ? parseFloat(order.price) : null,
        stopPrice: order.stop_price ? parseFloat(order.stop_price) : null,
        leverage: parseFloat(order.leverage || 1.0)
      });

      const latencyMs = Date.now() - startTime;

      // 5. Log raw exchange API response payload
      await responseRepo.logResponse(
        userId,
        orderId,
        exchangeAccount.exchange_name,
        '/order/place',
        params,
        orderResult.response,
        statusCode,
        latencyMs
      );

      // 6. Update order status and details based on fill output
      const finalStatus = orderResult.status; // 'filled', 'accepted', etc.
      await orderRepo.updateStatus(orderId, finalStatus, null, {
        exchange_order_id: orderResult.exchangeOrderId,
        filled_price: orderResult.filledPrice,
        fee: orderResult.fee
      });

      await eventRepo.logEvent(orderId, 'executed', 'submitted', finalStatus, `Filled price: ${orderResult.filledPrice}`);

      updatedOrder = {
        ...updatedOrder,
        status: finalStatus,
        exchange_order_id: orderResult.exchangeOrderId,
        filled_price: orderResult.filledPrice,
        fee: orderResult.fee,
        updated_at: new Date().toISOString()
      };

      // 7. If filled, record in executions fills database
      if (finalStatus === 'filled') {
        const execution = await execRepo.create({
          user_id: userId,
          order_id: orderId,
          exchange_account_id: exchangeAccountId,
          exchange_execution_id: `exec-${orderResult.exchangeOrderId}`,
          symbol: order.symbol,
          side: order.side,
          price: orderResult.filledPrice,
          quantity: parseFloat(order.quantity),
          fee: orderResult.fee,
          fee_asset: 'USDT'
        });
        
        ExecutionEvents.publishExecution(userId, execution);

        // Adjust real/sandbox holdings balances inside database
        await this.updatePortfolioBalances(userId, exchangeAccountId, order, orderResult);
      }

      await ExecutionEvents.publishOrderUpdate(userId, updatedOrder);
      logger.info('ExecutionQueue', `Successfully placed order ${orderId} on ${exchangeAccount.exchange_name}`);
      return updatedOrder;

    } catch (err) {
      const latencyMs = Date.now() - startTime;
      statusCode = err.statusCode || 500;
      
      // Log failed API responses
      await responseRepo.logResponse(
        userId,
        orderId,
        exchangeAccount.exchange_name,
        '/order/place',
        params,
        { error: err.message, stack: err.stack },
        statusCode,
        latencyMs
      );

      // Evaluate error type (transient retries vs permanent rejections)
      const isTransient = this.checkTransientError(err);
      if (isTransient && task.retries < 3) {
        task.retries++;
        const backoffMs = task.retries * 1500;
        logger.warn('ExecutionQueue', `Transient order failure. Retrying task in ${backoffMs}ms...`, { error: err.message });
        
        await eventRepo.logEvent(orderId, 'retry', updatedOrder.status, updatedOrder.status, `Retry ${task.retries}/3 after error: ${err.message}`);
        
        // Put task back into front of queue
        setTimeout(() => {
          this.queue.unshift(task);
          this.processNext();
        }, backoffMs);

        throw err;
      } else {
        // Mark order as rejected or failed
        const finalStatus = 'failed';
        await orderRepo.updateStatus(orderId, finalStatus, err.message);
        await eventRepo.logEvent(orderId, 'failed', updatedOrder.status, finalStatus, err.message);
        
        updatedOrder.status = finalStatus;
        updatedOrder.error_message = err.message;
        await ExecutionEvents.publishOrderUpdate(userId, updatedOrder);

        logger.error('ExecutionQueue', `Failed to execute order ${orderId}`, { error: err.message });
        throw err;
      }
    }
  }

  async executeCancelOrder(task) {
    const { userId, orderId, exchangeAccountId } = task;
    const db = getSupabaseAdmin();

    const order = await orderRepo.findById(orderId);
    if (!order) throw new Error(`Order ${orderId} not found`);

    const { data: exchangeAccount } = await db
      .from('connected_exchanges')
      .select('*')
      .eq('id', exchangeAccountId)
      .maybeSingle();

    if (!exchangeAccount) throw new Error('Exchange credentials not found');

    const apiKey = decrypt(exchangeAccount.api_key_encrypted);
    const apiSecret = decrypt(exchangeAccount.api_secret_encrypted);
    const passphrase = exchangeAccount.api_passphrase_encrypted 
      ? decrypt(exchangeAccount.api_passphrase_encrypted) 
      : null;

    const exchangeProvider = ExchangeFactory.create(exchangeAccount.exchange_name, {
      apiKey,
      apiSecret,
      passphrase
    });

    const startTime = Date.now();
    try {
      const cancelResult = await exchangeProvider.cancelOrder(order.symbol, order.exchange_order_id);
      const latencyMs = Date.now() - startTime;

      await responseRepo.logResponse(
        userId,
        orderId,
        exchangeAccount.exchange_name,
        '/order/cancel',
        { exchangeOrderId: order.exchange_order_id },
        cancelResult.response,
        200,
        latencyMs
      );

      await orderRepo.updateStatus(orderId, 'cancelled');
      await eventRepo.logEvent(orderId, 'cancelled', order.status, 'cancelled');

      const updatedOrder = {
        ...order,
        status: 'cancelled',
        updated_at: new Date().toISOString()
      };

      await ExecutionEvents.publishOrderUpdate(userId, updatedOrder);
      logger.info('ExecutionQueue', `Cancelled order ${orderId} successfully`);
      return updatedOrder;
    } catch (err) {
      const latencyMs = Date.now() - startTime;
      await responseRepo.logResponse(
        userId,
        orderId,
        exchangeAccount.exchange_name,
        '/order/cancel',
        { exchangeOrderId: order.exchange_order_id },
        { error: err.message },
        500,
        latencyMs
      );

      logger.error('ExecutionQueue', `Failed to cancel order ${orderId}`, { error: err.message });
      throw err;
    }
  }

  async updatePortfolioBalances(userId, exchangeAccountId, order, orderResult) {
    try {
      const db = getSupabaseAdmin();
      const baseSymbol = order.symbol.toUpperCase().replace('USDT', '').replace('USD', '');
      const quoteSymbol = 'USDT';

      const { data: portfolio } = await db
        .from('portfolios')
        .select('id, current_balance')
        .eq('user_id', userId)
        .maybeSingle();

      if (!portfolio) return;

      const orderCost = parseFloat(order.quantity) * orderResult.filledPrice;
      const orderFee = orderResult.fee;
      
      const { data: assets } = await db
        .from('portfolio_assets')
        .select('*')
        .eq('portfolio_id', portfolio.id);

      const baseAsset = assets.find(a => a.asset_symbol === baseSymbol);
      const quoteAsset = assets.find(a => ['USDT', 'USDC', 'USD'].includes(a.asset_symbol));

      if (order.side.toLowerCase() === 'buy') {
        // Subtract from quote
        if (quoteAsset) {
          const newQuoteBal = Math.max(0, parseFloat(quoteAsset.balance_amount) - orderCost - orderFee);
          await db.from('portfolio_assets').update({ balance_amount: newQuoteBal }).eq('id', quoteAsset.id);
        }
        // Add to base
        if (baseAsset) {
          const currentAmount = parseFloat(baseAsset.balance_amount);
          const currentEntryPrice = parseFloat(baseAsset.average_entry_price);
          const newAmount = currentAmount + parseFloat(order.quantity);
          const newEntryPrice = ((currentAmount * currentEntryPrice) + orderCost) / newAmount;
          
          await db.from('portfolio_assets').update({
            balance_amount: newAmount,
            average_entry_price: newEntryPrice
          }).eq('id', baseAsset.id);
        } else {
          await db.from('portfolio_assets').insert({
            portfolio_id: portfolio.id,
            exchange_account_id: exchangeAccountId,
            asset_symbol: baseSymbol,
            balance_amount: parseFloat(order.quantity),
            average_entry_price: orderResult.filledPrice,
            allocation_pct: 0.0,
            position_type: 'long',
            leverage: 1.0
          });
        }
      } else {
        // Add to quote
        if (quoteAsset) {
          const newQuoteBal = parseFloat(quoteAsset.balance_amount) + orderCost - orderFee;
          await db.from('portfolio_assets').update({ balance_amount: newQuoteBal }).eq('id', quoteAsset.id);
        }
        // Subtract from base
        if (baseAsset) {
          const newAmount = Math.max(0, parseFloat(baseAsset.balance_amount) - parseFloat(order.quantity));
          if (newAmount === 0) {
            await db.from('portfolio_assets').delete().eq('id', baseAsset.id);
          } else {
            await db.from('portfolio_assets').update({ balance_amount: newAmount }).eq('id', baseAsset.id);
          }
        }
      }
    } catch (err) {
      logger.warn('ExecutionQueue', 'Failed to update holdings after trade execution', { error: err.message });
    }
  }

  checkTransientError(err) {
    const msg = err.message?.toLowerCase() || '';
    return (
      msg.includes('timeout') ||
      msg.includes('network') ||
      msg.includes('econnreset') ||
      msg.includes('etimedout') ||
      msg.includes('429') ||
      msg.includes('502') ||
      msg.includes('503') ||
      msg.includes('504')
    );
  }
}

export const ExecutionQueue = new QueueManager();
