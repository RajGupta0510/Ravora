/**
 * Base class for all crypto signal analyzers.
 */
export class BaseAnalyzer {
  constructor(name) {
    this.name = name;
  }

  /**
   * Analyze active asset metrics
   * @param {Object} ticker - Live market ticker
   * @param {Object} assetDetails - Historical OHLCV klines and asset details
   * @param {Array<Object>} allTickers - Latest tickers of all assets (for relative calculations)
   * @returns {Object} Object containing score components, metrics, and reasoning text
   */
  analyze(ticker, assetDetails, allTickers = []) {
    throw new Error('Method "analyze" must be implemented by subclasses.');
  }
}
