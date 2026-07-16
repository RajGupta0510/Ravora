/**
 * Ravora Backend V1 — Market Data Service
 */

import { MarketCacheRepository } from '../repositories/MarketCacheRepository.js';
import { MarketProviderFactory } from '../market/MarketProviderFactory.js';
import { logger } from '../utils/logger.js';

const cacheRepo = new MarketCacheRepository();
const priceCache = new Map();

export const MarketDataService = {
  async getTickers() {
    return cacheRepo.getAllTickers();
  },

  async getOverview() {
    const tickers = await this.getTickers();
    return tickers.map(t => ({
      symbol: t.symbol,
      name: t.name,
      price: parseFloat(t.price),
      change24h: parseFloat(t.change_24h || 0),
      volume24h: parseFloat(t.volume_24h || 0),
      marketCap: parseFloat(t.market_cap || 0),
      sparkline: [] // Frontend defaults
    }));
  },

  async getTicker(symbol) {
    const cached = priceCache.get(symbol.toUpperCase());
    if (cached && Date.now() - cached.timestamp < 60_000) {
      return cached.data;
    }
    return cacheRepo.getBySymbol(symbol.toUpperCase());
  },

  async getCurrentPrice(symbol) {
    const ticker = await this.getTicker(symbol);
    return ticker ? parseFloat(ticker.price) : 0;
  },

  updatePriceCache(symbol, data) {
    priceCache.set(symbol.toUpperCase(), { data, timestamp: Date.now() });
  },

  async persistTickers(tickers) {
    if (!tickers || tickers.length === 0) return;

    const formatted = tickers.map(t => ({
      symbol: t.symbol,
      name: t.name || t.symbol,
      price: t.price,
      change_24h: t.change24h || 0,
      volume_24h: t.volume24h || 0,
      market_cap: t.marketCap || 0,
    }));

    await cacheRepo.upsertMultiple(formatted);

    for (const t of formatted) {
      this.updatePriceCache(t.symbol, t);
    }

    logger.debug('MarketData', `Persisted ${formatted.length} tickers to cache`);
  },

  async getMarketSummary() {
    const overview = await this.getOverview();
    if (overview.length === 0) {
      return { totalMarketCap: 0, totalVolume24h: 0, averageChange24h: 0, btcDominance: 0 };
    }

    const totalMarketCap = overview.reduce((acc, curr) => acc + (curr.marketCap || 0), 0);
    const totalVolume24h = overview.reduce((acc, curr) => acc + (curr.volume24h || 0), 0);
    const averageChange24h = overview.reduce((acc, curr) => acc + (curr.change24h || 0), 0) / overview.length;

    const btcTicker = overview.find(o => o.symbol === 'BTC');
    const btcDominance = (btcTicker && totalMarketCap > 0) ? (btcTicker.marketCap / totalMarketCap) * 100 : 0;

    return {
      totalMarketCap,
      totalVolume24h,
      averageChange24h,
      btcDominance
    };
  },

  async getAssetDetails(symbol, timeframe = '1D') {
    try {
      const days = timeframe === '1W' ? 7 : (timeframe === '1M' ? 30 : 1);
      const provider = MarketProviderFactory.create('binance');
      const history = await provider.fetchHistory(symbol.toUpperCase(), days).catch(() => []);
      
      const prices = history.map(h => h.close);
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
      const volume24h = history.length > 0 ? history[history.length - 1].volume : 0;

      return {
        symbol: symbol.toUpperCase(),
        currentPrice: prices.length > 0 ? prices[prices.length - 1] : 0,
        highPrice: maxPrice,
        lowPrice: minPrice,
        volume24h,
        marketCap: 0, // Fallback
        change24h: 0, // Fallback
        sparkline: prices,
        historicalPrices: history.map(h => ({
          time: new Date(h.timestamp).toLocaleDateString(),
          price: h.close,
          volume: h.volume
        })),
        history: history
      };
    } catch (err) {
      logger.error('MarketData', 'Failed to fetch asset details', { symbol, error: err.message });
      return { symbol: symbol.toUpperCase(), sparkline: [], historicalPrices: [] };
    }
  }
};
