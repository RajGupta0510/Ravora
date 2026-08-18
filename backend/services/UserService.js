/**
 * Ravora Backend V1 — User Service
 */

import { UserRepository } from '../repositories/UserRepository.js';
import { SettingsRepository } from '../repositories/SettingsRepository.js';
import { PortfolioRepository } from '../repositories/PortfolioRepository.js';
import { AuditLogRepository } from '../repositories/AuditLogRepository.js';
import { NotificationRepository } from '../repositories/NotificationRepository.js';
import { WatchlistRepository } from '../repositories/WatchlistRepository.js';
import { logger } from '../utils/logger.js';
import { ApiError } from '../utils/ApiError.js';

const userRepo = new UserRepository();
const settingsRepo = new SettingsRepository();
const portfolioRepo = new PortfolioRepository();
const auditRepo = new AuditLogRepository();
const notifRepo = new NotificationRepository();
const watchlistRepo = new WatchlistRepository();

export const UserService = {
  async getProfile(userId) {
    const profile = await userRepo.findByUserId(userId);
    if (!profile) throw ApiError.notFound('Profile');
    return profile;
  },

  async updateProfile(userId, updates) {
    const allowed = ['full_name', 'avatar_url', 'experience_level', 'primary_goal', 'risk_stance', 'max_drawdown_cap', 'capital'];
    const filtered = {};
    for (const key of allowed) {
      if (updates[key] !== undefined) filtered[key] = updates[key];
    }
    const profile = await userRepo.update(userId, filtered);
    await auditRepo.log(userId, 'update_profile', 'profiles', userId);
    return profile;
  },

  async completeOnboarding(userId, email, data) {
    const { experience_level, capital, riskLevel, primary_goal } = data;

    // Map riskLevel and save risk profile
    // 0 = Conservative, 1 = Balanced, 2 = Aggressive
    const riskStances = { 0: 'conservative', 1: 'balanced', 2: 'aggressive' };
    const maxDrawdownCaps = { 0: 1.50, 1: 3.50, 2: 8.50 };
    const riskStance = riskStances[riskLevel] !== undefined ? riskStances[riskLevel] : 'balanced';
    const maxDrawdownCap = maxDrawdownCaps[riskLevel] !== undefined ? maxDrawdownCaps[riskLevel] : 3.50;

    // Upsert profile
    await userRepo.upsert({
      id: userId,
      email: email,
      experience_level,
      capital,
      risk_stance: riskStance,
      max_drawdown_cap: maxDrawdownCap,
      primary_goal,
      onboarding_completed: true,
    });

    // Ensure portfolio exists
    let portfolio = await portfolioRepo.findByUserId(userId);
    if (!portfolio) {
      portfolio = await portfolioRepo.create({
        user_id: userId,
        current_balance: capital || 0,
        safety_score: 100,
      });
    } else {
      await portfolioRepo.update(portfolio.id, {
        current_balance: capital || 0,
        safety_score: riskLevel === 0 ? 98 : (riskLevel === 2 ? 91 : 96),
      });
    }

    // Seed default portfolio assets
    let assets = [];
    if (riskLevel === 0) { // Conservative
      assets = [
        { asset_symbol: 'USDC', allocation_pct: 70.00, balance_amount: (capital * 0.70) / 1.00, average_entry_price: 1.00, position_type: 'long', leverage: 1.0 },
        { asset_symbol: 'USDS', allocation_pct: 20.00, balance_amount: (capital * 0.20) / 1.00, average_entry_price: 1.00, position_type: 'long', leverage: 1.0 },
        { asset_symbol: 'ETH', allocation_pct: 10.00, balance_amount: (capital * 0.10) / 3485.10, average_entry_price: 3485.10, position_type: 'long', leverage: 1.0 }
      ];
    } else if (riskLevel === 2) { // Aggressive
      assets = [
        { asset_symbol: 'ETH', allocation_pct: 40.00, balance_amount: (capital * 0.40) / 3485.10, average_entry_price: 3485.10, position_type: 'long', leverage: 1.0 },
        { asset_symbol: 'BTC', allocation_pct: 35.00, balance_amount: (capital * 0.35) / 64120.10, average_entry_price: 64120.10, position_type: 'long', leverage: 1.0 },
        { asset_symbol: 'SOL', allocation_pct: 25.00, balance_amount: (capital * 0.25) / 134.20, average_entry_price: 134.20, position_type: 'long', leverage: 1.0 }
      ];
    } else { // Balanced (1)
      assets = [
        { asset_symbol: 'ETH', allocation_pct: 45.00, balance_amount: (capital * 0.45) / 3485.10, average_entry_price: 3485.10, position_type: 'long', leverage: 1.0 },
        { asset_symbol: 'USDC', allocation_pct: 30.00, balance_amount: (capital * 0.30) / 1.00, average_entry_price: 1.00, position_type: 'long', leverage: 1.0 },
        { asset_symbol: 'BTC', allocation_pct: 25.00, balance_amount: (capital * 0.25) / 64120.10, average_entry_price: 64120.10, position_type: 'long', leverage: 1.0 }
      ];
    }

    // Clear existing assets and batch upsert new ones
    await portfolioRepo.clearAssets(portfolio.id);
    for (const asset of assets) {
      await portfolioRepo.upsertAsset(portfolio.id, asset);
    }

    // Seed Watchlist
    await watchlistRepo.clearWatchlist(userId);
    const defaultSymbols = ['BTC', 'ETH', 'SOL', 'BNB', 'SUI'];
    for (const sym of defaultSymbols) {
      await watchlistRepo.addSymbol(userId, sym);
    }

    // Seed default onboarding notifications
    await notifRepo.clearNotifications(userId);
    await notifRepo.create({
      user_id: userId,
      channel: 'security',
      priority: 'medium',
      title: 'Drawdown Protection Shield Configured',
      body: `Araiven calculated correlation matrices and established drawdown cushion at ${maxDrawdownCap.toFixed(2)}%.`,
      is_read: false
    });
    await notifRepo.create({
      user_id: userId,
      channel: 'ai',
      priority: 'medium',
      title: 'Ethereum Staking Alpha Opportunity Ingested',
      body: 'New opportunity detected on decentralized staking pools yielding 9.6% APY.',
      is_read: false
    });

    // Ensure default settings exist
    let settings = await settingsRepo.findByUserId(userId);
    if (!settings) {
      settings = await settingsRepo.create({
        user_id: userId,
        auto_hedge_enabled: true,
        notifications_enabled: true,
        execution_mode: 'advisory',
      });
    }

    await auditRepo.log(userId, 'complete_onboarding', 'profiles', userId);
    logger.info('UserService', `Onboarding completed for user ${userId}`);

    return { profile: await userRepo.findByUserId(userId), settings, portfolio };
  },

  async getDashboardSummary(userId) {
    const [profile, settings] = await Promise.all([
      userRepo.findByUserId(userId),
      settingsRepo.findByUserId(userId),
    ]);

    if (!profile) throw ApiError.notFound('Profile');

    return {
      onboardingCompleted: profile.onboarding_completed || false,
      profile: {
        experience_level: profile.experience_level,
        primary_goal: profile.primary_goal,
        risk_stance: profile.risk_stance,
        max_drawdown_cap: profile.max_drawdown_cap,
        capital: profile.capital,
      },
      settings: settings || null,
    };
  },
};
