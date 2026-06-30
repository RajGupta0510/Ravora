import crypto from 'crypto';
import { dbGet, dbQuery, dbRun } from '../database.js';

/**
 * PositionManager
 * 
 * Responsibility: Manage active paper positions in the database.
 */
export class PositionManager {
  /**
   * Open a new position.
   */
  static async openPosition(userId, positionData) {
    const {
      symbol,
      direction,
      entryPrice,
      positionSize,
      leverage,
      stopLoss,
      takeProfit1,
      takeProfit2,
      takeProfit3,
      confidence,
      opportunityScore
    } = positionData;

    const id = 'pos-' + crypto.randomUUID().substring(0, 8);

    await dbRun(
      `INSERT INTO paper_positions (
        id, user_id, asset_symbol, direction, entry_price, position_size, leverage,
        stop_loss, take_profit_1, take_profit_2, take_profit_3, open_time, recommendation_confidence, opportunity_score, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, 'OPEN')`,
      [
        id,
        userId,
        symbol.toUpperCase(),
        direction.toUpperCase(),
        entryPrice,
        positionSize,
        leverage,
        stopLoss || null,
        takeProfit1 || null,
        takeProfit2 || null,
        takeProfit3 || null,
        confidence || null,
        opportunityScore || null
      ]
    );

    return await this.getPosition(id);
  }

  /**
   * Get a position by ID.
   */
  static async getPosition(id) {
    return await dbGet('SELECT * FROM paper_positions WHERE id = ?', [id]);
  }

  /**
   * Get all active positions for a user.
   */
  static async getActivePositions(userId) {
    return await dbQuery('SELECT * FROM paper_positions WHERE user_id = ?', [userId]);
  }

  /**
   * Get all active positions across all users (for background monitoring).
   */
  static async getAllActivePositions() {
    return await dbQuery('SELECT * FROM paper_positions');
  }

  /**
   * Update position status (e.g. when TP is hit).
   */
  static async updatePositionStatus(id, status) {
    await dbRun('UPDATE paper_positions SET status = ? WHERE id = ?', [status, id]);
  }

  /**
   * Delete a position from the active table.
   */
  static async deletePosition(id) {
    await dbRun('DELETE FROM paper_positions WHERE id = ?', [id]);
  }
}
