import { OrderRepository } from '../../repositories/OrderRepository.js';
import { ExecutionRepository } from '../../repositories/ExecutionRepository.js';
import { OrderEventRepository } from '../../repositories/OrderEventRepository.js';
import { OrderValidator } from '../validators/OrderValidator.js';
import { RiskManager } from '../risk/RiskManager.js';
import { ExecutionQueue } from '../queue/ExecutionQueue.js';
import { ApiError } from '../../utils/ApiError.js';
import { AuditLogRepository } from '../../repositories/AuditLogRepository.js';

const orderRepo = new OrderRepository();
const execRepo = new ExecutionRepository();
const eventRepo = new OrderEventRepository();
const auditRepo = new AuditLogRepository();

export const ExecutionService = {
  /**
   * Places a new trade order, routing it through risk controls and validations before enqueuing.
   */
  async placeOrder(userId, params) {
    const { exchangeAccountId, symbol, type, side, quantity, price, stopPrice, leverage = 1.0, clientOrderId } = params;

    // 1. Idempotency Guard (Client Order ID check)
    if (clientOrderId) {
      const existing = await orderRepo.findByClientId(userId, clientOrderId);
      if (existing) {
        console.log(`[ExecutionService] Idempotency match found for clientOrderId: ${clientOrderId}. Returning existing order.`);
        return existing;
      }
    }

    // 2. Validate Order Parameters & Balance Availability
    await OrderValidator.validateOrder(userId, params);

    // 3. Pre-Trade Risk Manager Checks
    await RiskManager.checkRiskControls(userId, params);

    // 4. Create Order Record in Database (Status: pending)
    const order = await orderRepo.create({
      user_id: userId,
      exchange: params.exchange || 'binance', // default fallback
      exchange_account_id: exchangeAccountId,
      symbol: symbol.toUpperCase(),
      type: type.toLowerCase(),
      side: side.toLowerCase(),
      quantity: parseFloat(quantity),
      price: price ? parseFloat(price) : null,
      stop_price: stopPrice ? parseFloat(stopPrice) : null,
      leverage: parseFloat(leverage),
      client_order_id: clientOrderId || null,
      status: 'pending'
    });

    // 5. Write audit events
    await eventRepo.logEvent(order.id, 'created', null, 'pending', 'Order initialized by user');
    await auditRepo.log(userId, 'place_order', 'orders', order.id, { symbol, side, type, quantity });

    // 6. Enqueue placement task for asynchronous execution
    ExecutionQueue.enqueue({
      type: 'place',
      userId,
      orderId: order.id,
      exchangeAccountId,
      params
    }).catch(err => {
      // Async failures in queue are logged inside worker, but we catch unhandled rejections
      console.error(`[ExecutionService] Async enqueue placeOrder failed for order ${order.id}:`, err.message);
    });

    // Return the created pending order immediately
    return order;
  },

  /**
   * Cancels a pending or open order on the exchange.
   */
  async cancelOrder(userId, orderId) {
    // Check global suspension halt
    if (RiskManager.isHalted()) {
      throw ApiError.badRequest('Cancellations are suspended during a global system halt.');
    }

    // 1. Retrieve order and check permissions
    const order = await orderRepo.findById(orderId);
    if (!order || order.user_id !== userId) {
      throw ApiError.notFound('Order not found');
    }

    // 2. Validate order status is cancellable
    const cancellableStates = ['pending', 'submitted', 'accepted', 'partially_filled'];
    if (!cancellableStates.includes(order.status)) {
      throw ApiError.badRequest(`Order cannot be cancelled in its current state: ${order.status}`);
    }

    // 3. Enqueue cancellation task
    await eventRepo.logEvent(orderId, 'cancellation_requested', order.status, order.status, 'User requested order cancellation');
    await auditRepo.log(userId, 'cancel_order', 'orders', orderId);

    const updatedOrder = await ExecutionQueue.enqueue({
      type: 'cancel',
      userId,
      orderId,
      exchangeAccountId: order.exchange_account_id
    });

    return updatedOrder;
  },

  /**
   * Retrieves specific order details
   */
  async getOrder(userId, orderId) {
    const order = await orderRepo.findById(orderId);
    if (!order || order.user_id !== userId) {
      throw ApiError.notFound('Order not found');
    }
    return order;
  },

  /**
   * Retrieves open/active orders
   */
  async getOpenOrders(userId) {
    return orderRepo.findOpenOrdersByUserId(userId);
  },

  /**
   * Retrieves order history list
   */
  async getOrderHistory(userId, options = {}) {
    return orderRepo.findByUserId(userId, options);
  },

  /**
   * Retrieves fill executions history list
   */
  async getExecutions(userId, options = {}) {
    return execRepo.findByUserId(userId, options);
  }
};
