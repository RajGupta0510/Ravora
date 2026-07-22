import { ApiError } from '../../utils/ApiError.js';
import { getSupabaseAdmin } from '../../config/database.js';
import { MarketDataService } from '../../services/MarketDataService.js';

// Global Emergency Trading Halt Switch (in-memory, can be persisted in settings table)
let isEmergencyHaltActive = false;

export const RiskManager = {
  /**
   * Set global emergency trading halt status
   */
  setEmergencyHalt(status) {
    isEmergencyHaltActive = !!status;
    console.warn(`[RiskManager] Emergency Trading Halt set to: ${isEmergencyHaltActive}`);
  },

  /**
   * Get global emergency trading halt status
   */
  isHalted() {
    return isEmergencyHaltActive;
  },

  /**
   * Evaluates all pre-trade risk controls.
   * Throws ApiError if any risk rule is violated.
   */
  async checkRiskControls(userId, params) {
    const { exchangeAccountId, symbol, quantity, side, type, leverage = 1.0, price } = params;

    // 1. Emergency Trading Halt check
    if (isEmergencyHaltActive) {
      throw ApiError.badRequest('Trading is temporarily suspended due to a global system halt.');
    }

    const db = getSupabaseAdmin();
    const baseSymbol = symbol.toUpperCase().replace('USDT', '').replace('USD', '');

    // 2. Duplicate Order Prevention
    // Reject if identical order (same symbol, side, type, quantity) was submitted within the last 30 seconds
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000).toISOString();
    const { data: recentOrders } = await db
      .from('orders')
      .select('id, created_at')
      .eq('user_id', userId)
      .eq('symbol', symbol.toUpperCase())
      .eq('side', side.toLowerCase())
      .eq('type', type.toLowerCase())
      .eq('quantity', quantity)
      .gte('created_at', thirtySecondsAgo)
      .not('status', 'eq', 'rejected')
      .limit(1);

    if (recentOrders && recentOrders.length > 0) {
      throw ApiError.badRequest('Duplicate order detected. Identical order placed within the last 30 seconds.');
    }

    // Fetch user risk settings / profiles
    const { data: riskProfile } = await db
      .from('risk_profiles')
      .select('risk_stance, max_drawdown_cap')
      .eq('user_id', userId)
      .maybeSingle();

    const maxDrawdown = parseFloat(riskProfile?.max_drawdown_cap || 3.5);
    const riskStance = riskProfile?.risk_stance || 'balanced';

    // 3. Leverage Limit Check
    // Beginner: max 3x, Balanced: max 10x, Aggressive: max 20x
    const leverageLimits = {
      conservative: 3.0,
      balanced: 10.0,
      aggressive: 20.0,
      default: 5.0
    };
    const maxLeverageAllowed = leverageLimits[riskStance.toLowerCase()] || leverageLimits.default;
    if (leverage > maxLeverageAllowed) {
      throw ApiError.badRequest(`Requested leverage ${leverage}x exceeds your risk stance limit of ${maxLeverageAllowed}x.`);
    }

    // 4. Max Position Sizing Checks
    const currentPrice = await MarketDataService.getCurrentPrice(baseSymbol) || price || 1.0;
    const orderValueUSD = quantity * currentPrice;

    // Retrieve total portfolio valuation to scale caps
    const { data: portfolio } = await db
      .from('portfolios')
      .select('current_balance')
      .eq('user_id', userId)
      .maybeSingle();

    const portfolioBalance = parseFloat(portfolio?.current_balance || 100000.0);
    
    // Position size caps: Max 20% of portfolio for Balanced, 10% for Conservative, 40% for Aggressive
    const sizeCapRatios = {
      conservative: 0.10,
      balanced: 0.20,
      aggressive: 0.40,
      default: 0.15
    };
    const sizeCapRatio = sizeCapRatios[riskStance.toLowerCase()] || sizeCapRatios.default;
    const maxPositionValueAllowed = portfolioBalance * sizeCapRatio;

    if (orderValueUSD > maxPositionValueAllowed) {
      throw ApiError.badRequest(`Order size ($${orderValueUSD.toFixed(2)}) exceeds maximum risk allocation per asset of $${maxPositionValueAllowed.toFixed(2)} (${sizeCapRatio * 100}% of portfolio).`);
    }

    // 5. Daily Cumulative Loss Check
    // Calculate total realized loss in trade_history for today
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);
    const startOfTodayIso = startOfToday.toISOString();

    const { data: tradesToday } = await db
      .from('trade_history')
      .select('pnl')
      .eq('user_id', userId)
      .gte('closed_at', startOfTodayIso);

    let totalLossToday = 0;
    (tradesToday || []).forEach(t => {
      const pnl = parseFloat(t.pnl || 0);
      if (pnl < 0) totalLossToday += Math.abs(pnl);
    });

    // Daily loss limit is set to max drawdown cap percentage of portfolio balance
    const maxDailyLossAllowed = portfolioBalance * (maxDrawdown / 100);
    if (totalLossToday >= maxDailyLossAllowed) {
      throw ApiError.badRequest(`Daily loss limit reached ($${totalLossToday.toFixed(2)} / $${maxDailyLossAllowed.toFixed(2)}). Trading blocked for today.`);
    }

    return true;
  }
};
