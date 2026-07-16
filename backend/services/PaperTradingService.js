/**
 * Ravora Backend V1 — Paper Trading Service
 * Completely isolated from real trading — separate tables, separate logic.
 */

import { PaperTradingRepository } from '../repositories/PaperTradingRepository.js';
import { AuditLogRepository } from '../repositories/AuditLogRepository.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

const paperRepo = new PaperTradingRepository();
const auditRepo = new AuditLogRepository();

export const PaperTradingService = {
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

  async openPosition(userId, data) {
    const account = await paperRepo.getOrCreateAccount(userId);
    const { symbol, side, entryPrice, quantity, leverage = 1, stopLoss = null, takeProfit = null } = data;

    // Calculate margin required
    const marginRequired = (entryPrice * quantity) / leverage;
    if (marginRequired > account.balance) {
      throw ApiError.badRequest(`Insufficient paper balance. Required: $${marginRequired.toFixed(2)}, Available: $${account.balance.toFixed(2)}`);
    }

    // Deduct margin from account
    await paperRepo.updateAccountBalance(account.id, account.balance - marginRequired);

    // Create the position
    const position = await paperRepo.createPosition({
      paper_account_id: account.id,
      symbol: symbol.toUpperCase(),
      side,
      entry_price: entryPrice,
      quantity,
      leverage,
      stop_loss: stopLoss,
      take_profit: takeProfit,
      status: 'open',
    });

    await auditRepo.log(userId, 'paper_open_position', 'paper_positions', position.id, { symbol, side, entryPrice, quantity });
    logger.info('PaperTrading', `Opened paper ${side} position on ${symbol} for user ${userId}`);

    return position;
  },

  async closePosition(userId, positionId, exitPrice) {
    const account = await paperRepo.getOrCreateAccount(userId);

    // Verify the position belongs to this user's account
    const positions = await paperRepo.getOpenPositions(account.id);
    const position = positions.find(p => p.id === positionId);
    if (!position) throw ApiError.notFound('Paper position');

    // Calculate P&L
    const multiplier = position.side === 'long' ? 1 : -1;
    const pnl = (exitPrice - position.entry_price) * position.quantity * multiplier * position.leverage;

    // Return margin + P&L to account
    const marginUsed = (position.entry_price * position.quantity) / position.leverage;
    const newBalance = account.balance + marginUsed + pnl;

    await paperRepo.updateAccountBalance(account.id, Math.max(0, newBalance));
    const closed = await paperRepo.closePosition(positionId, exitPrice, pnl);

    await auditRepo.log(userId, 'paper_close_position', 'paper_positions', positionId, { exitPrice, pnl });
    logger.info('PaperTrading', `Closed paper position ${positionId} with P&L: $${pnl.toFixed(2)}`);

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

  async resetAccount(userId) {
    const account = await paperRepo.getOrCreateAccount(userId);
    await paperRepo.updateAccountBalance(account.id, account.initial_balance);
    await auditRepo.log(userId, 'paper_reset_account', 'paper_accounts', account.id);
    return paperRepo.findAccountByUserId(userId);
  },
};
