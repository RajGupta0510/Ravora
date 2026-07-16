/**
 * Ravora Backend V1 — Binance Exchange Provider
 * Skeleton implementation — methods throw until real API integration is built.
 */

import { ExchangeInterface } from '../ExchangeInterface.js';

export class BinanceExchange extends ExchangeInterface {
  constructor(credentials = {}) {
    super('Binance');
    this.apiKey = credentials.apiKey || null;
    this.apiSecret = credentials.apiSecret || null;
    this.baseUrl = 'https://api.binance.com';
  }

  async getBalance() {
    // Future: GET /api/v3/account
    throw new Error('Binance: Real trading not connected yet. Use paper trading.');
  }

  async getPositions() {
    // Future: GET /fapi/v2/positionRisk
    throw new Error('Binance: Real trading not connected yet.');
  }

  async placeOrder(order) {
    // Future: POST /api/v3/order
    throw new Error('Binance: Real trading not connected yet.');
  }

  async cancelOrder(orderId) {
    // Future: DELETE /api/v3/order
    throw new Error('Binance: Real trading not connected yet.');
  }

  async getOrderStatus(orderId) {
    // Future: GET /api/v3/order
    throw new Error('Binance: Real trading not connected yet.');
  }

  async getTicker(symbol) {
    // This one we can implement — it's public data
    try {
      const response = await fetch(`${this.baseUrl}/api/v3/ticker/24hr?symbol=${symbol}USDT`);
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
    // Future: make a signed request to verify
    return { valid: false, error: 'Credential validation not implemented yet' };
  }
}
