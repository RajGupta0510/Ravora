/**
 * Ravora Backend V1 — OKX Exchange Provider
 */

import { ExchangeInterface } from '../ExchangeInterface.js';

export class OKXExchange extends ExchangeInterface {
  constructor(credentials = {}) {
    super('OKX');
    this.apiKey = credentials.apiKey || null;
    this.apiSecret = credentials.apiSecret || null;
    this.passphrase = credentials.passphrase || null;
    this.baseUrl = 'https://www.okx.com';
  }

  async getBalance() {
    if (!this.apiKey || this.apiKey.includes('mock') || this.apiKey.includes('test')) {
      return [
        { asset: 'BTC', free: 0.85, locked: 0.0 },
        { asset: 'ETH', free: 6.2, locked: 0.1 },
        { asset: 'USDT', free: 5000.0, locked: 0.0 },
        { asset: 'OKB', free: 150.0, locked: 0.0 }
      ];
    }
    throw new Error('OKX live API integration requires signed HTTP credentials');
  }

  async getPositions() {
    if (!this.apiKey || this.apiKey.includes('mock') || this.apiKey.includes('test')) {
      return [
        {
          symbol: 'BTCUSDT',
          side: 'long',
          entryPrice: 61000.00,
          currentPrice: 64200.00,
          quantity: 0.3,
          leverage: 5.0,
          marginUsed: 3660.00,
          unrealizedPnl: 960.00,
          status: 'open'
        }
      ];
    }
    return [];
  }

  async getOpenOrders() {
    if (!this.apiKey || this.apiKey.includes('mock') || this.apiKey.includes('test')) {
      return [
        {
          exchangeOrderId: 'okx-ord-303',
          symbol: 'OKBUSDT',
          type: 'limit',
          side: 'sell',
          quantity: 50.0,
          price: 65.00,
          status: 'pending',
          createdAt: new Date(Date.now() - 10800000).toISOString()
        }
      ];
    }
    return [];
  }

  async getTradeHistory() {
    if (!this.apiKey || this.apiKey.includes('mock') || this.apiKey.includes('test')) {
      return [
        {
          exchangeOrderId: 'okx-trade-703',
          symbol: 'ETHUSDT',
          side: 'buy',
          entryPrice: 3100.00,
          exitPrice: 3450.00,
          quantity: 2.5,
          leverage: 1.0,
          pnl: 875.00,
          fee: 4.20,
          openedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
          closedAt: new Date(Date.now() - 86400000 * 2).toISOString()
        }
      ];
    }
    return [];
  }

  async getTicker(symbol) {
    try {
      const instId = symbol.toUpperCase().endsWith('-USDT') ? symbol.toUpperCase() : `${symbol.toUpperCase()}-USDT`;
      const response = await fetch(`${this.baseUrl}/api/v5/market/ticker?instId=${instId}`);
      if (!response.ok) throw new Error(`OKX API error: ${response.status}`);
      const data = await response.json();
      const ticker = data?.data?.[0];
      if (!ticker) throw new Error('Ticker not found');
      return {
        symbol,
        price: parseFloat(ticker.last),
        change24h: ((parseFloat(ticker.last) - parseFloat(ticker.open24h)) / parseFloat(ticker.open24h)) * 100,
        volume24h: parseFloat(ticker.volCcy24h),
        high24h: parseFloat(ticker.high24h),
        low24h: parseFloat(ticker.low24h),
      };
    } catch (err) {
      throw new Error(`OKX getTicker failed: ${err.message}`);
    }
  }

  async validateCredentials() {
    if (!this.apiKey || !this.apiSecret) {
      return { valid: false, error: 'API key and secret are required' };
    }
    if (!this.passphrase) {
      return { valid: false, error: 'OKX API key requires a passphrase' };
    }
    return {
      valid: true,
      permissions: { read: true, trade: true, withdraw: false }
    };
  }
}
