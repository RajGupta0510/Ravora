/**
 * Ravora Backend V1 — Paper Trading Service
 * Completely isolated simulation engine. Supports Market, Limit, SL, TP orders.
 * Integrated with Araiven AI trading coach.
 */

import { PaperTradingRepository } from '../repositories/PaperTradingRepository.js';
import { AuditLogRepository } from '../repositories/AuditLogRepository.js';
import { MarketDataService } from './MarketDataService.js';
import { AiService } from '../ai/services/AiService.js';
import { sendToUser } from '../websocket/WebSocketServer.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

const paperRepo = new PaperTradingRepository();
const auditRepo = new AuditLogRepository();

export const PaperTradingService = {
  // Configurable fees & slippage penalties
  FEE_PCT: 0.001,       // 0.1% virtual exchange fee
  SLIPPAGE_PCT: 0.0005, // 0.05% slippage

  async getAccount(userId) {
    return paperRepo.getOrCreateAccount(userId);
  },

  async getOpenPositions(userId) {
    const account = await paperRepo.getOrCreateAccount(userId);
    return paperRepo.getOpenPositions(account.id);
  },

  async getTradeHistory(userId, limit = 50) {
    const account = await paperRepo.getOrCreateAccount(userId);
    return paperRepo.getClosedPositions(account.id, limit);
  },

  /**
   * Places a paper order (Market, Limit, Stop Loss, or Take Profit).
   */
  async placeOrder(userId, data) {
    const account = await paperRepo.getOrCreateAccount(userId);
    const { symbol, type, side, quantity, price, leverage = 1.0, stopLoss = null, takeProfit = null } = data;

    if (!symbol || !type || !side || !quantity) {
      throw ApiError.badRequest('symbol, type, side, and quantity are required.');
    }

    const currentPrice = await MarketDataService.getCurrentPrice(symbol);
    const targetPrice = type === 'market' ? currentPrice : parseFloat(price);

    if (!targetPrice || targetPrice <= 0) {
      throw ApiError.badRequest(`Invalid execution/trigger price: $${targetPrice}`);
    }

    // Calculate order margin required
    const orderCost = quantity * targetPrice;
    const marginRequired = orderCost / parseFloat(leverage);

    if (marginRequired > account.balance) {
      throw ApiError.badRequest(`Insufficient virtual buying power. Required: $${marginRequired.toFixed(2)}, Available: $${account.balance.toFixed(2)}`);
    }

    // Deduct/lock margin immediately to prevent double-spending in virtual accounts
    await paperRepo.updateAccountBalance(account.id, account.balance - marginRequired);

    // Create the order
    const order = await paperRepo.createOrder({
      paper_account_id: account.id,
      symbol: symbol.toUpperCase(),
      type: type.toLowerCase(),
      side: side.toLowerCase(),
      quantity: parseFloat(quantity),
      price: targetPrice,
      status: 'pending'
    });

    logger.info('PaperTrading', `Placed pending paper ${type} order for ${symbol} (${side})`);

    // Market orders fill immediately
    if (type.toLowerCase() === 'market') {
      return this.executeOrderFill(userId, account, order, currentPrice, leverage, stopLoss, takeProfit);
    }

    // Broadcast pending order update
    sendToUser(userId, 'paper_order_placed', order);

    return order;
  },

  /**
   * Executes a virtual fill and creates/updates a position
   */
  async executeOrderFill(userId, account, order, price, leverage = 1.0, stopLoss = null, takeProfit = null) {
    // Apply slippage penalty based on side
    const slippageFactor = order.side === 'buy' ? (1 + this.SLIPPAGE_PCT) : (1 - this.SLIPPAGE_PCT);
    const filledPrice = price * slippageFactor;

    // Calculate transaction fee
    const cost = order.quantity * filledPrice;
    const fee = cost * this.FEE_PCT;

    // Deduct virtual fee from account
    await paperRepo.updateAccountBalance(account.id, account.balance - fee);

    // Update order status to filled
    const filledOrder = await paperRepo.updateOrderStatus(order.id, 'filled', filledPrice, new Date().toISOString());

    // Check if there is an existing open position for this symbol
    const openPositions = await paperRepo.getOpenPositions(account.id);
    const existingPos = openPositions.find(p => p.symbol === order.symbol && p.side === (order.side === 'buy' ? 'long' : 'short'));

    let position;
    if (existingPos) {
      // Merge/average position
      const newQty = existingPos.quantity + order.quantity;
      const newEntry = ((existingPos.entry_price * existingPos.quantity) + (filledPrice * order.quantity)) / newQty;
      
      // Update entry price and qty in database
      const { data, error } = await paperRepo.db
        .from('paper_positions')
        .update({
          quantity: newQty,
          entry_price: newEntry
        })
        .eq('id', existingPos.id)
        .select()
        .single();
      if (error) throw error;
      position = data;
    } else {
      // Create new position
      position = await paperRepo.createPosition({
        paper_account_id: account.id,
        symbol: order.symbol,
        side: order.side === 'buy' ? 'long' : 'short',
        entry_price: filledPrice,
        quantity: order.quantity,
        leverage,
        stop_loss: stopLoss,
        take_profit: takeProfit,
        status: 'open'
      });
    }

    // Real-time WebSocket notifications
    sendToUser(userId, 'paper_order_filled', filledOrder);
    sendToUser(userId, 'paper_position_updated', position);

    await auditRepo.log(userId, 'paper_order_filled', 'paper_orders', order.id, { filledPrice, positionId: position.id });
    logger.info('PaperTrading', `Filled paper order ${order.id} at $${filledPrice.toFixed(2)}`);

    return filledOrder;
  },

  /**
   * Cancels a pending order and restores the locked margin
   */
  async cancelOrder(userId, orderId) {
    const account = await paperRepo.getOrCreateAccount(userId);
    const { data: order, error } = await paperRepo.db
      .from('paper_orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle();

    if (error || !order || order.paper_account_id !== account.id) {
      throw ApiError.notFound('Paper order not found');
    }

    if (order.status !== 'pending') {
      throw ApiError.badRequest(`Cannot cancel order in status: ${order.status}`);
    }

    // Restore locked margin
    const marginRequired = (order.price * order.quantity); // rough estimate
    await paperRepo.updateAccountBalance(account.id, account.balance + marginRequired);

    // Cancel order
    const cancelled = await paperRepo.updateOrderStatus(orderId, 'cancelled');
    sendToUser(userId, 'paper_order_cancelled', cancelled);

    await auditRepo.log(userId, 'paper_order_cancelled', 'paper_orders', orderId);
    return cancelled;
  },

  /**
   * Closes an open position manually
   */
  async closePosition(userId, positionId, exitPrice) {
    const account = await paperRepo.getOrCreateAccount(userId);

    const positions = await paperRepo.getOpenPositions(account.id);
    const position = positions.find(p => p.id === positionId);
    if (!position) throw ApiError.notFound('Paper position');

    // Calculate P&L
    const multiplier = position.side === 'long' ? 1 : -1;
    const rawPnl = (exitPrice - position.entry_price) * position.quantity * multiplier * position.leverage;

    // Apply slippage penalty to exit price
    const slippageMultiplier = position.side === 'long' ? (1 - this.SLIPPAGE_PCT) : (1 + this.SLIPPAGE_PCT);
    const finalExitPrice = exitPrice * slippageMultiplier;

    // Calculate final P&L and transaction fee
    const exitValue = position.quantity * finalExitPrice;
    const fee = exitValue * this.FEE_PCT;
    const pnl = ((finalExitPrice - position.entry_price) * position.quantity * multiplier * position.leverage) - fee;

    // Return margin + P&L to account
    const marginUsed = (position.entry_price * position.quantity) / position.leverage;
    const newBalance = account.balance + marginUsed + pnl;

    // Trigger Araiven AI coach reviews using local rule-based analysis
    let coachReview = null;
    try {
      const { MarketProviderFactory } = await import('../market/MarketProviderFactory.js');
      const { TechnicalIndicators } = await import('../ai/reasoning/TechnicalIndicators.js');
      const { RuleBasedReviewEngine } = await import('../ai/reasoning/RuleBasedReviewEngine.js');

      const provider = MarketProviderFactory.create('binance');
      const candles = await provider.fetchHistory(position.symbol, '1d', 30).catch(() => []);
      
      const indicators = {};
      if (candles && candles.length >= 14) {
        const closes = candles.map(c => c.close);
        const rsi14 = TechnicalIndicators.calculateRSI(closes, 14);
        indicators.rsi = rsi14[rsi14.length - 1];
        
        const sma20 = TechnicalIndicators.calculateSMA(closes, 20);
        const currentPrice = closes[closes.length - 1];
        indicators.trend = currentPrice >= (sma20[sma20.length - 1] || currentPrice) ? 'bullish' : 'bearish';
      }

      coachReview = RuleBasedReviewEngine.generateReview({
        symbol: position.symbol,
        side: position.side === 'long' ? 'buy' : 'sell',
        quantity: position.quantity,
        price: position.entry_price,
        exitPrice: finalExitPrice,
        pnl,
        leverage: position.leverage,
        stopLoss: position.stop_loss,
        takeProfit: position.take_profit
      }, indicators);
    } catch (err) {
      logger.warn('PaperTrading', 'Rule-based trade coaching review generation failed', { error: err.message });
    }

    // Persist closed status and the AI review JSON
    const closed = await paperRepo.closePosition(positionId, finalExitPrice, pnl, coachReview);
    await paperRepo.updateAccountBalance(account.id, Math.max(0, newBalance));

    // Real-time WebSocket notifications
    sendToUser(userId, 'paper_position_closed', closed);
    sendToUser(userId, 'paper_balance_updated', { balance: Math.max(0, newBalance) });

    await auditRepo.log(userId, 'paper_close_position', 'paper_positions', positionId, { exitPrice: finalExitPrice, pnl });
    logger.info('PaperTrading', `Closed position ${positionId} with P&L: $${pnl.toFixed(2)}`);

    return closed;
  },

  async closeAllPositions(userId, getCurrentPrice) {
    const account = await paperRepo.getOrCreateAccount(userId);
    const openPositions = await paperRepo.getOpenPositions(account.id);

    const results = [];
    for (const pos of openPositions) {
      const currentPrice = await getCurrentPrice(pos.symbol);
      const result = await this.closePosition(userId, pos.id, currentPrice);
      results.push(result);
    }

    return results;
  },

  /**
   * Resets virtual accounts, wiping positions and restoring balance
   */
  async resetAccount(userId) {
    const account = await paperRepo.getOrCreateAccount(userId);
    await paperRepo.clearAccountData(account.id);
    await paperRepo.updateAccountBalance(account.id, account.initial_balance);
    
    sendToUser(userId, 'paper_account_reset', { balance: account.initial_balance });
    await auditRepo.log(userId, 'paper_reset_account', 'paper_accounts', account.id);

    return paperRepo.findAccountByUserId(userId);
  },

  /**
   * Scans and processes pending virtual limit/stop orders
   */
  async processPendingOrders() {
    try {
      const pendingOrders = await paperRepo.getPendingOrders();
      if (pendingOrders.length === 0) return;

      logger.debug('PaperTrading', `Processing ${pendingOrders.length} pending paper orders...`);

      for (const order of pendingOrders) {
        // Fetch current price
        const currentPrice = await MarketDataService.getCurrentPrice(order.symbol);
        if (!currentPrice || currentPrice <= 0) continue;

        let shouldTrigger = false;

        // Buy Limit: execute if market drops below target limit price
        if (order.side === 'buy' && order.type === 'limit' && currentPrice <= order.price) {
          shouldTrigger = true;
        }
        // Sell Limit: execute if market climbs above target limit price
        else if (order.side === 'sell' && order.type === 'limit' && currentPrice >= order.price) {
          shouldTrigger = true;
        }
        // Stop Loss: execute if triggered
        else if (order.side === 'sell' && order.type === 'stop_loss' && currentPrice <= order.price) {
          shouldTrigger = true;
        }
        else if (order.side === 'buy' && order.type === 'stop_loss' && currentPrice >= order.price) {
          shouldTrigger = true;
        }
        // Take Profit: execute if triggered
        else if (order.side === 'sell' && order.type === 'take_profit' && currentPrice >= order.price) {
          shouldTrigger = true;
        }
        else if (order.side === 'buy' && order.type === 'take_profit' && currentPrice <= order.price) {
          shouldTrigger = true;
        }

        if (shouldTrigger) {
          // Resolve userId from account relation
          const { data: account } = await paperRepo.db
            .from('paper_accounts')
            .select('user_id, balance')
            .eq('id', order.paper_account_id)
            .single();

          if (account) {
            await this.executeOrderFill(account.user_id, { id: order.paper_account_id, balance: account.balance }, order, currentPrice);
          }
        }
      }
    } catch (err) {
      logger.error('PaperTrading', 'Order matching loop error', { error: err.message });
    }
  },

  /**
   * Calculates performance metrics (Win Rate, Profit Factor, Streaks, Max Drawdowns)
   */
  async getStatistics(userId) {
    const account = await paperRepo.getOrCreateAccount(userId);
    const closed = await paperRepo.getClosedPositions(account.id, 100); // lookback 100 trades

    if (closed.length === 0) {
      return { winRate: 0, lossRate: 0, profitFactor: 0, maxDrawdown: 0, currentStreak: 0, totalTrades: 0 };
    }

    const wins = closed.filter(c => parseFloat(c.pnl || 0) > 0);
    const losses = closed.filter(c => parseFloat(c.pnl || 0) <= 0);

    const total = closed.length;
    const winRate = (wins.length / total) * 100;
    const lossRate = (losses.length / total) * 100;

    const grossProfit = wins.reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0);
    const grossLoss = Math.abs(losses.reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0));
    const profitFactor = grossLoss === 0 ? grossProfit : grossProfit / grossLoss;

    // Largest Win / Loss
    const pnls = closed.map(c => parseFloat(c.pnl || 0));
    const largestWin = Math.max(...pnls, 0);
    const largestLoss = Math.min(...pnls, 0);

    // Streak calculation (current streak of consecutive wins or losses)
    let currentStreak = 0;
    let streakType = null; // 'win' or 'loss'

    for (const trade of closed) {
      const isWin = parseFloat(trade.pnl || 0) > 0;
      if (streakType === null) {
        streakType = isWin ? 'win' : 'loss';
        currentStreak = 1;
      } else if ((streakType === 'win' && isWin) || (streakType === 'loss' && !isWin)) {
        currentStreak++;
      } else {
        break; // Streak broken
      }
    }

    // Max Drawdown calculation
    let maxDrawdown = 0;
    let peak = parseFloat(account.initial_balance);
    let runningBalance = peak;

    // Build chronological balance curve
    const chronoPnls = [...pnls].reverse(); // oldest to newest
    for (const pnl of chronoPnls) {
      runningBalance += pnl;
      if (runningBalance > peak) peak = runningBalance;
      const dd = ((peak - runningBalance) / peak) * 100;
      if (dd > maxDrawdown) maxDrawdown = dd;
    }

    // Average holding time in minutes
    let totalHoldingMs = 0;
    closed.forEach(c => {
      if (c.closed_at) {
        totalHoldingMs += (new Date(c.closed_at).getTime() - new Date(c.created_at).getTime());
      }
    });
    const avgHoldingTimeMins = totalHoldingMs / total / 60000;

    return {
      totalTrades: total,
      winRate: Math.round(winRate * 100) / 100,
      lossRate: Math.round(lossRate * 100) / 100,
      profitFactor: Math.round(profitFactor * 100) / 100,
      largestWin: Math.round(largestWin * 100) / 100,
      largestLoss: Math.round(largestLoss * 100) / 100,
      maxDrawdown: Math.round(maxDrawdown * 100) / 100,
      currentStreak: streakType === 'win' ? currentStreak : -currentStreak,
      avgHoldingTimeMins: Math.round(avgHoldingTimeMins * 10) / 10
    };
  }
};
export default PaperTradingService;
