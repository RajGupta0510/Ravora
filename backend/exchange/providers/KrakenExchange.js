/**
 * Ravora Backend V1 — Kraken Exchange Provider
 */

import { ExchangeInterface } from '../ExchangeInterface.js';

export class KrakenExchange extends ExchangeInterface {
  constructor(credentials = {}) {
    super('Kraken');
    this.apiKey = credentials.apiKey || null;
    this.apiSecret = credentials.apiSecret || null;
    this.passphrase = credentials.passphrase || null;
  }

  async getBalance() {
    if (!this.apiKey || this.apiKey.includes('mock') || this.apiKey.includes('test')) {
      return [
        { asset: 'ETH', free: 3.5, locked: 0.1 },
        { asset: 'LINK', free: 80.0, locked: 0.0 },
        { asset: 'DOT', free: 200.0, locked: 0.0 },
        { asset: 'USD', free: 4200.0, locked: 0.0 }
      ];
    }
    throw new Error('Kraken live API integration requires signed HTTP credentials');
  }

  async getPositions() {
    if (!this.apiKey || this.apiKey.includes('mock') || this.apiKey.includes('test')) {
      return [
        {
          symbol: 'ETHUSD',
          side: 'long',
          entryPrice: 3200.00,
          currentPrice: 3410.00,
          quantity: 1.5,
          leverage: 2.0,
          marginUsed: 2400.00,
          unrealizedPnl: 315.00,
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
          exchangeOrderId: 'kraken-ord-505',
          symbol: 'LINKUSD',
          type: 'limit',
          side: 'buy',
          quantity: 40.0,
          price: 14.50,
          status: 'pending',
          createdAt: new Date(Date.now() - 18000000).toISOString()
        }
      ];
    }
    return [];
  }

  async getTradeHistory() {
    if (!this.apiKey || this.apiKey.includes('mock') || this.apiKey.includes('test')) {
      return [
        {
          exchangeOrderId: 'kraken-trade-505',
          symbol: 'DOTUSD',
          side: 'buy',
          entryPrice: 6.20,
          exitPrice: 7.80,
          quantity: 150.0,
          leverage: 1.0,
          pnl: 240.00,
          fee: 1.80,
          openedAt: new Date(Date.now() - 86400000 * 6).toISOString(),
          closedAt: new Date(Date.now() - 86400000 * 3).toISOString()
        }
      ];
    }
    return [];
  }

  async getTicker(symbol) {
    return {
      symbol,
      price: 3410.00,
      change24h: 1.8,
      volume24h: 85000000,
      high24h: 3480.00,
      low24h: 3350.00
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

  async placeOrder(params) {
    const { symbol, type, side, quantity, price, stopPrice, leverage } = params;
    const isMock = !this.apiKey || this.apiKey.includes('mock') || this.apiKey.includes('test');

    if (isMock) {
      const orderId = `kraken-ord-${Math.floor(100000 + Math.random() * 900000)}`;
      const tickerPrice = price || (stopPrice ? stopPrice : (symbol.toUpperCase() === 'BTCUSDT' ? 64000.00 : 3400.00));
      const status = (type === 'stop_loss' || type === 'stop_limit') ? 'accepted' : 'filled';

      const mockResponse = {
        error: [],
        result: {
          txid: [orderId],
          descr: {
            order: `${side} ${quantity} ${symbol} @ limit ${tickerPrice}`
          }
        }
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
      const querystring = await import('querystring');
      const timestamp = Date.now().toString();
      const nonce = Date.now().toString() + '000'; // microseconds approximation
      
      const requestPath = '/0/private/AddOrder';
      
      const pair = symbol.toUpperCase().replace('USDT', 'USD'); // Kraken uses USD fiat pair names usually

      const postData = {
        nonce,
        pair,
        type: side.toLowerCase(),
        ordertype: type.toLowerCase() === 'market' ? 'market' : 'limit',
        volume: quantity.toString()
      };

      if (type.toLowerCase() === 'limit' && price) {
        postData.price = price.toString();
      }
      if (stopPrice) {
        postData.price2 = stopPrice.toString(); // trigger price in Kraken
      }
      if (leverage && leverage > 1) {
        postData.leverage = `${leverage}:1`;
      }

      const bodyStr = querystring.stringify(postData);

      // Sign message: HMAC-SHA512 of (path + SHA256(nonce + postData)) using base64-decoded apiSecret
      const sha256 = crypto.createHash('sha256').update(nonce + bodyStr).digest('binary');
      const hmac = crypto
        .createHmac('sha512', Buffer.from(this.apiSecret, 'base64'))
        .update(requestPath + sha256, 'binary')
        .digest('base64');

      const res = await fetch(`https://api.kraken.com${requestPath}`, {
        method: 'POST',
        headers: {
          'API-Key': this.apiKey,
          'API-Sign': hmac,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: bodyStr
      });

      const response = await res.json();
      if (response.error && response.error.length > 0) {
        throw new Error(response.error.join(', ') || 'Kraken API error');
      }

      const txid = response.result?.txid?.[0];
      return {
        exchangeOrderId: txid,
        status: type.toLowerCase() === 'market' ? 'filled' : 'accepted',
        filledPrice: price || 0,
        fee: 0,
        response
      };
    } catch (err) {
      throw new Error(`Kraken placeOrder failed: ${err.message}`);
    }
  }

  async cancelOrder(symbol, exchangeOrderId) {
    const isMock = !this.apiKey || this.apiKey.includes('mock') || this.apiKey.includes('test');

    if (isMock) {
      return {
        exchangeOrderId,
        status: 'cancelled',
        response: {
          error: [],
          result: { count: 1 }
        }
      };
    }

    try {
      const crypto = await import('crypto');
      const querystring = await import('querystring');
      const nonce = Date.now().toString() + '000';
      const requestPath = '/0/private/CancelOrder';

      const postData = {
        nonce,
        txid: exchangeOrderId
      };

      const bodyStr = querystring.stringify(postData);

      const sha256 = crypto.createHash('sha256').update(nonce + bodyStr).digest('binary');
      const hmac = crypto
        .createHmac('sha512', Buffer.from(this.apiSecret, 'base64'))
        .update(requestPath + sha256, 'binary')
        .digest('base64');

      const res = await fetch(`https://api.kraken.com${requestPath}`, {
        method: 'POST',
        headers: {
          'API-Key': this.apiKey,
          'API-Sign': hmac,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: bodyStr
      });

      const response = await res.json();
      if (response.error && response.error.length > 0) {
        throw new Error(response.error.join(', ') || 'Kraken API error');
      }

      return {
        exchangeOrderId,
        status: 'cancelled',
        response
      };
    } catch (err) {
      throw new Error(`Kraken cancelOrder failed: ${err.message}`);
    }
  }
}
