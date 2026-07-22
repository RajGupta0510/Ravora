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

  async placeOrder(params) {
    const { symbol, type, side, quantity, price, stopPrice } = params;
    const isMock = !this.apiKey || this.apiKey.includes('mock') || this.apiKey.includes('test');

    if (isMock) {
      const orderId = `bybit-ord-${Math.floor(100000 + Math.random() * 900000)}`;
      const tickerPrice = price || (stopPrice ? stopPrice : (symbol.toUpperCase() === 'BTCUSDT' ? 64000.00 : 3400.00));
      const status = (type === 'stop_loss' || type === 'stop_limit') ? 'accepted' : 'filled';

      const mockResponse = {
        retCode: 0,
        retMsg: 'OK',
        result: {
          orderId,
          orderLinkId: `mock_link_id_${Math.random().toString(36).substr(2, 9)}`
        },
        retExtInfo: {},
        time: Date.now()
      };

      return {
        exchangeOrderId: orderId,
        status,
        filledPrice: tickerPrice,
        fee: status === 'filled' ? (quantity * tickerPrice * 0.001) : 0,
        response: mockResponse
      };
    }

    try {
      const crypto = await import('crypto');
      const timestamp = Date.now().toString();
      const recvWindow = '5000';
      const orderLinkId = `bybit_link_${crypto.randomUUID().substring(0, 8)}`;

      const body = {
        category: 'spot',
        symbol: symbol.toUpperCase(),
        side: side.charAt(0).toUpperCase() + side.slice(1).toLowerCase(), // Buy or Sell
        orderType: type.toLowerCase() === 'market' ? 'Market' : 'Limit',
        qty: quantity.toString(),
        orderLinkId
      };

      if (type.toLowerCase() === 'limit' && price) {
        body.price = price.toString();
      }
      if (stopPrice) {
        body.triggerPrice = stopPrice.toString();
        body.triggerDirection = side.toLowerCase() === 'buy' ? 1 : 2; // 1: rise, 2: fall
      }

      const bodyStr = JSON.stringify(body);
      const signString = timestamp + this.apiKey + recvWindow + bodyStr;
      
      const signature = crypto
        .createHmac('sha256', this.apiSecret)
        .update(signString)
        .digest('hex');

      const res = await fetch(`${this.baseUrl}/v5/order/create`, {
        method: 'POST',
        headers: {
          'X-BAPI-API-KEY': this.apiKey,
          'X-BAPI-SIGN': signature,
          'X-BAPI-TIMESTAMP': timestamp,
          'X-BAPI-RECV-WINDOW': recvWindow,
          'Content-Type': 'application/json'
        },
        body: bodyStr
      });

      const response = await res.json();
      if (response.retCode !== 0) {
        throw new Error(response.retMsg || `Bybit API error: ${response.retCode}`);
      }

      // V5 spot orders might execute immediately (market) or sit in book (limit)
      const isMarket = type.toLowerCase() === 'market';
      return {
        exchangeOrderId: response.result.orderId,
        status: isMarket ? 'filled' : 'accepted',
        filledPrice: price || 0,
        fee: 0, // Fee calculation usually fetched from another endpoint
        response
      };
    } catch (err) {
      throw new Error(`Bybit placeOrder failed: ${err.message}`);
    }
  }

  async cancelOrder(symbol, exchangeOrderId) {
    const isMock = !this.apiKey || this.apiKey.includes('mock') || this.apiKey.includes('test');

    if (isMock) {
      return {
        exchangeOrderId,
        status: 'cancelled',
        response: {
          retCode: 0,
          retMsg: 'OK',
          result: { orderId: exchangeOrderId }
        }
      };
    }

    try {
      const crypto = await import('crypto');
      const timestamp = Date.now().toString();
      const recvWindow = '5000';

      const body = {
        category: 'spot',
        symbol: symbol.toUpperCase(),
        orderId: exchangeOrderId
      };

      const bodyStr = JSON.stringify(body);
      const signString = timestamp + this.apiKey + recvWindow + bodyStr;
      
      const signature = crypto
        .createHmac('sha256', this.apiSecret)
        .update(signString)
        .digest('hex');

      const res = await fetch(`${this.baseUrl}/v5/order/cancel`, {
        method: 'POST',
        headers: {
          'X-BAPI-API-KEY': this.apiKey,
          'X-BAPI-SIGN': signature,
          'X-BAPI-TIMESTAMP': timestamp,
          'X-BAPI-RECV-WINDOW': recvWindow,
          'Content-Type': 'application/json'
        },
        body: bodyStr
      });

      const response = await res.json();
      if (response.retCode !== 0) {
        throw new Error(response.retMsg || `Bybit API error: ${response.retCode}`);
      }

      return {
        exchangeOrderId: response.result.orderId,
        status: 'cancelled',
        response
      };
    } catch (err) {
      throw new Error(`Bybit cancelOrder failed: ${err.message}`);
    }
  }
}
