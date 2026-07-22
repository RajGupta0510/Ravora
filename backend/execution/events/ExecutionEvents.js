import { sendToUser } from '../../websocket/WebSocketServer.js';
import { WS_EVENTS } from '../../config/constants.js';
import { PortfolioIntelligenceService } from '../../services/PortfolioIntelligenceService.js';
import { logger } from '../../utils/logger.js';

export const ExecutionEvents = {
  /**
   * Broadcasts order status changes to the user's WebSocket clients.
   */
  async publishOrderUpdate(userId, order) {
    try {
      sendToUser(userId, WS_EVENTS.TRADE_UPDATE || 'trade:update', {
        type: 'order_update',
        orderId: order.id,
        symbol: order.symbol,
        exchange: order.exchange,
        type_name: order.type,
        side: order.side,
        quantity: parseFloat(order.quantity),
        price: order.price ? parseFloat(order.price) : null,
        filledPrice: order.filled_price ? parseFloat(order.filled_price) : null,
        status: order.status,
        errorMessage: order.error_message || null,
        timestamp: order.updated_at || order.created_at
      });

      // Trigger portfolio metric recalculations and broadcast new balance details
      const summary = await PortfolioIntelligenceService.calculatePerformanceSummary(userId).catch(() => null);
      if (summary) {
        sendToUser(userId, WS_EVENTS.PORTFOLIO_UPDATE || 'portfolio:update', summary);
      }
    } catch (err) {
      logger.error('ExecutionEvents', 'Failed to publish order update', { error: err.message });
    }
  },

  /**
   * Broadcasts fill executions to the user's WebSocket clients.
   */
  publishExecution(userId, execution) {
    sendToUser(userId, 'execution:new', {
      id: execution.id,
      orderId: execution.order_id,
      symbol: execution.symbol,
      side: execution.side,
      price: parseFloat(execution.price),
      quantity: parseFloat(execution.quantity),
      fee: parseFloat(execution.fee || 0),
      feeAsset: execution.fee_asset,
      createdAt: execution.created_at
    });
  }
};
