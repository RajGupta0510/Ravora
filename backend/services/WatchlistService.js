/**
 * Ravora Backend V1 — Watchlist Service
 */

import { WatchlistRepository } from '../repositories/WatchlistRepository.js';

const watchlistRepo = new WatchlistRepository();

export const WatchlistService = {
  async getWatchlist(userId) {
    return watchlistRepo.findByUserId(userId);
  },

  async addToWatchlist(userId, symbol, notes = null) {
    return watchlistRepo.addSymbol(userId, symbol.toUpperCase(), notes);
  },

  async removeFromWatchlist(userId, symbol) {
    return watchlistRepo.removeSymbol(userId, symbol.toUpperCase());
  },

  async isOnWatchlist(userId, symbol) {
    return watchlistRepo.hasSymbol(userId, symbol.toUpperCase());
  },
};
