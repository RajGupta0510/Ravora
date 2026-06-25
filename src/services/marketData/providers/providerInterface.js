/**
 * Abstract interface for market data providers
 */
export class MarketDataProvider {
  /**
   * Fetches latest ticker information for supported assets
   * @returns {Promise<Array<Object>>} Standardized ticker objects
   */
  async fetchTickers() {
    throw new Error('fetchTickers() not implemented by provider');
  }

  /**
   * Fetches 30-day historical prices for a specific asset symbol
   * @param {string} symbol - Asset symbol (e.g. 'BTC')
   * @returns {Promise<Array<Object>>} Standardized history objects (timestamp, open, high, low, close, volume)
   */
  async fetchHistory(symbol) {
    throw new Error('fetchHistory() not implemented by provider');
  }
}
