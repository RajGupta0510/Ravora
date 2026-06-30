/**
 * Risk Utilities
 * 
 * Implements quantitative risk calculations including position sizing (Fixed Fractional)
 * and the Kelly Criterion.
 */

/**
 * Calculates the recommended position size based on capital, risk percentage, and stop-loss distance.
 * 
 * Formula: Position Size = (Capital * RiskPercent) / StopLossPercent
 * 
 * @param {number} capital - Total account capital (e.g., $100,000)
 * @param {number} riskPercent - Percentage of capital to risk per trade (e.g., 0.01 for 1%)
 * @param {number} entryPrice - Suggested entry price
 * @param {number} stopLossPrice - Suggested stop-loss price
 * @returns {number} Recommended position size in USD (or base currency)
 */
export function calculatePositionSize(capital, riskPercent, entryPrice, stopLossPrice) {
  if (!capital || !entryPrice || !stopLossPrice || entryPrice === stopLossPrice) {
    return 0;
  }

  const stopLossPercent = Math.abs(entryPrice - stopLossPrice) / entryPrice;
  if (stopLossPercent === 0) return 0;

  const positionSize = (capital * riskPercent) / stopLossPercent;
  // Cap position size at 100% of capital (no leverage by default for this calculation)
  return Math.round(Math.min(capital, positionSize) * 100) / 100;
}

/**
 * Calculates the Kelly Criterion percentage.
 * Kelly % = W - (1 - W) / R
 * Where W = Win Probability (Confidence), R = Risk/Reward Ratio
 * 
 * @param {number} winProbability - Win probability between 0.0 and 1.0
 * @param {number} riskRewardRatio - Risk/Reward ratio (e.g., 2.5)
 * @returns {number} Recommended Kelly fraction (0.0 to 1.0)
 */
export function calculateKellyPercentage(winProbability, riskRewardRatio) {
  if (!winProbability || !riskRewardRatio || riskRewardRatio <= 0) return 0;
  const kelly = winProbability - (1 - winProbability) / riskRewardRatio;
  return Math.max(0, Math.min(1.0, kelly)); // Clamp between 0% and 100%
}
