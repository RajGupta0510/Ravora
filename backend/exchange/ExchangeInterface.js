/**
 * Ravora Backend V1 — Exchange Interface
 * Abstract contract that all exchange providers must implement.
 */

export class ExchangeInterface {
  constructor(name) {
    this.name = name;
  }

  /** Get account balance */
  async getBalance() {
    throw new Error(`${this.name}: getBalance() not implemented`);
  }

  /** Get open positions */
  async getPositions() {
    throw new Error(`${this.name}: getPositions() not implemented`);
  }

  /** Place an order */
  async placeOrder(order) {
    throw new Error(`${this.name}: placeOrder() not implemented`);
  }

  /** Cancel an order */
  async cancelOrder(orderId) {
    throw new Error(`${this.name}: cancelOrder() not implemented`);
  }

  /** Get order status */
  async getOrderStatus(orderId) {
    throw new Error(`${this.name}: getOrderStatus() not implemented`);
  }

  /** Get current ticker price */
  async getTicker(symbol) {
    throw new Error(`${this.name}: getTicker() not implemented`);
  }

  /** Get order book */
  async getOrderBook(symbol, depth = 20) {
    throw new Error(`${this.name}: getOrderBook() not implemented`);
  }

  /** Get trade history */
  async getTradeHistory(symbol, limit = 50) {
    throw new Error(`${this.name}: getTradeHistory() not implemented`);
  }

  /** Validate API credentials */
  async validateCredentials() {
    throw new Error(`${this.name}: validateCredentials() not implemented`);
  }
}
