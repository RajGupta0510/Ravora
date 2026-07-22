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

  async placeOrder(params) {
    const { symbol, type, side, quantity, price, stopPrice } = params;
    const isMock = !this.apiKey || this.apiKey.includes('mock') || this.apiKey.includes('test');

    if (isMock) {
      const orderId = `coinbase-ord-${Math.floor(100000 + Math.random() * 900000)}`;
      const tickerPrice = price || (stopPrice ? stopPrice : (symbol.toUpperCase() === 'BTCUSDT' ? 64000.00 : 3400.00));
      const status = (type === 'stop_loss' || type === 'stop_limit') ? 'accepted' : 'filled';

      const mockResponse = {
        success: true,
        order_id: orderId,
        order_configuration: {
          limit_limit_gtd: {
            base_size: quantity.toString(),
            limit_price: tickerPrice.toString(),
            post_only: false
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
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const method = 'POST';
      const requestPath = '/api/v3/brokerage/orders';

      // Convert symbol, e.g. BTCUSDT -> BTC-USDT
      const productId = symbol.toUpperCase().replace('USDT', '-USDT');
      const clientOrderId = crypto.randomUUID();

      const orderConfig = {};
      if (type.toLowerCase() === 'market') {
        orderConfig.market_market_ioc = {
          base_size: quantity.toString()
        };
      } else {
        orderConfig.limit_limit_gtd = {
          base_size: quantity.toString(),
          limit_price: price.toString(),
          end_time: new Date(Date.now() + 86400000).toISOString() // 24h
        };
      }

      const body = {
        client_order_id: clientOrderId,
        product_id: productId,
        side: side.toUpperCase(),
        order_configuration: orderConfig
      };

      const bodyStr = JSON.stringify(body);
      const signString = timestamp + method + requestPath + bodyStr;
      
      const signature = crypto
        .createHmac('sha256', this.apiSecret)
        .update(signString)
        .digest('hex');

      const res = await fetch(`https://api.coinbase.com${requestPath}`, {
        method,
        headers: {
          'CB-ACCESS-KEY': this.apiKey,
          'CB-ACCESS-SIGN': signature,
          'CB-ACCESS-TIMESTAMP': timestamp,
          'Content-Type': 'application/json'
        },
        body: bodyStr
      });

      const response = await res.json();
      if (!res.ok || !response.success) {
        throw new Error(response.error_response?.message || `Coinbase API error: ${res.status}`);
      }

      return {
        exchangeOrderId: response.order_id,
        status: type.toLowerCase() === 'market' ? 'filled' : 'accepted',
        filledPrice: price || 0,
        fee: 0,
        response
      };
    } catch (err) {
      throw new Error(`Coinbase placeOrder failed: ${err.message}`);
    }
  }

  async cancelOrder(symbol, exchangeOrderId) {
    const isMock = !this.apiKey || this.apiKey.includes('mock') || this.apiKey.includes('test');

    if (isMock) {
      return {
        exchangeOrderId,
        status: 'cancelled',
        response: {
          results: [{ order_id: exchangeOrderId, result: 'SUCCESS' }]
        }
      };
    }

    try {
      const crypto = await import('crypto');
      const timestamp = Math.floor(Date.now / 1000).toString();
      const method = 'POST';
      const requestPath = '/api/v3/brokerage/orders/batch_cancel';

      const body = {
        order_ids: [exchangeOrderId]
      };

      const bodyStr = JSON.stringify(body);
      const signString = timestamp + method + requestPath + bodyStr;
      
      const signature = crypto
        .createHmac('sha256', this.apiSecret)
        .update(signString)
        .digest('hex');

      const res = await fetch(`https://api.coinbase.com${requestPath}`, {
        method,
        headers: {
          'CB-ACCESS-KEY': this.apiKey,
          'CB-ACCESS-SIGN': signature,
          'CB-ACCESS-TIMESTAMP': timestamp,
          'Content-Type': 'application/json'
        },
        body: bodyStr
      });

      const response = await res.json();
      if (!res.ok) {
        throw new Error(`Coinbase API error: ${res.status}`);
      }

      const result = response.results?.[0];
      if (result?.result !== 'SUCCESS') {
        throw new Error(`Coinbase cancellation failed: ${result?.result}`);
      }

      return {
        exchangeOrderId: result.order_id,
        status: 'cancelled',
        response
      };
    } catch (err) {
      throw new Error(`Coinbase cancelOrder failed: ${err.message}`);
    }
  }
}
