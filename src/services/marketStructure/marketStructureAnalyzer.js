/**
 * Abstract Base Class for all pluggable Market Structure Models.
 * 
 * Future models (e.g. Trend Channels, Order Blocks, Liquidity Pools) must extend this class
 * and implement the `evaluate` method.
 */
export class BaseStructureModel {
  /**
   * @param {string} name - Unique identifier for the market structure model
   * @param {number} weight - Relative weight (0.0 to 1.0) of this model in the composite structure score
   */
  constructor(name, weight = 1.0) {
    if (this.constructor === BaseStructureModel) {
      throw new Error("BaseStructureModel is abstract and cannot be instantiated directly.");
    }
    this.name = name;
    this.weight = weight;
  }

  /**
   * Evaluates market structure and bias based on the model's logic.
   * 
   * @param {number} currentPrice - Live ticker price
   * @param {Array} history - Historical OHLCV array
   * @returns {Object} { bias: 'Bullish'|'Bearish'|'Neutral', score: 0-100, explanation: string }
   */
  evaluate(currentPrice, history) {
    throw new Error("Method 'evaluate(currentPrice, history)' must be implemented by subclass.");
  }
}
