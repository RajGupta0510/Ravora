/**
 * Abstract Base Class for all pluggable Trend Analysis Models.
 * 
 * Future models (e.g. Ichimoku, SuperTrend, Trend Channels) must extend this class
 * and implement the `evaluate` method.
 */
export class BaseTrendModel {
  /**
   * @param {string} name - Unique identifier for the trend model
   * @param {number} weight - Relative weight (0.0 to 1.0) of this model in the composite trend score
   */
  constructor(name, weight = 1.0) {
    if (this.constructor === BaseTrendModel) {
      throw new Error("BaseTrendModel is abstract and cannot be instantiated directly.");
    }
    this.name = name;
    this.weight = weight;
  }

  /**
   * Evaluates trend direction and strength based on the model's logic.
   * 
   * @param {number} currentPrice - Live ticker price
   * @param {Array} history - Historical OHLCV array
   * @returns {Object} { direction: 'Bullish'|'Bearish'|'Sideways', strength: 0-100, explanation: string }
   */
  evaluate(currentPrice, history) {
    throw new Error("Method 'evaluate(currentPrice, history)' must be implemented by subclass.");
  }
}
