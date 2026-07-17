/**
 * Ravora Backend V1 — Exchange Factory
 * Returns the correct exchange provider instance based on name.
 */

import { BinanceExchange } from './providers/BinanceExchange.js';
import { BybitExchange } from './providers/BybitExchange.js';
import { OKXExchange } from './providers/OKXExchange.js';
import { CoinbaseExchange } from './providers/CoinbaseExchange.js';
import { KrakenExchange } from './providers/KrakenExchange.js';
import { ApiError } from '../utils/ApiError.js';

const providers = {
  binance: BinanceExchange,
  bybit: BybitExchange,
  okx: OKXExchange,
  coinbase: CoinbaseExchange,
  kraken: KrakenExchange,
};

export class ExchangeFactory {
  /**
   * @param {string} exchangeName - e.g. 'binance', 'bybit'
   * @param {{ apiKey: string, apiSecret: string }} credentials
   * @returns {ExchangeInterface}
   */
  static create(exchangeName, credentials = {}) {
    const Provider = providers[exchangeName.toLowerCase()];
    if (!Provider) {
      throw ApiError.badRequest(`Exchange "${exchangeName}" is not supported. Supported: ${Object.keys(providers).join(', ')}`);
    }
    return new Provider(credentials);
  }

  static getSupportedExchanges() {
    return Object.keys(providers);
  }
}
