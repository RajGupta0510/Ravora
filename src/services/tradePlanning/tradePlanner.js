/**
 * Abstract Base Class for all pluggable Trade Planning Models.
 * 
 * Future models (e.g. BreakoutTradeModel, MeanReversionTradeModel, ReversalTradeModel)
 * must extend this class and implement the `generatePlan` method.
 */
export class BaseTradeModel {
  /**
   * @param {string} name - Unique identifier for the trade planning model
   */
  constructor(name) {
    if (this.constructor === BaseTradeModel) {
      throw new Error("BaseTradeModel is abstract and cannot be instantiated directly.");
    }
    this.name = name;
  }

  /**
   * Generates a trade plan based on market analysis.
   * 
   * @param {Object} inputs - Combined outputs from Trend, Momentum, S&R, Risk, and Scoring engines
   * @returns {Object} Complete trade plan
   */
  generatePlan(inputs) {
    throw new Error("Method 'generatePlan(inputs)' must be implemented by subclass.");
  }
}
