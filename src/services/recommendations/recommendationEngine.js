import crypto from 'crypto';
import { dbGet, dbRun, dbQuery } from '../../database.js';
import { MarketDataService } from '../marketDataService.js';
import { runOpportunityEngine } from '../opportunity/opportunityEngine.js';
import { ASSETS_TO_TRACK } from '../../config/marketConfig.js';

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

      // 2. Run the quantitative Opportunity Engine to analyze and rank all assets
      const rankedOpps = await runOpportunityEngine(
        tickers,
        MarketDataService.getAssetDetails.bind(MarketDataService)
      );

      const scoredAssets = {};

      // 3. Save each opportunity to the SQLite database
      for (const opp of rankedOpps) {
        // Save to scoredAssets cache for portfolio allocations below
        scoredAssets[opp.symbol] = {
          ticker: tickers.find(t => t.symbol === opp.symbol),
          scores: {
            opportunityScore: opp.opportunityScore,
            confidenceScore: opp.confidenceScore,
            riskScore: opp.riskScore,
            suggestedDirection: opp.direction,
            suggestedEntry: opp.suggestedEntry,
            suggestedStopLoss: opp.suggestedStopLoss,
            suggestedTakeProfit: opp.suggestedTakeProfit,
            expectedDuration: opp.expectedDuration,
            riskRewardRatio: opp.riskRewardRatio,
            trendDirection: opp.trendDirection,
            supportLevels: opp.supportLevels,
            resistanceLevels: opp.resistanceLevels,
            reasoningText: opp.reasoningText
          }
        };

        await dbRun(
          `INSERT INTO opportunities (
             id, opportunity_type, name, symbol, icon_symbol, opportunity_score, confidence_score, risk_score, risk_level, expected_return, reasoning_text,
             suggested_entry, suggested_stop_loss, suggested_take_profit, suggested_take_profit_1, suggested_take_profit_2, suggested_take_profit_3,
             expected_duration, risk_reward_ratio, trend_direction, trend_strength, support_levels, resistance_levels,
             trade_probability, strategy_used, trade_quality, nearest_support, nearest_resistance, distance_to_support, distance_to_resistance, market_bias
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET
             opportunity_type=excluded.opportunity_type,
             name=excluded.name,
             symbol=excluded.symbol,
             opportunity_score=excluded.opportunity_score,
             confidence_score=excluded.confidence_score,
             risk_score=excluded.risk_score,
             risk_level=excluded.risk_level,
             expected_return=excluded.expected_return,
             reasoning_text=excluded.reasoning_text,
             suggested_entry=excluded.suggested_entry,
             suggested_stop_loss=excluded.suggested_stop_loss,
             suggested_take_profit=excluded.suggested_take_profit,
             suggested_take_profit_1=excluded.suggested_take_profit_1,
             suggested_take_profit_2=excluded.suggested_take_profit_2,
             suggested_take_profit_3=excluded.suggested_take_profit_3,
             expected_duration=excluded.expected_duration,
             risk_reward_ratio=excluded.risk_reward_ratio,
             trend_direction=excluded.trend_direction,
             trend_strength=excluded.trend_strength,
             support_levels=excluded.support_levels,
             resistance_levels=excluded.resistance_levels,
             trade_probability=excluded.trade_probability,
             strategy_used=excluded.strategy_used,
             trade_quality=excluded.trade_quality,
             nearest_support=excluded.nearest_support,
             nearest_resistance=excluded.nearest_resistance,
             distance_to_support=excluded.distance_to_support,
             distance_to_resistance=excluded.distance_to_resistance,
             market_bias=excluded.market_bias`,
          [
            opp.opportunityId,
            opp.direction,
            opp.name,
            `${opp.symbol} / USD`,
            opp.icon,
            opp.opportunityScore,
            opp.confidenceScore,
            opp.riskScore,
            opp.riskLevel,
            opp.expectedReturn,
            opp.reasoningText,
            opp.suggestedEntry,
            opp.suggestedStopLoss,
            opp.suggestedTakeProfit,
            opp.suggestedTakeProfit1,
            opp.suggestedTakeProfit2,
            opp.suggestedTakeProfit3,
            opp.expectedDuration,
            opp.riskRewardRatio,
            opp.trendDirection,
            opp.trendStrength,
            JSON.stringify(opp.supportLevels),
            JSON.stringify(opp.resistanceLevels),
            opp.tradeProbability,
            opp.strategyUsed,
            opp.tradeQuality,
            opp.nearestSupport,
            opp.nearestResistance,
            opp.distanceToSupport,
            opp.distanceToResistance,
            opp.marketBias
          ]
        );
      }

      // If no userId is provided, we only wanted to update the global opportunities
      if (!userId) {
        console.log('[RecommendationEngine] Global market opportunities updated.');
        return;
      }

      // 4. Fetch user's risk stance
      const riskProfile = await dbGet('SELECT * FROM risk_profiles WHERE user_id = ?', [userId]);
      if (!riskProfile) return;

      const riskStance = riskProfile.risk_stance.toLowerCase(); // 'conservative', 'balanced', 'aggressive'

      // 5. Fetch active portfolio & holdings
      const portfolio = await dbGet('SELECT * FROM portfolios WHERE user_id = ?', [userId]);
      if (!portfolio) return;

      const holdings = await dbQuery('SELECT * FROM portfolio_assets WHERE portfolio_id = ?', [portfolio.id]);
      
      // Calculate active allocations in portfolio
      const holdingsAllocation = {};
      holdings.forEach(h => {
        holdingsAllocation[h.asset_symbol] = h.allocation_pct;
      });

      // 6. Clean up old pending recommendations for this user
      await dbRun("DELETE FROM araiven_recommendations WHERE user_id = ? AND status = 'pending'", [userId]);

      // 7. Generate target allocations dynamically based on User Stance and Opportunity Scores
      const targetAllocations = [];
      
      // Determine stablecoin reserve percentage and risk score threshold based on stance
      let stableReservePct = 15.0;
      let riskScoreThreshold = 65;
      
      if (riskStance === 'conservative') {
        stableReservePct = 30.0;
        riskScoreThreshold = 40;
      } else if (riskStance === 'aggressive') {
        stableReservePct = 10.0;
        riskScoreThreshold = 80;
      }
      
      // Filter assets that are within acceptable risk levels and have active long/wait/hold setups
      const eligibleOpps = rankedOpps.filter(opp => 
        opp.riskScore < riskScoreThreshold && 
        (opp.direction === 'LONG' || opp.direction === 'WAIT' || opp.direction === 'HOLD')
      );
      
      if (eligibleOpps.length > 0) {
        // Calculate sum of opportunity scores of eligible assets
        const totalScore = eligibleOpps.reduce((sum, opp) => sum + opp.opportunityScore, 0);
        
        // Distribute the remaining percentage among eligible assets
        const allocatablePct = 100.0 - stableReservePct;
        
        for (const opp of eligibleOpps) {
          const scoreWeight = opp.opportunityScore / totalScore;
          const targetPct = Math.round((scoreWeight * allocatablePct) * 10) / 10; // Round to 1 decimal place
          
          targetAllocations.push({
            opportunityId: opp.opportunityId,
            targetPct,
            symbol: opp.symbol
          });
        }
        
        // Add stablecoin allocation for the remainder to ensure sum is exactly 100%
        const allocatedOppsPct = targetAllocations.reduce((sum, t) => sum + t.targetPct, 0);
        const actualStablePct = Math.round((100.0 - allocatedOppsPct) * 10) / 10;
        if (actualStablePct > 0) {
          targetAllocations.push({
            opportunityId: 'stablecoin-reserve',
            targetPct: actualStablePct,
            symbol: 'USDC' // fallback stablecoin
          });
        }
      } else {
        // All in stables
        targetAllocations.push({
          opportunityId: 'stablecoin-reserve',
          targetPct: 100.0,
          symbol: 'USDC'
        });
      }

      // 8. Determine recommended changes
      const isInitialStable = holdingsAllocation['USDC'] >= 95.0 || (holdings.length === 1 && holdings[0].asset_symbol === 'USDC');

      for (const target of targetAllocations) {
        // USDC / stable reserves are our default state and funding source,
        // so we skip recommending explicit trades for the stable reserves themselves.
        if (target.symbol === 'USDC' || target.opportunityId === 'stablecoin-reserve') {
          continue;
        }

        const currentAllocation = holdingsAllocation[target.symbol] || 0.0;
        const deviation = target.targetPct - currentAllocation;

        if (isInitialStable || Math.abs(deviation) >= 5.0) {
          const scored = scoredAssets[target.symbol];
          const explanation = scored 
            ? `Araiven recommends allocating ${target.targetPct}% reserves to ${target.symbol} because: ` + scored.scores.reasoningText
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
