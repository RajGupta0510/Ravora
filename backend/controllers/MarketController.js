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
};
