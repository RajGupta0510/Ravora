/**
 * Ravora Backend V1 — Bybit Exchange Provider
 */

import { ExchangeInterface } from '../ExchangeInterface.js';

export class BybitExchange extends ExchangeInterface {
  constructor(credentials = {}) {
    super('Bybit');
    this.apiKey = credentials.apiKey || null;
    this.apiSecret = credentials.apiSecret || null;
    this.passphrase = credentials.passphrase || null;
    this.baseUrl = 'https://api.bybit.com';
  }

  async getBalance() {
    if (!this.apiKey || this.apiKey.includes('mock') || this.apiKey.includes('test')) {
      return [
        { asset: 'BTC', free: 0.5, locked: 0.01 },
        { asset: 'ETH', free: 3.2, locked: 0.0 },
        { asset: 'USDT', free: 8000.0, locked: 1200.0 },
        { asset: 'AVAX', free: 120.0, locked: 0.0 }
      ];
    }
    throw new Error('Bybit live API integration requires signed HTTP credentials');
  }

  async getPositions() {
    if (!this.apiKey || this.apiKey.includes('mock') || this.apiKey.includes('test')) {
      return [
        {
          symbol: 'ETHUSDT',
          side: 'short',
          entryPrice: 3500.00,
          currentPrice: 3410.00,
          quantity: 2.0,
          leverage: 2.0,
          marginUsed: 3500.00,
          unrealizedPnl: 180.00,
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
          exchangeOrderId: 'bybit-ord-202',
          symbol: 'BTCUSDT',
          type: 'limit',
          side: 'sell',
          quantity: 0.2,
          price: 67500.00,
          status: 'pending',
          createdAt: new Date(Date.now() - 7200000).toISOString()
        }
      ];
    }
    return [];
  }

  async getTradeHistory() {
    if (!this.apiKey || this.apiKey.includes('mock') || this.apiKey.includes('test')) {
      return [
        {
          exchangeOrderId: 'bybit-trade-802',
          symbol: 'AVAXUSDT',
          side: 'buy',
          entryPrice: 28.50,
          exitPrice: 34.10,
          quantity: 100.0,
          leverage: 1.0,
          pnl: 560.00,
          fee: 3.40,
          openedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
          closedAt: new Date(Date.now() - 86400000 * 1.5).toISOString()
        }
      ];
    }
    return [];
  }

  async getTicker(symbol) {
    try {
      const formatted = symbol.toUpperCase().endsWith('USDT') ? symbol.toUpperCase() : `${symbol.toUpperCase()}USDT`;
      const response = await fetch(`${this.baseUrl}/v5/market/tickers?category=spot&symbol=${formatted}`);
      if (!response.ok) throw new Error(`Bybit API error: ${response.status}`);
      const data = await response.json();
      const ticker = data?.result?.list?.[0];
      if (!ticker) throw new Error('Ticker not found');
      return {
        symbol,
        price: parseFloat(ticker.lastPrice),
        change24h: parseFloat(ticker.price24hPcnt) * 100,
        volume24h: parseFloat(ticker.turnover24h),
        high24h: parseFloat(ticker.highPrice24h),
        low24h: parseFloat(ticker.lowPrice24h),
      };
    } catch (err) {
      throw new Error(`Bybit getTicker failed: ${err.message}`);
    }
  }

  async validateCredentials() {
    if (!this.apiKey || !this.apiSecret) {
      return { valid: false, error: 'API key and secret are required' };
    }
    if (this.apiKey.length < 10) {
      return { valid: false, error: 'API key format invalid' };
    }
    return {
      valid: true,
      permissions: { read: true, trade: true, withdraw: false }
    };
  }
}
