/**
 * Ravora Backend V1 — Market Controller
 */

import { MarketDataService } from '../services/MarketDataService.js';

export const MarketController = {
  async getPrices(req, res, next) {
    try {
      const overview = await MarketDataService.getOverview();
      const prices = overview.map(o => ({
        symbol: o.symbol,
        name: o.name,
        price: o.price,
        change24h: o.change24h
      }));
      return res.json({ prices });
    } catch (err) { next(err); }
  },

  async getOverview(req, res, next) {
    try {
      const overview = await MarketDataService.getOverview();
      return res.json(overview);
    } catch (err) { next(err); }
  },

  async getSummary(req, res, next) {
    try {
      const summary = await MarketDataService.getMarketSummary();
      return res.json(summary);
    } catch (err) { next(err); }
  },

  async getAssetDetails(req, res, next) {
    try {
      const { symbol } = req.params;
      const { timeframe } = req.query;
      const details = await MarketDataService.getAssetDetails(symbol, timeframe);
      return res.json(details);
    } catch (err) { next(err); }
  },

  async getTrending(req, res, next) {
    try {
      const trending = await MarketDataService.getTrending();
      return res.json(trending);
    } catch (err) { next(err); }
  },

  async getTopGainers(req, res, next) {
    try {
      const gainers = await MarketDataService.getTopGainers();
      return res.json(gainers);
    } catch (err) { next(err); }
  },

  async getTopLosers(req, res, next) {
    try {
      const losers = await MarketDataService.getTopLosers();
      return res.json(losers);
    } catch (err) { next(err); }
  },

  async searchAssets(req, res, next) {
    try {
      const { q } = req.query;
      const results = await MarketDataService.searchAssets(q || '');
      return res.json(results);
    } catch (err) { next(err); }
  },
};
