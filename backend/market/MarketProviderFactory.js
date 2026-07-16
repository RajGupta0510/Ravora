/**
 * Ravora Backend V1 — Market Provider Factory
 * Supports automatic fallback: tries primary provider, falls back to secondary.
 */

import { BinanceMarketProvider } from './providers/BinanceMarketProvider.js';
import { CoinGeckoMarketProvider } from './providers/CoinGeckoMarketProvider.js';
import { logger } from '../utils/logger.js';

const providers = {
  binance: () => new BinanceMarketProvider(),
  coingecko: () => new CoinGeckoMarketProvider(),
};

export class MarketProviderFactory {
  static create(name = 'binance') {
    const factory = providers[name.toLowerCase()];
    if (!factory) throw new Error(`Market provider "${name}" not supported`);
    return factory();
  }

  /**
   * Fetch tickers with automatic fallback.
   * Tries providers in order until one succeeds.
   */
  static async fetchTickersWithFallback(symbols, providerOrder = ['binance', 'coingecko']) {
    for (const name of providerOrder) {
      try {
        const provider = MarketProviderFactory.create(name);
        const tickers = await provider.fetchTickers(symbols);
        if (tickers && tickers.length > 0) {
          logger.debug('MarketFactory', `Fetched ${tickers.length} tickers from ${name}`);
          return tickers;
        }
      } catch (err) {
        logger.warn('MarketFactory', `${name} provider failed, trying next`, { error: err.message });
      }
    }

    logger.error('MarketFactory', 'All market data providers failed');
    return [];
  }

  static getSupportedProviders() {
    return Object.keys(providers);
  }
}
