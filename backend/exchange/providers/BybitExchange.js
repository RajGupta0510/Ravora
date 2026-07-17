/**
 * Ravora Backend V1 — Bybit Exchange Provider
 * Skeleton implementation.
 */

import { ExchangeInterface } from '../ExchangeInterface.js';

export class BybitExchange extends ExchangeInterface {
  constructor(credentials = {}) {
    super('Bybit');
    this.apiKey = credentials.apiKey || null;
    this.apiSecret = credentials.apiSecret || null;
    this.baseUrl = 'https://api.bybit.com';
  }

  async getBalance() {
    if (!this.apiKey || this.apiKey.includes('mock') || this.apiKey.includes('test')) {
      return [
        { asset: 'BTC', free: 0.5, locked: 0.0 },
        { asset: 'ETH', free: 3.2, locked: 0.0 },
        { asset: 'USDT', free: 8000.0, locked: 0.0 }
      ];
    }
    throw new Error('Bybit API integration requires live signed requests');
  }

  async getPositions() {
    return [];
  }

  async placeOrder(order) {
    throw new Error('Bybit: Real trading not connected yet.');
  }

  async cancelOrder(orderId) {
    throw new Error('Bybit: Real trading not connected yet.');
  }

  async getOrderStatus(orderId) {
    throw new Error('Bybit: Real trading not connected yet.');
  }

  async getTicker(symbol) {
    try {
      const response = await fetch(`${this.baseUrl}/v5/market/tickers?category=spot&symbol=${symbol}USDT`);
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
    return { valid: true };
  }
}
