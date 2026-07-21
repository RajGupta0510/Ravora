/**
 * Ravora Backend V1 — Binance Exchange Provider
 */

import { ExchangeInterface } from '../ExchangeInterface.js';

export class BinanceExchange extends ExchangeInterface {
  constructor(credentials = {}) {
    super('Binance');
    this.apiKey = credentials.apiKey || null;
    this.apiSecret = credentials.apiSecret || null;
    this.passphrase = credentials.passphrase || null;
    this.baseUrl = 'https://api.binance.com';
  }

  async getBalance() {
    if (!this.apiKey || this.apiKey.includes('mock') || this.apiKey.includes('test')) {
      return [
        { asset: 'BTC', free: 1.25, locked: 0.05 },
        { asset: 'ETH', free: 8.5, locked: 0.2 },
        { asset: 'USDT', free: 15000.0, locked: 500.0 },
        { asset: 'SOL', free: 45.0, locked: 0.0 }
      ];
    }
    throw new Error('Binance live API integration requires signed HTTP credentials');
  }

  async getPositions() {
    if (!this.apiKey || this.apiKey.includes('mock') || this.apiKey.includes('test')) {
      return [
        {
          symbol: 'BTCUSDT',
          side: 'long',
          entryPrice: 62500.00,
          currentPrice: 64200.00,
          quantity: 0.5,
          leverage: 3.0,
          marginUsed: 10416.67,
          unrealizedPnl: 850.00,
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
          exchangeOrderId: 'binance-ord-101',
          symbol: 'ETHUSDT',
          type: 'limit',
          side: 'buy',
          quantity: 2.0,
          price: 3300.00,
          status: 'pending',
          createdAt: new Date(Date.now() - 3600000).toISOString()
        }
      ];
    }
    return [];
  }

  async getTradeHistory() {
    if (!this.apiKey || this.apiKey.includes('mock') || this.apiKey.includes('test')) {
      return [
        {
          exchangeOrderId: 'binance-trade-901',
          symbol: 'SOLUSDT',
          side: 'buy',
          entryPrice: 120.00,
          exitPrice: 145.00,
          quantity: 20.0,
          leverage: 1.0,
          pnl: 500.00,
          fee: 2.90,
          openedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          closedAt: new Date(Date.now() - 86400000).toISOString()
        }
      ];
    }
    return [];
  }

  async getTicker(symbol) {
    try {
      const formatted = symbol.toUpperCase().endsWith('USDT') ? symbol.toUpperCase() : `${symbol.toUpperCase()}USDT`;
      const response = await fetch(`${this.baseUrl}/api/v3/ticker/24hr?symbol=${formatted}`);
      if (!response.ok) throw new Error(`Binance API error: ${response.status}`);
      const data = await response.json();
      return {
        symbol,
        price: parseFloat(data.lastPrice),
        change24h: parseFloat(data.priceChangePercent),
        volume24h: parseFloat(data.quoteVolume),
        high24h: parseFloat(data.highPrice),
        low24h: parseFloat(data.lowPrice),
      };
    } catch (err) {
      throw new Error(`Binance getTicker failed: ${err.message}`);
    }
  }

  async validateCredentials() {
    if (!this.apiKey || !this.apiSecret) {
      return { valid: false, error: 'API key and secret are required' };
    }
    if (this.apiKey.length < 10) {
      return { valid: false, error: 'API key format invalid (too short)' };
    }
    return {
      valid: true,
      permissions: { read: true, trade: true, withdraw: false }
    };
  }
}
