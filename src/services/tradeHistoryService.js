import crypto from 'crypto';
import { dbQuery, dbRun } from '../database.js';

/**
 * TradeHistoryService
 * 
 * Responsibility: Manage completed trade history logs in the database.
 */
export class TradeHistoryService {
  /**
   * Log a completed trade into history.
   */
  static async logTrade(userId, tradeData) {
    const {
      id = crypto.randomUUID(),
      assetSymbol,
      direction,
      entryPrice,
      exitPrice,
      positionSize,
      leverage,
      profitLoss,
      openTime,
      reasonClosed,
      winLoss,
      confidence,
      opportunityScore
    } = tradeData;

    await dbRun(
      `INSERT INTO paper_trade_history (
        id, user_id, asset_symbol, direction, entry_price, exit_price, position_size, leverage, profit_loss, open_time, close_time, reason_closed, win_loss, recommendation_confidence, opportunity_score
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?, ?)`,
      [
        id,
        userId,
        assetSymbol,
        direction,
        entryPrice,
        exitPrice,
        positionSize,
        leverage,
        profitLoss,
        openTime,
        reasonClosed,
        winLoss,
        confidence,
        opportunityScore
      ]
    );
  }

  /**
   * Fetch trade history for a user.
   */
  static async getHistory(userId) {
    return await dbQuery(
      'SELECT * FROM paper_trade_history WHERE user_id = ? ORDER BY close_time DESC',
      [userId]
    );
  }

  /**
   * Update notes for a trade in history.
   */
  static async updateNotes(userId, tradeId, notes) {
    await dbRun(
      'UPDATE paper_trade_history SET notes = ? WHERE id = ? AND user_id = ?',
      [notes, tradeId, userId]
    );
  }
}
