/**
 * Abstract Base Class for all pluggable Support & Resistance Level Models.
 * 
 * Future models (e.g. Fibonacci Retracement, Pivot Points, Moving Average levels)
 * must extend this class and implement the `detectLevels` method.
 */
export class BaseLevelModel {
  /**
   * @param {string} name - Unique identifier for the level model
   * @param {number} weight - Relative weight (0.0 to 1.0) of this model in the composite level score
   */
  constructor(name, weight = 1.0) {
    if (this.constructor === BaseLevelModel) {
      throw new Error("BaseLevelModel is abstract and cannot be instantiated directly.");
    }
    this.name = name;
    this.weight = weight;
  }

  /**
   * Identifies significant support and resistance levels.
   * 
   * @param {number} currentPrice - Live ticker price
   * @param {Array} history - Historical OHLCV array
   * @returns {Object} { supports: Array<{price, strength}>, resistances: Array<{price, strength}>, explanation: string }
   */
  detectLevels(currentPrice, history) {
    throw new Error("Method 'detectLevels(currentPrice, history)' must be implemented by subclass.");
  }
}
