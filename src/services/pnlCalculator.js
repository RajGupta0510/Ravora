/**
 * PnLCalculator
 * 
 * Responsibility: Pure utility class to calculate unrealized P&L, percentage return,
 * and distance to Stop Loss and Take Profits for any position.
 */
export class PnLCalculator {
  /**
   * Calculate P&L metrics for a position.
   * @param {Object} position - The active position object.
   * @param {number} currentPrice - The current market price of the asset.
   * @returns {Object} P&L metrics.
   */
  static calculatePnL(position, currentPrice) {
    const { entry_price, position_size, leverage, direction } = position;
    const sizeUSD = position_size; // Margin or size in USD
    const priceRatio = currentPrice / entry_price;
    
    let unrealizedPnL = 0;
    let percentageReturn = 0;
    
    if (direction.toUpperCase() === 'LONG') {
      unrealizedPnL = sizeUSD * leverage * (priceRatio - 1);
      percentageReturn = (priceRatio - 1) * 100 * leverage;
    } else {
      unrealizedPnL = sizeUSD * leverage * (1 - priceRatio);
      percentageReturn = (1 - priceRatio) * 100 * leverage;
    }
    
    // Calculate distance to Stop Loss
    let distanceToSL = null;
    if (position.stop_loss > 0) {
      distanceToSL = ((position.stop_loss - currentPrice) / currentPrice) * 100;
    }
    
    // Calculate distance to next Take Profit
    let distanceToTP = null;
    const tps = [position.take_profit_1, position.take_profit_2, position.take_profit_3].filter(tp => tp > 0);
    if (tps.length > 0) {
      let nextTP = tps[0];
      const status = (position.status || 'OPEN').toUpperCase();
      if (status === 'TP1 HIT' && tps.length > 1) {
        nextTP = tps[1];
      } else if (status === 'TP2 HIT' && tps.length > 2) {
        nextTP = tps[2];
      }
      distanceToTP = ((nextTP - currentPrice) / currentPrice) * 100;
    }
    
    return {
      unrealizedPnL,
      percentageReturn,
      distanceToSL,
      distanceToTP
    };
  }
}
