import { ExchangeInterface } from '../ExchangeInterface.js';

export class CoinbaseExchange extends ExchangeInterface {
  constructor(credentials = {}) {
    super('Coinbase');
    this.apiKey = credentials.apiKey || null;
    this.apiSecret = credentials.apiSecret || null;
  }

  async getBalance() {
    if (!this.apiKey || this.apiKey.includes('mock') || this.apiKey.includes('test')) {
      // Return simulated Coinbase balances
      return [
        { asset: 'BTC', free: 0.15, locked: 0.0 },
        { asset: 'SOL', free: 24.5, locked: 0.0 },
        { asset: 'USDC', free: 12500.0, locked: 0.0 }
      ];
    }
    throw new Error('Coinbase API integration requires live signed requests');
  }

  async getPositions() {
    return [];
  }

  async getTradeHistory() {
    return [];
  }

  async validateCredentials() {
    if (!this.apiKey || !this.apiSecret) {
      return { valid: false, error: 'API key and secret are required' };
    }
    return { valid: true };
  }
}
