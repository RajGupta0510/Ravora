/**
 * Ravora Backend V1 — Exchange Interface
 * Abstract contract that all exchange providers must implement.
 */

export class ExchangeInterface {
  constructor(name) {
    this.name = name;
  }

  /**
   * Get wallet & spot balance details
   * @returns {Promise<Array<{ asset: string, free: number, locked: number }>>}
   */
  async getBalance() {
    throw new Error(`${this.name}: getBalance() not implemented`);
  }

  /**
   * Get active margin & futures positions
   * @returns {Promise<Array<{ symbol: string, side: string, entryPrice: number, currentPrice: number, quantity: number, leverage: number, marginUsed: number, unrealizedPnl: number, status: string }>>}
   */
  async getPositions() {
    throw new Error(`${this.name}: getPositions() not implemented`);
  }

  /**
   * Get active open orders
   * @returns {Promise<Array<{ exchangeOrderId: string, symbol: string, type: string, side: string, quantity: number, price: number, status: string, createdAt: string }>>}
   */
  async getOpenOrders() {
    throw new Error(`${this.name}: getOpenOrders() not implemented`);
  }

  /**
   * Get historical completed trades
   * @returns {Promise<Array<{ exchangeOrderId: string, symbol: string, side: string, entryPrice: number, exitPrice: number, quantity: number, leverage: number, pnl: number, fee: number, openedAt: string, closedAt: string }>>}
   */
  async getTradeHistory() {
    throw new Error(`${this.name}: getTradeHistory() not implemented`);
  }

  /** Get current ticker price */
  async getTicker(symbol) {
    throw new Error(`${this.name}: getTicker() not implemented`);
  }

  /** Get order book */
  async getOrderBook(symbol, depth = 20) {
    throw new Error(`${this.name}: getOrderBook() not implemented`);
  }

  /** Validate API credentials & permissions */
  async validateCredentials() {
    throw new Error(`${this.name}: validateCredentials() not implemented`);
  }
}
