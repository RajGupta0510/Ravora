/**
 * Ravora Backend V1 — Position Service
 */

import { PositionRepository } from '../repositories/PositionRepository.js';
import { AuditLogRepository } from '../repositories/AuditLogRepository.js';
import { ApiError } from '../utils/ApiError.js';

const positionRepo = new PositionRepository();
const auditRepo = new AuditLogRepository();

export const PositionService = {
  async getOpenPositions(userId) {
    return positionRepo.findOpenByUserId(userId);
  },

  async getPositionById(userId, positionId) {
    const position = await positionRepo.findById(positionId);
    if (!position || position.user_id !== userId) throw ApiError.notFound('Position');
    return position;
  },

  async openPosition(userId, data) {
    const position = await positionRepo.create({
      user_id: userId,
      exchange: data.exchange,
      symbol: data.symbol,
      side: data.side,
      entry_price: data.entryPrice,
      current_price: data.entryPrice,
      quantity: data.quantity,
      leverage: data.leverage || 1,
      margin_used: data.marginUsed || 0,
      stop_loss: data.stopLoss || null,
      take_profit: data.takeProfit || null,
      status: 'open',
    });

    await auditRepo.log(userId, 'open_position', 'positions', position.id);
    return position;
  },

  async closePosition(userId, positionId, exitPrice) {
    const position = await this.getPositionById(userId, positionId);
    if (position.status !== 'open') throw ApiError.badRequest('Position is already closed');

    const multiplier = position.side === 'long' ? 1 : -1;
    const pnl = (exitPrice - position.entry_price) * position.quantity * multiplier * position.leverage;

    const closed = await positionRepo.closePosition(positionId, exitPrice, pnl);
    await auditRepo.log(userId, 'close_position', 'positions', positionId, { pnl });
    return closed;
  },

  async getAllPositions(userId, options = {}) {
    return positionRepo.findAll({ filters: { user_id: userId }, ...options });
  },
};
