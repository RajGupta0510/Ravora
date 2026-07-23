/**
 * Ravora Backend V1 — User Controller
 * Custom-mapped to match the exact JSON signature of the legacy API.
 */

import { UserService } from '../services/UserService.js';
import { SettingsService } from '../services/SettingsService.js';
import { PortfolioService } from '../services/PortfolioService.js';

export const UserController = {
  async getProfile(req, res, next) {
    try {
      const userId = req.user.id;
      
      // Attempt to retrieve profile
      let profile = null;
      try {
        profile = await UserService.getProfile(userId);
      } catch (err) {
        // Safe fallback for un-onboarded users
        return res.json({ email: req.user.email, onboardingCompleted: false });
      }

      if (!profile || !profile.onboarding_completed) {
        return res.json({ email: req.user.email, onboardingCompleted: false });
      }

      const settings = await SettingsService.getSettings(userId).catch(() => null);
      const portfolio = await PortfolioService.getPortfolio(userId).catch(() => null);

      return res.json({
        email: req.user.email,
        onboardingCompleted: true,
        profile: {
          full_name: profile.full_name || '',
          experience_level: profile.experience_level || 'beginner',
          primary_goal: profile.primary_goal || '',
          risk_stance: profile.risk_stance || 'balanced',
          max_drawdown_cap: parseFloat(profile.max_drawdown_cap || 3.50),
          capital: portfolio ? parseFloat(portfolio.currentBalance || 0) : 0.00,
          preferred_markets: ['Crypto'],
          dashboard_layout: 'balanced',
          ai_preferences: ['opportunities', 'trends', 'plans']
        },
        settings: {
          auto_hedge_enabled: settings ? !!settings.auto_hedge_enabled : true,
          notifications_enabled: settings ? !!settings.notifications_enabled : true,
          execution_mode: settings ? settings.execution_mode : 'advisory'
        }
      });
    } catch (err) { next(err); }
  },

  async updateProfile(req, res, next) {
    try {
      const profile = await UserService.updateProfile(req.user.id, req.body);
      return res.json({ success: true, profile });
    } catch (err) { next(err); }
  },

  async completeOnboarding(req, res, next) {
    try {
      // Map frontend fields (onboarding shape) to backend service
      const payload = {
        experience_level: req.body.experience || 'beginner',
        capital: parseFloat(req.body.capital || 100000),
        riskLevel: parseInt(req.body.riskLevel || 1, 10),
        primary_goal: req.body.goal || 'growth',
        markets: req.body.markets || ['Crypto'],
        workspace: req.body.workspace || 'balanced',
        araiven: req.body.araiven || ['opportunities', 'trends', 'plans']
      };

      await UserService.completeOnboarding(req.user.id, req.user.email, payload);
      return res.json({ success: true, message: 'Onboarding completed successfully.' });
    } catch (err) { next(err); }
  },

  async getDashboardSummary(req, res, next) {
    try {
      const summary = await UserService.getDashboardSummary(req.user.id);
      return res.json(summary);
    } catch (err) { next(err); }
  },

  async submitFeedback(req, res, next) {
    try {
      const { rating, feedbackText, category } = req.body;
      const { logger } = await import('../utils/logger.js');
      logger.info('UserController', 'Feedback submitted', {
        userId: req.user.id,
        email: req.user.email,
        rating,
        category,
        feedbackText
      });
      return res.json({ success: true, message: 'Feedback submitted successfully.' });
    } catch (err) { next(err); }
  }
};
