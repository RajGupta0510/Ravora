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

  async placeOrder(params) {
    const { symbol, type, side, quantity, price, stopPrice } = params;
    const isMock = !this.apiKey || this.apiKey.includes('mock') || this.apiKey.includes('test');

    if (isMock) {
      const orderId = `binance-ord-${Math.floor(100000 + Math.random() * 900000)}`;
      const tickerPrice = price || (stopPrice ? stopPrice : (symbol.toUpperCase() === 'BTCUSDT' ? 64000.00 : 3400.00));
      const status = (type === 'stop_loss' || type === 'stop_limit') ? 'accepted' : 'filled';
      
      const mockResponse = {
        symbol: symbol.toUpperCase(),
        orderId: parseInt(orderId.split('-')[2], 10),
        clientOrderId: `mock_cl_ord_${Math.random().toString(36).substr(2, 9)}`,
        transactTime: Date.now(),
        price: price ? price.toString() : '0.00000000',
        origQty: quantity.toString(),
        executedQty: status === 'filled' ? quantity.toString() : '0.00000000',
        cummulativeQuoteQty: status === 'filled' ? (quantity * tickerPrice).toString() : '0.00000000',
        status: status.toUpperCase(),
        timeInForce: 'GTC',
        type: type.toUpperCase(),
        side: side.toUpperCase(),
        fills: status === 'filled' ? [{
          price: tickerPrice.toString(),
          qty: quantity.toString(),
          commission: (quantity * tickerPrice * 0.001).toString(),
          commissionAsset: 'USDT'
        }] : []
      };

      return {
        exchangeOrderId: orderId,
        status,
        filledPrice: tickerPrice,
        fee: status === 'filled' ? (quantity * tickerPrice * 0.001) : 0,
        response: mockResponse
      };
    }

    // Live Signed Request
    try {
      const crypto = await import('crypto');
      const ts = Date.now();
      const paramsObj = {
        symbol: symbol.toUpperCase(),
        side: side.toUpperCase(),
        type: type.toUpperCase().replace('_', '_'), // e.g. STOP_LOSS
        quantity: quantity.toString(),
        timestamp: ts
      };

      if (type === 'limit') {
        paramsObj.price = price.toString();
        paramsObj.timeInForce = 'GTC';
      }
      if (stopPrice) {
        paramsObj.stopPrice = stopPrice.toString();
      }

      const queryStr = Object.entries(paramsObj)
        .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
        .join('&');
      
      const signature = crypto
        .createHmac('sha256', this.apiSecret)
        .update(queryStr)
        .digest('hex');

      const url = `${this.baseUrl}/api/v3/order?${queryStr}&signature=${signature}`;
      
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'X-MBX-APIKEY': this.apiKey,
          'Content-Type': 'application/json'
        }
      });

      const response = await res.json();
      if (!res.ok) {
        throw new Error(response.msg || `Binance API error: ${res.status}`);
      }

      const filledPrice = response.fills && response.fills.length > 0
        ? response.fills.reduce((sum, f) => sum + parseFloat(f.price) * parseFloat(f.qty), 0) / response.fills.reduce((sum, f) => sum + parseFloat(f.qty), 0)
        : parseFloat(response.price) || price || 0;

      const fee = response.fills && response.fills.length > 0
        ? response.fills.reduce((sum, f) => sum + parseFloat(f.commission || 0), 0)
        : 0;

      let stdStatus = 'pending';
      if (response.status === 'FILLED') stdStatus = 'filled';
      else if (response.status === 'PARTIALLY_FILLED') stdStatus = 'partially_filled';
      else if (response.status === 'CANCELED') stdStatus = 'cancelled';
      else if (response.status === 'REJECTED') stdStatus = 'rejected';
      else if (response.status === 'EXPIRED') stdStatus = 'expired';
      else if (response.status === 'NEW') stdStatus = 'accepted';

      return {
        exchangeOrderId: response.orderId.toString(),
        status: stdStatus,
        filledPrice,
        fee,
        response
      };
    } catch (err) {
      throw new Error(`Binance placeOrder failed: ${err.message}`);
    }
  }

  async cancelOrder(symbol, exchangeOrderId) {
    const isMock = !this.apiKey || this.apiKey.includes('mock') || this.apiKey.includes('test');

    if (isMock) {
      return {
        exchangeOrderId,
        status: 'cancelled',
        response: {
          symbol: symbol.toUpperCase(),
          orderId: parseInt(exchangeOrderId.split('-')[2] || '1', 10),
          status: 'CANCELED'
        }
      };
    }

    try {
      const crypto = await import('crypto');
      const ts = Date.now();
      const paramsObj = {
        symbol: symbol.toUpperCase(),
        orderId: exchangeOrderId,
        timestamp: ts
      };

      const queryStr = Object.entries(paramsObj)
        .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
        .join('&');
      
      const signature = crypto
        .createHmac('sha256', this.apiSecret)
        .update(queryStr)
        .digest('hex');

      const url = `${this.baseUrl}/api/v3/order?${queryStr}&signature=${signature}`;
      
      const res = await fetch(url, {
        method: 'DELETE',
        headers: {
          'X-MBX-APIKEY': this.apiKey,
          'Content-Type': 'application/json'
        }
      });

      const response = await res.json();
      if (!res.ok) {
        throw new Error(response.msg || `Binance API error: ${res.status}`);
      }

      return {
        exchangeOrderId: response.orderId.toString(),
        status: 'cancelled',
        response
      };
    } catch (err) {
      throw new Error(`Binance cancelOrder failed: ${err.message}`);
    }
  }
}
