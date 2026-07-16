/**
 * Ravora Backend V1 — Market Data Provider Interface
 */

export class MarketProviderInterface {
  constructor(name) {
    this.name = name;
  }

  async fetchTickers(symbols) {
    throw new Error(`${this.name}: fetchTickers() not implemented`);
  }

  async fetchHistory(symbol, days = 30) {
    throw new Error(`${this.name}: fetchHistory() not implemented`);
  }

  async fetchOrderBook(symbol, depth = 20) {
    throw new Error(`${this.name}: fetchOrderBook() not implemented`);
  }
}
