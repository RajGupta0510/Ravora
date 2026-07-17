/**
 * Portfolio Intelligence Engine — Single source of truth for portfolio valuations, risk, and allocations.
 */

import { getSupabaseAdmin } from '../config/database.js';
import { MarketDataService } from './MarketDataService.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

export const PortfolioIntelligenceService = {
  /**
   * Helper to retrieve portfolio and assets from Supabase
   */
  async getRawPortfolioData(userId) {
    const db = getSupabaseAdmin();

    const portfolio = await db
      .from('portfolios')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!portfolio.data) {
      throw ApiError.notFound('Portfolio not found');
    }

    const { data: assets, error: assetsErr } = await db
      .from('portfolio_assets')
      .select('*')
      .eq('portfolio_id', portfolio.data.id);

    if (assetsErr) throw assetsErr;

    // Fetch user profile to match risk profile
    const { data: profile } = await db
      .from('profiles')
      .select('risk_stance, max_drawdown_cap')
      .eq('id', userId)
      .maybeSingle();

    return {
      portfolio: portfolio.data,
      assets: assets || [],
      profile: profile || { risk_stance: 'balanced', max_drawdown_cap: 3.5 }
    };
  },

  /**
   * Calculates total invested capital, current equity, P/L, and percentage returns
   */
  async calculatePerformanceSummary(userId) {
    const { portfolio, assets } = await this.getRawPortfolioData(userId);
    const overview = await MarketDataService.getOverview();

    const prices = { USDC: 1.00, USDS: 1.00, USDT: 1.00 };
    overview.forEach(o => {
      prices[o.symbol] = o.price;
    });

    let totalInvested = 0;
    let currentValue = 0;

    assets.forEach(h => {
      const isStable = ['USDC', 'USDS', 'USDT'].includes(h.asset_symbol);
      const entryPrice = parseFloat(h.average_entry_price || 1.0);
      const balance = parseFloat(h.balance_amount || 0);
      const leverage = parseFloat(h.leverage || 1.0);

      const assetCost = balance * entryPrice;
      totalInvested += assetCost;

      if (isStable) {
        currentValue += balance;
      } else {
        const curPrice = prices[h.asset_symbol] || entryPrice;
        const priceRatio = curPrice / entryPrice;
        const positionType = h.position_type || 'long';
        
        let pnl = 0;
        if (positionType.toLowerCase() === 'short') {
          pnl = assetCost * leverage * (1 - priceRatio);
        } else {
          pnl = assetCost * leverage * (priceRatio - 1);
        }
        currentValue += Math.max(0, assetCost + pnl);
      }
    });

    const unrealizedPnL = currentValue - totalInvested;
    const pnlPercentage = totalInvested > 0 ? (unrealizedPnL / totalInvested) * 100 : 0;

    return {
      totalInvested: Math.round(totalInvested * 100) / 100,
      currentValue: Math.round(currentValue * 100) / 100,
      unrealizedPnL: Math.round(unrealizedPnL * 100) / 100,
      pnlPercentage: Math.round(pnlPercentage * 100) / 100,
      currency: portfolio.currency || 'USD',
      safetyScore: portfolio.safety_score || 100
    };
  },

  /**
   * Generates asset allocations, weights, sector splits, and market exposure ratios
   */
  async calculateAllocationAnalysis(userId) {
    const { assets } = await this.getRawPortfolioData(userId);
    const overview = await MarketDataService.getOverview();

    const prices = { USDC: 1.00, USDS: 1.00, USDT: 1.00 };
    overview.forEach(o => {
      prices[o.symbol] = o.price;
    });

    let totalVal = 0;
    const assetValues = [];

    assets.forEach(h => {
      const isStable = ['USDC', 'USDS', 'USDT'].includes(h.asset_symbol);
      const entryPrice = parseFloat(h.average_entry_price || 1.0);
      const balance = parseFloat(h.balance_amount || 0);
      const leverage = parseFloat(h.leverage || 1.0);
      const assetCost = balance * entryPrice;

      let val = 0;
      if (isStable) {
        val = balance;
      } else {
        const curPrice = prices[h.asset_symbol] || entryPrice;
        const priceRatio = curPrice / entryPrice;
        const positionType = h.position_type || 'long';
        
        let pnl = 0;
        if (positionType.toLowerCase() === 'short') {
          pnl = assetCost * leverage * (1 - priceRatio);
        } else {
          pnl = assetCost * leverage * (priceRatio - 1);
        }
        val = Math.max(0, assetCost + pnl);
      }

      totalVal += val;
      assetValues.push({
        symbol: h.asset_symbol,
        value: val,
        positionType: h.position_type || 'long',
        leverage
      });
    });

    // 1. Asset allocation weights
    const assetAllocation = assetValues.map(av => ({
      symbol: av.symbol,
      value: Math.round(av.value * 100) / 100,
      weight: totalVal > 0 ? Math.round((av.value / totalVal) * 10000) / 100 : 0
    }));

    // 2. Sector Allocation mapping
    const sectors = {};
    const getSector = (sym) => {
      if (['USDC', 'USDS', 'USDT'].includes(sym)) return 'Stablecoins';
      if (['BTC', 'ETH'].includes(sym)) return 'Layer 1';
      if (['SOL', 'BNB', 'SUI'].includes(sym)) return 'Smart Contracts';
      return 'DeFi';
    };

    assetAllocation.forEach(aa => {
      const sec = getSector(aa.symbol);
      sectors[sec] = (sectors[sec] || 0) + aa.weight;
    });

    const sectorAllocation = Object.entries(sectors).map(([sec, weight]) => ({
      sector: sec,
      weight: Math.round(weight * 100) / 100
    }));

    // 3. Net market exposure
    let longExposure = 0;
    let shortExposure = 0;

    assetValues.forEach(av => {
      if (['USDC', 'USDS', 'USDT'].includes(av.symbol)) return; // stablecoins carry no exposure
      if (av.positionType.toLowerCase() === 'short') {
        shortExposure += av.value;
      } else {
        longExposure += av.value;
      }
    });

    const longRatio = totalVal > 0 ? (longExposure / totalVal) * 100 : 0;
    const shortRatio = totalVal > 0 ? (shortExposure / totalVal) * 100 : 0;

    return {
      assetAllocation,
      sectorAllocation,
      exposure: {
        long: Math.round(longRatio * 100) / 100,
        short: Math.round(shortRatio * 100) / 100,
        net: Math.round((longRatio - shortRatio) * 100) / 100
      }
    };
  },

  /**
   * Evaluates volatility, concentration risk, and computes the portfolio Health Score
   */
  async calculateRiskMetrics(userId) {
    const { assets, profile } = await this.getRawPortfolioData(userId);
    const alloc = await this.calculateAllocationAnalysis(userId);

    const assetRiskFactors = {
      USDC: 5, USDS: 5, USDT: 5,
      BTC: 40,
      ETH: 45,
      SOL: 70, SUI: 75,
      BNB: 60, LINK: 65,
      default: 50
    };

    const assetVolatility = {
      USDC: 0.005, USDS: 0.005, USDT: 0.005,
      BTC: 0.02,
      ETH: 0.025,
      SOL: 0.04, SUI: 0.045,
      default: 0.03
    };

    let totalRisk = 0;
    let totalVol = 0;
    let hhi = 0; // Herfindahl-Hirschman Index for concentration
    let largestPosition = 0;
    let totalLeverage = 0;
    let nonStableCount = 0;

    alloc.assetAllocation.forEach(aa => {
      const risk = assetRiskFactors[aa.symbol] || assetRiskFactors.default;
      const vol = assetVolatility[aa.symbol] || assetVolatility.default;

      totalRisk += aa.weight * risk;
      totalVol += aa.weight * vol;
      hhi += Math.pow(aa.weight, 2);

      if (aa.weight > largestPosition) {
        largestPosition = aa.weight;
      }

      // Check leverage on non-stable assets
      const rawAsset = assets.find(a => a.asset_symbol === aa.symbol);
      if (rawAsset && !['USDC', 'USDS', 'USDT'].includes(aa.symbol)) {
        totalLeverage += parseFloat(rawAsset.leverage || 1.0) * aa.weight;
        nonStableCount += aa.weight;
      }
    });

    const averageLeverage = nonStableCount > 0 ? (totalLeverage / nonStableCount) : 1.0;
    const portfolioRiskScore = totalRisk / 100;
    const portfolioVolatility = totalVol / 100;

    let concentrationRisk = 'low';
    if (hhi > 4500) concentrationRisk = 'high';
    else if (hhi > 2000) concentrationRisk = 'moderate';

    // Health Score calculation model
    let leveragePenalty = 0;
    if (averageLeverage > 5.0) leveragePenalty = 25;
    else if (averageLeverage > 2.0) leveragePenalty = 10;

    let concentrationPenalty = 0;
    if (concentrationRisk === 'high') concentrationPenalty = 15;
    else if (concentrationRisk === 'moderate') concentrationPenalty = 5;

    // Stablecoin cash buffer bonus (optimal is 10% - 30% cash)
    const stableAllocation = alloc.sectorAllocation.find(s => s.sector === 'Stablecoins')?.weight || 0;
    let cashBonus = 0;
    if (stableAllocation >= 10.0 && stableAllocation <= 30.0) {
      cashBonus = 10;
    } else if (stableAllocation > 0 && stableAllocation < 10.0) {
      cashBonus = 5;
    }

    const healthScore = Math.max(10, Math.min(100, Math.round(90 - concentrationPenalty - leveragePenalty + cashBonus)));

    return {
      riskScore: Math.round(portfolioRiskScore * 10) / 10,
      volatility: Math.round(portfolioVolatility * 1000) / 1000,
      concentrationRisk,
      largestPositionRisk: Math.round(largestPosition * 100) / 100,
      maxDrawdown: parseFloat(profile.max_drawdown_cap || 3.50),
      cashRatio: Math.round(stableAllocation * 100) / 100,
      healthScore
    };
  },

  /**
   * Helper to format portfolio metrics for future AI diagnostic queries
   */
  async getPortfolioHealth(userId) {
    const summary = await this.calculatePerformanceSummary(userId);
    const alloc = await this.calculateAllocationAnalysis(userId);
    const risk = await this.calculateRiskMetrics(userId);

    return {
      userId,
      performance: summary,
      allocations: alloc,
      riskMetrics: risk,
      diagnosticSummary: `Portfolio health is rated at ${risk.healthScore}/100. Current net market exposure is ${alloc.exposure.net}%, with a risk concentration level of ${risk.concentrationRisk}.`
    };
  }
};
