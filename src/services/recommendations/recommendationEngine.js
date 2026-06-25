import crypto from 'crypto';
import { dbGet, dbRun, dbQuery } from '../database.js';
import { MarketDataService } from '../marketDataService.js';
import { ScoringEngine } from '../scoring/scoringEngine.js';
import { ASSETS_TO_TRACK } from '../config/marketConfig.js';

export const RecommendationEngine = {
  /**
   * Scans real market data, runs scoring, updates opportunities, and generates rebalance recommendations
   * @param {string} userId - Target user ID
   */
  async generateRecommendations(userId) {
    try {
      console.log(`[RecommendationEngine] Generating quantitative recommendations for user ${userId}...`);

      // 1. Fetch live market overview
      const tickers = await MarketDataService.getOverview();
      const scoredAssets = {};

      const opportunityMapping = {
        BTC: { id: 'btc-halving', name: 'Bitcoin ETF Momentum Stacking', type: 'momentum', icon: '₿' },
        ETH: { id: 'eth-staking', name: 'Ethereum Staking Alpha', type: 'yield', icon: 'Ξ' },
        SOL: { id: 'solana-liquidity', name: 'Solana Liquidity Staking Accumulation', type: 'momentum', icon: 'S' },
        LINK: { id: 'link-momentum', name: 'Chainlink Oracle Integration Breakout', type: 'momentum', icon: 'L' },
        SUI: { id: 'sui-alpha', name: 'Sui Network Velocity Expansion', type: 'momentum', icon: 'U' }
      };

      // 2. Score each asset and update/insert in global opportunities table
      for (const symbol of ASSETS_TO_TRACK) {
        const ticker = tickers.find(t => t.symbol === symbol);
        if (!ticker) continue;

        const details = await MarketDataService.getAssetDetails(symbol);
        const scores = ScoringEngine.calculateAssetScores(ticker, details, tickers);

        scoredAssets[symbol] = { ticker, scores };

        // Save to opportunities table
        const oppMeta = opportunityMapping[symbol];
        if (oppMeta) {
          const expectedMin = (scores.opportunityScore * 0.2).toFixed(1);
          const expectedMax = (scores.opportunityScore * 0.3).toFixed(1);
          const estReturnStr = `${expectedMin}% - ${expectedMax}%`;
          const riskLevelStr = scores.riskScore < 35 ? 'low' : (scores.riskScore < 65 ? 'medium' : 'high');
          const reasoningStr = scores.reasoning.join(' ');

          await dbRun(
            `INSERT INTO opportunities (
               id, opportunity_type, name, symbol, icon_symbol, confidence_score, expected_return, risk_level, reasoning_text,
               suggested_entry, suggested_stop_loss, suggested_take_profit, expected_duration, risk_reward_ratio, trend_direction, support_levels, resistance_levels
             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(id) DO UPDATE SET
               opportunity_type=excluded.opportunity_type,
               name=excluded.name,
               symbol=excluded.symbol,
               confidence_score=excluded.confidence_score,
               expected_return=excluded.expected_return,
               risk_level=excluded.risk_level,
               reasoning_text=excluded.reasoning_text,
               suggested_entry=excluded.suggested_entry,
               suggested_stop_loss=excluded.suggested_stop_loss,
               suggested_take_profit=excluded.suggested_take_profit,
               expected_duration=excluded.expected_duration,
               risk_reward_ratio=excluded.risk_reward_ratio,
               trend_direction=excluded.trend_direction,
               support_levels=excluded.support_levels,
               resistance_levels=excluded.resistance_levels`,
            [
              oppMeta.id,
              oppMeta.type,
              oppMeta.name,
              `${symbol} / USD`,
              oppMeta.icon,
              scores.confidenceScore,
              estReturnStr,
              riskLevelStr,
              reasoningStr,
              scores.suggestedEntry,
              scores.suggestedStopLoss,
              scores.suggestedTakeProfit,
              scores.expectedDuration,
              scores.riskRewardRatio,
              scores.trendDirection,
              JSON.stringify(scores.supportLevels),
              JSON.stringify(scores.resistanceLevels)
            ]
          );
        }
      }

      // 3. Fetch user's risk stance
      const riskProfile = await dbGet('SELECT * FROM risk_profiles WHERE user_id = ?', [userId]);
      if (!riskProfile) return;

      const riskStance = riskProfile.risk_stance.toLowerCase(); // 'conservative', 'balanced', 'aggressive'

      // 4. Fetch active portfolio & holdings
      const portfolio = await dbGet('SELECT * FROM portfolios WHERE user_id = ?', [userId]);
      if (!portfolio) return;

      const holdings = await dbQuery('SELECT * FROM portfolio_assets WHERE portfolio_id = ?', [portfolio.id]);
      
      // Calculate active allocations in portfolio
      const holdingsAllocation = {};
      holdings.forEach(h => {
        holdingsAllocation[h.asset_symbol] = h.allocation_pct;
      });

      // 5. Clean up old pending recommendations for this user
      await dbRun("DELETE FROM araiven_recommendations WHERE user_id = ? AND status = 'pending'", [userId]);

      // 6. Generate target allocations based on Stance and Opportunity Scores
      const targetAllocations = [];

      if (riskStance === 'conservative') {
        // Targets: 40% BTC, 30% ETH, 30% Stable
        targetAllocations.push({ opportunityId: 'btc-halving', targetPct: 40.0, symbol: 'BTC' });
        targetAllocations.push({ opportunityId: 'eth-staking', targetPct: 30.0, symbol: 'ETH' });
      } else if (riskStance === 'aggressive') {
        // Targets: 25% BTC, 25% ETH, 20% SOL, 15% LINK, 15% SUI
        targetAllocations.push({ opportunityId: 'btc-halving', targetPct: 25.0, symbol: 'BTC' });
        targetAllocations.push({ opportunityId: 'eth-staking', targetPct: 25.0, symbol: 'ETH' });
        targetAllocations.push({ opportunityId: 'solana-liquidity', targetPct: 20.0, symbol: 'SOL' });
        targetAllocations.push({ opportunityId: 'link-momentum', targetPct: 15.0, symbol: 'LINK' });
        targetAllocations.push({ opportunityId: 'sui-alpha', targetPct: 15.0, symbol: 'SUI' });
      } else {
        // Balanced (default): 35% BTC, 35% ETH, 15% SOL, 15% Stable
        targetAllocations.push({ opportunityId: 'btc-halving', targetPct: 35.0, symbol: 'BTC' });
        targetAllocations.push({ opportunityId: 'eth-staking', targetPct: 35.0, symbol: 'ETH' });
        targetAllocations.push({ opportunityId: 'solana-liquidity', targetPct: 15.0, symbol: 'SOL' });
      }

      // 7. Determine recommended changes
      // If user holds 100% stablecoins (USDC) (the onboarding default), recommend rebalancing into all targets.
      // If they already hold some assets, we only recommend rebalances if allocation deviation > 5%.
      const isInitialStable = holdingsAllocation['USDC'] >= 95.0 || holdings.length === 1 && holdings[0].asset_symbol === 'USDC';

      for (const target of targetAllocations) {
        const currentAllocation = holdingsAllocation[target.symbol] || 0.0;
        const deviation = target.targetPct - currentAllocation;

        if (isInitialStable || Math.abs(deviation) >= 5.0) {
          const scored = scoredAssets[target.symbol];
          const explanation = scored 
            ? `Araiven recommends allocating ${target.targetPct}% reserves to ${target.symbol} because: ` + scored.scores.reasoning.slice(0, 3).join(' ')
            : `Allocate ${target.targetPct}% reserves to ${target.symbol} based on portfolio stance.`;

          await dbRun(
            `INSERT INTO araiven_recommendations (id, user_id, opportunity_id, suggested_allocation_pct, status)
             VALUES (?, ?, ?, ?, ?)`,
            [
              'rec-' + crypto.randomUUID().substring(0, 8),
              userId,
              target.opportunityId,
              target.targetPct,
              'pending'
            ]
          );

          // Update opportunities reasoning text if we want specific user explanation
          await dbRun(
            `UPDATE opportunities SET reasoning_text = ? WHERE id = ?`,
            [explanation, target.opportunityId]
          );
        }
      }

      console.log(`[RecommendationEngine] Recommendations successfully generated for user ${userId}.`);
    } catch (err) {
      console.error('[RecommendationEngine] Error generating recommendations:', err);
    }
  }
};
