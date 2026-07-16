/**
 * Ravora Backend V1 — Watchlist Controller
 */

import { WatchlistService } from '../services/WatchlistService.js';

export const WatchlistController = {
  async getWatchlist(req, res, next) {
    try {
      const items = await WatchlistService.getWatchlist(req.user.id);
      const symbols = items.map(item => item.symbol);
      return res.json(symbols);
    } catch (err) { next(err); }
  },

  async addSymbol(req, res, next) {
    try {
      const { symbol } = req.body;
      await WatchlistService.addToWatchlist(req.user.id, symbol);
      return res.json({ success: true, message: `${symbol} added to watchlist.` });
    } catch (err) { next(err); }
  },

  async removeSymbol(req, res, next) {
    try {
      const { symbol } = req.params;
      await WatchlistService.removeFromWatchlist(req.user.id, symbol);
      return res.json({ success: true, message: `${symbol} removed from watchlist.` });
    } catch (err) { next(err); }
  },
};
