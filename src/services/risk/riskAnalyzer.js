/**
 * Abstract Base Class for all pluggable Risk Evaluation Models.
 * 
 * Future models (e.g. CorrelationRiskModel, LiquidityRiskModel, FundingRateRiskModel)
 * must extend this class and implement the `evaluate` method.
 */
export class BaseRiskModel {
  /**
   * @param {string} name - Unique identifier for the risk model
   * @param {number} weight - Relative weight (0.0 to 1.0) of this model in the composite risk score
   */
  constructor(name, weight = 1.0) {
    if (this.constructor === BaseRiskModel) {
      throw new Error("BaseRiskModel is abstract and cannot be instantiated directly.");
    }
    this.name = name;
    this.weight = weight;
  }

  /**
   * Evaluates risk indicators and returns a risk score and context.
   * 
   * @param {Object} inputs - Combined outputs from Trend, Momentum, S&R, and Volatility engines
   * @returns {Object} { score: 0-100, isVetoed: boolean, explanation: string }
   */
  evaluate(inputs) {
    throw new Error("Method 'evaluate(inputs)' must be implemented by subclass.");
  }
}
