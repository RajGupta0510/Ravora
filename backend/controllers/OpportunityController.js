/**
 * Ravora Backend V1 — Opportunity Controller
 */

import { OpportunityRepository } from '../repositories/OpportunityRepository.js';
import { RecommendationRepository } from '../repositories/RecommendationRepository.js';
import { PortfolioRepository } from '../repositories/PortfolioRepository.js';
import { MarketDataService } from '../services/MarketDataService.js';
import { NotificationService } from '../services/NotificationService.js';
import { getSupabaseAdmin } from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';
import crypto from 'crypto';

const oppRepo = new OpportunityRepository();
const recRepo = new RecommendationRepository();
const portfolioRepo = new PortfolioRepository();

export const OpportunityController = {
  async getOpportunities(req, res, next) {
    try {
      const opps = await oppRepo.findAllOpportunities();
      
      // If table is empty, seed mock opportunities first
      if (opps.length === 0) {
        await OpportunityController._seedDefaultOpportunities();
        const seeded = await oppRepo.findAllOpportunities();
        return res.json(seeded.map(o => OpportunityController._formatOpportunity(o)));
      }

      return res.json(opps.map(o => OpportunityController._formatOpportunity(o)));
    } catch (err) { next(err); }
  },

  async getRecommendations(req, res, next) {
    try {
      const userId = req.user.id;
      let recs = await recRepo.findPendingByUserId(userId);

      // If no recommendations are pending, seed default recommendations for the user
      if (recs.length === 0) {
        await OpportunityController._seedDefaultRecommendations(userId);
        recs = await recRepo.findPendingByUserId(userId);
      }

      const formatted = recs.map(r => {
        const opp = r.opportunity;
        return {
          recommendationId: r.id,
          opportunity: {
            opportunityId: opp.id,
            name: opp.name,
            symbol: opp.symbol,
            icon: opp.icon_symbol,
            opportunityScore: parseFloat(opp.opportunity_score),
            confidenceScore: parseFloat(opp.confidence_score),
            riskScore: parseFloat(opp.risk_score),
            expectedReturn: parseFloat(opp.expected_return),
            riskLevel: opp.risk_level,
            suggestedEntry: parseFloat(opp.suggested_entry),
            suggestedStopLoss: parseFloat(opp.suggested_stop_loss),
            suggestedTakeProfit: parseFloat(opp.suggested_take_profit),
            expectedDuration: opp.expected_duration,
            riskRewardRatio: parseFloat(opp.risk_reward_ratio),
            trendDirection: opp.trend_direction,
            supportLevels: opp.support_levels ? JSON.parse(opp.support_levels) : [],
            resistanceLevels: opp.resistance_levels ? JSON.parse(opp.resistance_levels) : []
          },
          suggestedAllocationPct: parseFloat(r.suggested_allocation_pct),
          reasoningText: r.reasoning_text,
          status: r.status
        };
      });

      return res.json(formatted);
    } catch (err) { next(err); }
  },

  async executeRecommendation(req, res, next) {
    try {
      const userId = req.user.id;
      const recommendationId = req.params.id;
      const db = getSupabaseAdmin();

      // 1. Fetch recommendation with opportunity details
      const recs = await recRepo.findPendingByUserId(userId);
      const rec = recs.find(r => r.id === recommendationId);
      if (!rec) throw ApiError.notFound('Recommendation');

      const opp = rec.opportunity;

      // 2. Fetch portfolio
      const portfolio = await portfolioRepo.findByUserId(userId);
      if (!portfolio) throw ApiError.notFound('Portfolio');

      const currentBalance = parseFloat(portfolio.current_balance);
      const allocationPct = parseFloat(rec.suggested_allocation_pct);
      const swapValueUSD = currentBalance * (allocationPct / 100);

      // Determine target symbol based on opportunity
      let targetSymbol = 'ETH';
      if (opp.symbol.includes('BTC')) targetSymbol = 'BTC';
      else if (opp.symbol.includes('SOL')) targetSymbol = 'SOL';
      else if (opp.symbol.includes('BNB')) targetSymbol = 'BNB';
      else if (opp.symbol.includes('SUI')) targetSymbol = 'SUI';

      const targetPrice = await MarketDataService.getCurrentPrice(targetSymbol) || parseFloat(opp.suggested_entry || 100.0);

      // Deduct allocation from portfolio balance (rebalancing mock)
      const newBalance = currentBalance - swapValueUSD;
      await portfolioRepo.update(portfolio.id, { current_balance: newBalance });

      // Add target asset to portfolio assets
      const assets = await portfolioRepo.getAssets(portfolio.id);
      const targetAsset = assets.find(a => a.asset_symbol === targetSymbol);
      const quantity = swapValueUSD / targetPrice;

      if (targetAsset) {
        await db.from('portfolio_assets')
          .update({
            balance_amount: parseFloat(targetAsset.balance_amount) + quantity,
            allocation_pct: parseFloat(targetAsset.allocation_pct) + allocationPct
          })
          .eq('id', targetAsset.id);
      } else {
        await portfolioRepo.upsertAsset(portfolio.id, {
          asset_symbol: targetSymbol,
          allocation_pct: allocationPct,
          balance_amount: quantity,
          average_entry_price: targetPrice,
          position_type: 'long',
          leverage: 1.0
        });
      }

      // 3. Log transaction
      const txId = 'tx-' + crypto.randomUUID().substring(0, 8);
      await db.from('transactions').insert({
        user_id: userId,
        transaction_type: 'staking_deposit',
        asset_pair: `USD / ${targetSymbol}`,
        amount: `${quantity.toFixed(4)} ${targetSymbol}`,
        cleared_price: targetPrice,
        execution_fee: swapValueUSD * 0.001,
        status: 'completed'
      });

      // 4. Mark recommendation as approved
      await db.from('araiven_recommendations')
        .update({ status: 'approved' })
        .eq('id', recommendationId);

      // 5. Send notification
      await NotificationService.send(userId, {
        channel: 'ai',
        priority: 'medium',
        title: 'Rebalance Directive Executed',
        body: `Successfully swapped $${swapValueUSD.toLocaleString()} into ${opp.name}.`
      });

      return res.json({
        status: 'cleared',
        transactionId: txId,
        clearedPrice: targetPrice,
        executionFee: swapValueUSD * 0.001,
        timestamp: new Date().toISOString()
      });
    } catch (err) { next(err); }
  },

  async scanMarkets(req, res, next) {
    try {
      const userId = req.user.id;
      
      // Simulate scan and regenerate recommendations
      await OpportunityController._seedDefaultRecommendations(userId);

      return res.json({
        success: true,
        message: 'Araiven quantitative analysis completed. Refreshing market data in background.'
      });
    } catch (err) { next(err); }
  },

  _formatOpportunity(o) {
    return {
      opportunityId: o.id,
      type: o.opportunity_type,
      recommendation: o.opportunity_type,
      name: o.name,
      symbol: o.symbol,
      icon: o.icon_symbol,
      opportunityScore: parseFloat(o.opportunity_score || 0),
      confidenceScore: parseFloat(o.confidence_score || 0),
      riskScore: parseFloat(o.risk_score || 0),
      riskLevel: o.risk_level,
      expectedReturn: parseFloat(o.expected_return || 0),
      reasoningText: o.reasoning_text,
      suggestedEntry: parseFloat(o.suggested_entry || 0),
      suggestedStopLoss: parseFloat(o.suggested_stop_loss || 0),
      suggestedTakeProfit: parseFloat(o.suggested_take_profit || 0),
      suggestedTakeProfit1: parseFloat(o.suggested_take_profit_1 || 0),
      suggestedTakeProfit2: parseFloat(o.suggested_take_profit_2 || 0),
      suggestedTakeProfit3: parseFloat(o.suggested_take_profit_3 || 0),
      expectedDuration: o.expected_duration,
      riskRewardRatio: parseFloat(o.risk_reward_ratio || 0),
      trendDirection: o.trend_direction,
      trendStrength: parseFloat(o.trend_strength || 0),
      supportLevels: o.support_levels ? JSON.parse(o.support_levels) : [],
      resistanceLevels: o.resistance_levels ? JSON.parse(o.resistance_levels) : [],
      tradeProbability: parseFloat(o.trade_probability || 0),
      strategyUsed: o.strategy_used,
      tradeQuality: o.trade_quality,
      nearestSupport: parseFloat(o.nearest_support || 0),
      nearestResistance: parseFloat(o.nearest_resistance || 0),
      distanceToSupport: parseFloat(o.distance_to_support || 0),
      distanceToResistance: parseFloat(o.distance_to_resistance || 0),
      marketBias: o.market_bias
    };
  },

  async _seedDefaultOpportunities() {
    const db = getSupabaseAdmin();
    const defaultOpps = [
      {
        id: 'opp-btc-long',
        name: 'Bitcoin Spot Bullish Breakout',
        symbol: 'BTC/USDT',
        icon_symbol: 'BTC',
        opportunity_type: 'breakout',
        opportunity_score: 94,
        confidence_score: 89,
        risk_score: 28,
        risk_level: 'low',
        expected_return: 14.5,
        reasoning_text: 'Bitcoin has stabilized at range support. High spot ETF inflows suggest structural breakout momentum.',
        suggested_entry: 64120.00,
        suggested_stop_loss: 61500.00,
        suggested_take_profit: 72500.00,
        expected_duration: '3D - 7D',
        risk_reward_ratio: 3.2,
        trend_direction: 'bullish'
      },
      {
        id: 'opp-eth-staking',
        name: 'Ethereum Liquidity Yield Compounding',
        symbol: 'ETH/USDT',
        icon_symbol: 'ETH',
        opportunity_type: 'yield_staking',
        opportunity_score: 96,
        confidence_score: 93,
        risk_score: 15,
        risk_level: 'low',
        expected_return: 9.6,
        reasoning_text: 'Stake pool yields are stabilizing at 9.6% APY with minimal smart contract exposure.',
        suggested_entry: 3485.00,
        suggested_stop_loss: 3200.00,
        suggested_take_profit: 4200.00,
        expected_duration: '30D+',
        risk_reward_ratio: 4.5,
        trend_direction: 'stable'
      }
    ];

    await db.from('opportunities').upsert(defaultOpps);
  },

  async _seedDefaultRecommendations(userId) {
    const db = getSupabaseAdmin();
    await OpportunityController._seedDefaultOpportunities();
    
    const defaultRecs = [
      {
        user_id: userId,
        opportunity_id: 'opp-btc-long',
        suggested_allocation_pct: 25.0,
        status: 'pending',
        reasoning_text: 'Capital allocation recommended to capture breakout momentum on structural support.'
      },
      {
        user_id: userId,
        opportunity_id: 'opp-eth-staking',
        suggested_allocation_pct: 45.0,
        status: 'pending',
        reasoning_text: 'Safe compounding allocation directed into validator liquid staking pool.'
      }
    ];

    await db.from('araiven_recommendations').upsert(defaultRecs);
  }
};
