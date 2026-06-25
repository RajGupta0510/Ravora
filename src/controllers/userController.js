import crypto from 'crypto';
import { dbGet, dbRun, dbQuery } from '../database.js';
import { MarketDataService } from '../services/marketDataService.js';
import { RecommendationEngine } from '../services/recommendations/recommendationEngine.js';

export const getProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    const profile = await dbGet('SELECT * FROM user_profiles WHERE user_id = ?', [userId]);
    if (!profile) {
      return res.json({ email: req.user.email, onboardingCompleted: false });
    }

    const risk = await dbGet('SELECT * FROM risk_profiles WHERE user_id = ?', [userId]);
    const settings = await dbGet('SELECT * FROM user_settings WHERE user_id = ?', [userId]);
    const portfolio = await dbGet('SELECT * FROM portfolios WHERE user_id = ?', [userId]);

    return res.json({
      email: req.user.email,
      onboardingCompleted: true,
      profile: {
        experience_level: profile.experience_level,
        primary_goal: profile.primary_goal,
        risk_stance: risk ? risk.risk_stance : 'balanced',
        max_drawdown_cap: risk ? risk.max_drawdown_cap : 3.50,
        capital: portfolio ? portfolio.current_balance : 0.00
      },
      settings: {
        auto_hedge_enabled: settings ? settings.auto_hedge_enabled : 1,
        notifications_enabled: settings ? settings.notifications_enabled : 1,
        execution_mode: settings ? settings.execution_mode : 'advisory'
      }
    });
  } catch (err) {
    console.error('Error fetching user profile:', err);
    return res.status(500).json({ error: 'Internal server error fetching profile.' });
  }
};

