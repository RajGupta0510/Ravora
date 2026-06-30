/**
 * Abstract Base Class for all pluggable Momentum Analysis Models.
 * 
 * Future models (e.g. Stochastic RSI, CCI, Momentum Oscillator) must extend this class
 * and implement the `evaluate` method.
 */
export class BaseMomentumModel {
  /**
   * @param {string} name - Unique identifier for the momentum model
   * @param {number} weight - Relative weight (0.0 to 1.0) of this model in the composite momentum score
   */
  constructor(name, weight = 1.0) {
    if (this.constructor === BaseMomentumModel) {
      throw new Error("BaseMomentumModel is abstract and cannot be instantiated directly.");
    }
    this.name = name;
    this.weight = weight;
  }

  /**
   * Evaluates momentum direction and score based on the model's logic.
   * 
   * @param {number} currentPrice - Live ticker price
   * @param {Array} history - Historical OHLCV array
   * @returns {Object} { direction: 'Strengthening'|'Weakening'|'Neutral', score: 0-100, explanation: string }
   */
  evaluate(currentPrice, history) {
    throw new Error("Method 'evaluate(currentPrice, history)' must be implemented by subclass.");
  }
}
