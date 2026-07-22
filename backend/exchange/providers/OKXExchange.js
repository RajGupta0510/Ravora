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

  async placeOrder(params) {
    const { symbol, type, side, quantity, price, stopPrice } = params;
    const isMock = !this.apiKey || this.apiKey.includes('mock') || this.apiKey.includes('test');

    if (isMock) {
      const orderId = `okx-ord-${Math.floor(100000 + Math.random() * 900000)}`;
      const tickerPrice = price || (stopPrice ? stopPrice : (symbol.toUpperCase() === 'BTCUSDT' ? 64000.00 : 3400.00));
      const status = (type === 'stop_loss' || type === 'stop_limit') ? 'accepted' : 'filled';

      const mockResponse = {
        code: '0',
        msg: '',
        data: [{
          ordId: orderId,
          clOrdId: `mock_okx_${Math.random().toString(36).substr(2, 9)}`,
          sCode: '0',
          sMsg: 'OK'
        }]
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
      const timestamp = new Date().toISOString();
      const method = 'POST';
      const requestPath = '/api/v5/trade/order';

      const body = {
        instId: symbol.toUpperCase().replace('USDT', '-USDT'), // Convert e.g. BTCUSDT -> BTC-USDT
        tdMode: 'cash',
        side: side.toLowerCase(),
        ordType: type.toLowerCase() === 'market' ? 'market' : 'limit',
        sz: quantity.toString()
      };

      if (type.toLowerCase() === 'limit' && price) {
        body.px = price.toString();
      }

      const bodyStr = JSON.stringify(body);
      const signString = timestamp + method + requestPath + bodyStr;
      
      const signature = crypto
        .createHmac('sha256', this.apiSecret)
        .update(signString)
        .digest('base64');

      const res = await fetch(`${this.baseUrl}${requestPath}`, {
        method,
        headers: {
          'OK-ACCESS-KEY': this.apiKey,
          'OK-ACCESS-SIGN': signature,
          'OK-ACCESS-TIMESTAMP': timestamp,
          'OK-ACCESS-PASSPHRASE': this.passphrase,
          'Content-Type': 'application/json'
        },
        body: bodyStr
      });

      const response = await res.json();
      if (response.code !== '0') {
        throw new Error(response.msg || `OKX API error: ${response.code}`);
      }

      const orderData = response.data?.[0];
      if (orderData?.sCode !== '0') {
        throw new Error(orderData?.sMsg || 'OKX order placement failed');
      }

      return {
        exchangeOrderId: orderData.ordId,
        status: type.toLowerCase() === 'market' ? 'filled' : 'accepted',
        filledPrice: price || 0,
        fee: 0,
        response
      };
    } catch (err) {
      throw new Error(`OKX placeOrder failed: ${err.message}`);
    }
  }

  async cancelOrder(symbol, exchangeOrderId) {
    const isMock = !this.apiKey || this.apiKey.includes('mock') || this.apiKey.includes('test');

    if (isMock) {
      return {
        exchangeOrderId,
        status: 'cancelled',
        response: {
          code: '0',
          msg: '',
          data: [{ ordId: exchangeOrderId, sCode: '0', sMsg: 'OK' }]
        }
      };
    }

    try {
      const crypto = await import('crypto');
      const timestamp = new Date().toISOString();
      const method = 'POST';
      const requestPath = '/api/v5/trade/cancel-order';

      const body = {
        instId: symbol.toUpperCase().replace('USDT', '-USDT'),
        ordId: exchangeOrderId
      };

      const bodyStr = JSON.stringify(body);
      const signString = timestamp + method + requestPath + bodyStr;
      
      const signature = crypto
        .createHmac('sha256', this.apiSecret)
        .update(signString)
        .digest('base64');

      const res = await fetch(`${this.baseUrl}${requestPath}`, {
        method,
        headers: {
          'OK-ACCESS-KEY': this.apiKey,
          'OK-ACCESS-SIGN': signature,
          'OK-ACCESS-TIMESTAMP': timestamp,
          'OK-ACCESS-PASSPHRASE': this.passphrase,
          'Content-Type': 'application/json'
        },
        body: bodyStr
      });

      const response = await res.json();
      if (response.code !== '0') {
        throw new Error(response.msg || `OKX API error: ${response.code}`);
      }

      const orderData = response.data?.[0];
      if (orderData?.sCode !== '0') {
        throw new Error(orderData?.sMsg || 'OKX order cancellation failed');
      }

      return {
        exchangeOrderId: orderData.ordId,
        status: 'cancelled',
        response
      };
    } catch (err) {
      throw new Error(`OKX cancelOrder failed: ${err.message}`);
    }
  }
}