export const onboard = async (req, res) => {
  const userId = req.user.id;
  const { experience, capital, riskLevel, goal } = req.body;

  if (experience === undefined || capital === undefined || riskLevel === undefined || goal === undefined) {
    return res.status(400).json({ error: 'All onboarding fields (experience, capital, riskLevel, goal) are required.' });
  }

  try {
    // 1. Save profile
    const existingProfile = await dbGet('SELECT id FROM user_profiles WHERE user_id = ?', [userId]);
    if (existingProfile) {
      await dbRun(
        'UPDATE user_profiles SET experience_level = ?, primary_goal = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
        [experience, goal, userId]
      );
    } else {
      await dbRun(
        'INSERT INTO user_profiles (id, user_id, experience_level, primary_goal) VALUES (?, ?, ?, ?)',
        [crypto.randomUUID(), userId, experience, goal]
      );
    }

    // 2. Map riskLevel and save risk profile
    // 0 = Conservative, 1 = Balanced, 2 = Aggressive
    const riskStances = { 0: 'conservative', 1: 'balanced', 2: 'aggressive' };
    const maxDrawdownCaps = { 0: 1.50, 1: 3.50, 2: 8.50 };
    const riskStance = riskStances[riskLevel] !== undefined ? riskStances[riskLevel] : 'balanced';
    const maxDrawdownCap = maxDrawdownCaps[riskLevel] !== undefined ? maxDrawdownCaps[riskLevel] : 3.50;

    const existingRisk = await dbGet('SELECT id FROM risk_profiles WHERE user_id = ?', [userId]);
    if (existingRisk) {
      await dbRun(
        'UPDATE risk_profiles SET risk_stance = ?, max_drawdown_cap = ? WHERE user_id = ?',
        [riskStance, maxDrawdownCap, userId]
      );
    } else {
      await dbRun(
        'INSERT INTO risk_profiles (id, user_id, risk_stance, max_drawdown_cap) VALUES (?, ?, ?, ?)',
        [crypto.randomUUID(), userId, riskStance, maxDrawdownCap]
      );
    }

    // 3. Update portfolios current_balance and calculate safety_score
    const safetyScores = { 0: 98, 1: 96, 2: 91 };
    const safetyScore = safetyScores[riskLevel] || 96;

    await dbRun(
      'UPDATE portfolios SET current_balance = ?, safety_score = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
      [capital, safetyScore, userId]
    );

    const portfolio = await dbGet('SELECT id FROM portfolios WHERE user_id = ?', [userId]);
    const portfolioId = portfolio.id;

    // Clear and build portfolio assets based on selection
    await dbRun('DELETE FROM portfolio_assets WHERE portfolio_id = ?', [portfolioId]);

    // Fetch real live prices for seeding portfolio assets
    const overview = await MarketDataService.getOverview();
    const prices = { USDC: 1.00, USDS: 1.00, USDT: 1.00 };
    overview.forEach(o => {
      prices[o.symbol] = o.price;
    });

    let assets = [];
    if (riskLevel === 0) { // Conservative
      assets = [
        { symbol: 'USDC', allocation: 70.00, price: prices['USDC'] || 1.00 },
        { symbol: 'USDS', allocation: 20.00, price: prices['USDS'] || 1.00 },
        { symbol: 'ETH', allocation: 10.00, price: prices['ETH'] || 3485.10 }
      ];
    } else if (riskLevel === 2) { // Aggressive
      assets = [
        { symbol: 'ETH', allocation: 40.00, price: prices['ETH'] || 3485.10 },
        { symbol: 'BTC', allocation: 35.00, price: prices['BTC'] || 64120.10 },
        { symbol: 'SOL', allocation: 25.00, price: prices['SOL'] || 134.20 }
      ];
    } else { // Balanced (1)
      assets = [
        { symbol: 'ETH', allocation: 45.00, price: prices['ETH'] || 3485.10 },
        { symbol: 'USDC', allocation: 30.00, price: prices['USDC'] || 1.00 },
        { symbol: 'BTC', allocation: 25.00, price: prices['BTC'] || 64120.10 }
      ];
    }

    for (const asset of assets) {
      const balanceAmount = (capital * (asset.allocation / 100)) / asset.price;
      await dbRun(
        'INSERT INTO portfolio_assets (id, portfolio_id, asset_symbol, allocation_pct, balance_amount, average_entry_price, position_type, leverage) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [crypto.randomUUID(), portfolioId, asset.symbol, asset.allocation, balanceAmount, asset.price, 'Long', 1.0]
      );
    }

    // 4. Reset notifications and add default onboarding alerts
    await dbRun('DELETE FROM notifications WHERE user_id = ?', [userId]);
    await dbRun(
      'INSERT INTO notifications (id, user_id, channel, priority, title, body, is_read) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [crypto.randomUUID(), userId, 'risk', 'medium', 'Drawdown Protection Shield Configured', `Araiven calculated correlation matrices and established drawdown cushion at ${maxDrawdownCap.toFixed(2)}%.`, 0]
    );
    await dbRun(
      'INSERT INTO notifications (id, user_id, channel, priority, title, body, is_read) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [crypto.randomUUID(), userId, 'opportunities', 'medium', 'Ethereum Staking Alpha Opportunity Ingested', 'New opportunity detected on decentralized staking pools yielding 9.6% APY.', 0]
    );

    // 5. Generate quantitative recommendations using real engine v1
    await RecommendationEngine.generateRecommendations(userId);

    return res.json({ success: true, message: 'Onboarding completed successfully.' });
  } catch (err) {
    console.error('Error in onboarding:', err);
    return res.status(500).json({ error: 'Internal server error completing onboarding.' });
  }
};

export const updateSettings = async (req, res) => {
  const userId = req.user.id;
  const { executionMode, autoHedgeEnabled, notificationsEnabled } = req.body;

  try {
    const existingSettings = await dbGet('SELECT id FROM user_settings WHERE user_id = ?', [userId]);
    if (existingSettings) {
      await dbRun(
        'UPDATE user_settings SET execution_mode = COALESCE(?, execution_mode), auto_hedge_enabled = COALESCE(?, auto_hedge_enabled), notifications_enabled = COALESCE(?, notifications_enabled) WHERE user_id = ?',
        [executionMode, autoHedgeEnabled, notificationsEnabled, userId]
      );
    } else {
      await dbRun(
        'INSERT INTO user_settings (id, user_id, execution_mode, auto_hedge_enabled, notifications_enabled) VALUES (?, ?, ?, ?, ?)',
        [crypto.randomUUID(), userId, executionMode || 'advisory', autoHedgeEnabled ?? 1, notificationsEnabled ?? 1]
      );
    }
    return res.json({ success: true, message: 'Settings updated successfully.' });
  } catch (err) {
    console.error('Error updating settings:', err);
    return res.status(500).json({ error: 'Internal server error updating settings.' });
  }
};
