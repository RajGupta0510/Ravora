/**
 * Ravora Backend V1 — Portfolio Service
 */

import { PortfolioRepository } from '../repositories/PortfolioRepository.js';
import { ApiError } from '../utils/ApiError.js';

const portfolioRepo = new PortfolioRepository();

export const PortfolioService = {
  async getPortfolio(userId) {
    const portfolio = await portfolioRepo.findByUserId(userId);
    if (!portfolio) throw ApiError.notFound('Portfolio');

    const assets = await portfolioRepo.getAssets(portfolio.id);

    return {
      id: portfolio.id,
      currentBalance: portfolio.current_balance,
      currency: portfolio.currency,
      safetyScore: portfolio.safety_score,
      assets,
    };
  },

  async getPortfolioHistory(userId, days = 30) {
    // Placeholder — will be populated by PortfolioSyncWorker
    // For now returns empty array; future: query a portfolio_snapshots table
    return { history: [] };
  },

  async updateBalance(userId, balance, safetyScore) {
    return portfolioRepo.updateBalance(userId, balance, safetyScore);
  },

  async addAsset(userId, assetData) {
    const portfolio = await portfolioRepo.findByUserId(userId);
    if (!portfolio) throw ApiError.notFound('Portfolio');
    return portfolioRepo.upsertAsset(portfolio.id, assetData);
  },

  async calculateSafetyScore(userId) {
    // Placeholder — future: compute from position risk, drawdown, leverage exposure
    const portfolio = await portfolioRepo.findByUserId(userId);
    if (!portfolio) return 100;

    const assets = await portfolioRepo.getAssets(portfolio.id);
    if (assets.length === 0) return 100;

    // Simple heuristic: penalize high leverage
    const avgLeverage = assets.reduce((sum, a) => sum + (a.leverage || 1), 0) / assets.length;
    const score = Math.max(0, Math.min(100, Math.round(100 - (avgLeverage - 1) * 10)));
    return score;
  },
};
