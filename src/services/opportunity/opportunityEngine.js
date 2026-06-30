/**
 * OpportunityEngine
 * 
 * Responsibility: Main orchestrator for all market analysis.
 * 
 * This is the top-level engine that:
 *   1. Receives market data for all tracked assets
 *   2. Runs each asset through the full 14-stage Araiven Decision Pipeline
 *   3. Applies risk evaluation and veto rules
 *   4. Generates complete trade plans
 *   5. Generates structured explainable reasoning
 *   6. Ranks all opportunities by Opportunity Score (descending)
 *   7. Returns a clean, production-ready OpportunityResult[] array
 * 
 * Architecture: Designed for future expansion. Additional signal inputs
 * (Funding Rates, Open Interest, News, On-chain, Macro, ETF Flows) can be
 * injected via the `externalSignals` parameter without restructuring this engine.
 * 
 * Framework ref: Araiven Intelligence Framework §2 — Decision Pipeline
 */

import { ScoringEngine } from '../scoring/scoringEngine.js';
import { evaluateRisk } from './riskEvaluator.js';
import { TradePlanningService } from '../tradePlanning/tradePlanningService.js';
import { ReasoningEngine } from './reasoningEngine.js';

/**
 * Asset metadata: static properties not derived from market data.
 * Add new assets here as the platform expands.
 */
const ASSET_METADATA = {
  BTC: { name: 'Bitcoin', icon: '₿', opportunityId: 'btc-halving', type: 'momentum' },
  ETH: { name: 'Ethereum', icon: 'Ξ', opportunityId: 'eth-staking', type: 'momentum' },
  SOL: { name: 'Solana', icon: 'S', opportunityId: 'solana-liquidity', type: 'momentum' },
  BNB: { name: 'Binance Coin', icon: 'B', opportunityId: 'bnb-breakout', type: 'momentum' },
  SUI: { name: 'Sui', icon: 'U', opportunityId: 'sui-alpha', type: 'momentum' }
};

/**
 * Direction decision engine.
 * 
 * Implements the 5-condition gate from the framework §5.
 * Returns LONG, SHORT, WAIT, or HOLD based on quantitative evidence only.
 * 
 * §5 LONG: Trend=Bullish AND RSI 40-70 AND OppScore>=60 AND Risk<65 AND Volume>=45
 * §5 SHORT: Trend=Bearish AND RSI 30-60 AND OppScore<45 AND Risk<65 AND Volume>=45
 * §5 WAIT: Partially qualifying setup (OppScore 45-59)
 * §5 HOLD: No qualifying directional setup, no crisis conditions
 */
function decideDirection(trendDirection, rsi, opportunityScore, riskScore, volumeConfirmation, isVetoed) {
  // §5 Rule 1: Risk veto overrides all
  if (isVetoed) return 'WAIT';

  const longConditions = [
    trendDirection === 'Bullish',
    rsi >= 40 && rsi <= 70,
    opportunityScore >= 60,
    riskScore < 65,
    volumeConfirmation >= 45
  ];

  const shortConditions = [
    trendDirection === 'Bearish',
    rsi >= 30 && rsi <= 60,
    opportunityScore < 45,
    riskScore < 65,
    volumeConfirmation >= 45
  ];

  const longMet = longConditions.filter(Boolean).length;
  const shortMet = shortConditions.filter(Boolean).length;

  // All 5 LONG conditions met
  if (longMet === 5) return 'LONG';

  // All 5 SHORT conditions met
  if (shortMet === 5) return 'SHORT';

  // 4 LONG conditions met — partial setup forming
  if (longMet === 4 && opportunityScore >= 50) return 'WAIT';

  // 4 SHORT conditions met — partial short forming
  if (shortMet === 4 && opportunityScore < 50) return 'WAIT';

  // No clear setup
  return 'HOLD';
}

/**
 * Runs the full Araiven Decision Pipeline for a single asset.
 * 
 * @param {Object} ticker - Live ticker data from MarketDataService
 * @param {Object} assetDetails - OHLCV history from MarketDataService
 * @param {Array} allTickers - All tickers for relative calculations
 * @param {Object} externalSignals - Future: { fundingRate, openInterest, newsScore, onChainScore, etfFlow }
 * @returns {Object} Complete opportunity result for this asset
 */
function analyzeAsset(ticker, assetDetails, allTickers, externalSignals = {}) {
  const symbol = ticker.symbol;
  const meta = ASSET_METADATA[symbol] || {
    name: symbol,
    icon: '?',
    opportunityId: symbol.toLowerCase() + '-opportunity',
    type: 'momentum'
  };

  // -----------------------------------------------------------------------
  // Stages 3–8: Run all signal analyzers via ScoringEngine
  // -----------------------------------------------------------------------
  const scoringResult = ScoringEngine.calculateAssetScores(ticker, assetDetails, allTickers);

  const {
    trendStrength,
    trendDirection,
    relativeMomentum,
    volatilityScore,
    volumeConfirmation,
    opportunityScore,
    confidenceScore,
    supportLevels,
    resistanceLevels,
    // Raw analyzer results for reasoning
    _analyzerResults: analyzerResults
  } = scoringResult;

  const rsi = scoringResult._rsi ?? 50;
  const annVol = scoringResult._annualizedVolatility ?? 0.65;

  // 1. Determine Potential Direction (without veto check)
  const potentialDirection = opportunityScore >= 50 ? 'LONG' : 'SHORT';

  // 2. Generate potential trade plan to evaluate Risk/Reward
  const potentialTradePlan = TradePlanningService.generateTradePlan({
    price: ticker.price,
    direction: potentialDirection,
    supportLevels,
    resistanceLevels,
    volatilityScore,
    annualizedVolatility: annVol,
    trendDirection,
    trendStrength,
    momentumScore: scoringResult._momentumScore,
    opportunityScore,
    confidenceScore
  });

  // 3. Evaluate Risk using the pluggable Risk Engine
  const riskAssessment = evaluateRisk({
    volatilityScore,
    annualizedVolatility: annVol,
    trendStrength,
    trendDirection,
    momentumDirection: scoringResult._momentumDirection,
    structureBias: scoringResult._structureBias,
    opportunityScore,
    confidenceScore,
    suggestedDirection: potentialDirection,
    suggestedEntry: potentialTradePlan.suggestedEntry,
    suggestedStopLoss: potentialTradePlan.suggestedStopLoss,
    suggestedTakeProfit: potentialTradePlan.suggestedTakeProfit,
    riskRewardRatio: potentialTradePlan.riskRewardRatio
  }, externalSignals);

  // 4. Decide Final Direction
  const direction = decideDirection(
    trendDirection,
    rsi,
    opportunityScore,
    riskAssessment.riskScore,
    volumeConfirmation,
    riskAssessment.isVetoed
  );

  // 5. Finalize Trade Plan based on direction and veto
  const tradePlan = { ...potentialTradePlan };
  if (direction === 'WAIT' || direction === 'HOLD') {
    tradePlan.suggestedEntry = 0;
    tradePlan.suggestedStopLoss = 0;
    tradePlan.suggestedTakeProfit = 0;
    tradePlan.suggestedTakeProfit1 = 0;
    tradePlan.suggestedTakeProfit2 = 0;
    tradePlan.suggestedTakeProfit3 = 0;
    tradePlan.riskRewardRatio = 'N/A';
    tradePlan.expectedDuration = 'N/A';
    tradePlan.tradeQuality = 'Avoid';
    tradePlan.probability = 0;
  } else {
    // Override trade quality with the more comprehensive Risk Engine classification
    tradePlan.tradeQuality = riskAssessment.tradeQuality;
  }

  // -----------------------------------------------------------------------
  // Expected return estimate (directional, evidence-based)
  // Based on distance to TP from entry as a percentage
  // -----------------------------------------------------------------------
  let expectedReturn = 'N/A';
  if (direction === 'LONG' && tradePlan.suggestedEntry > 0 && tradePlan.suggestedTakeProfit > 0) {
    const upside = ((tradePlan.suggestedTakeProfit - tradePlan.suggestedEntry) / tradePlan.suggestedEntry) * 100;
    expectedReturn = `+${upside.toFixed(1)}%`;
  } else if (direction === 'SHORT' && tradePlan.suggestedEntry > 0 && tradePlan.suggestedTakeProfit > 0) {
    const downside = ((tradePlan.suggestedEntry - tradePlan.suggestedTakeProfit) / tradePlan.suggestedEntry) * 100;
    expectedReturn = `+${downside.toFixed(1)}% (short)`;
  } else if (direction === 'WAIT') {
    expectedReturn = 'Setup forming';
  }

  // Assemble raw analyzer results for the reasoning generator
  const trendResult = { 
    trendDirection, 
    trendStrength, 
    trendDeviation: scoringResult._trendDeviation,
    explanation: scoringResult._trendExplanation
  };
  const momentumResult = { 
    rsi, 
    momDifference: scoringResult._momDifference, 
    relativeMomentum,
    explanation: scoringResult._momentumExplanation
  };
  const volumeResult = { volumeRatio: scoringResult._volumeRatio, volumeConfirmation };
  const volatilityResult = { annualizedVolatility: annVol, volatilityScore };
  const structureResult = { 
    supportLevels, 
    resistanceLevels,
    bias: scoringResult._structureBias,
    strength: scoringResult._structureStrength,
    explanation: scoringResult._structureExplanation
  };
  const supportResistanceResult = {
    supportLevels: scoringResult._supportLevels,
    resistanceLevels: scoringResult._resistanceLevels,
    nearestSupport: scoringResult._nearestSupport,
    nearestResistance: scoringResult._nearestResistance,
    distanceToSupport: scoringResult._distanceToSupport,
    distanceToResistance: scoringResult._distanceToResistance,
    supportStrength: scoringResult._supportStrength,
    resistanceStrength: scoringResult._resistanceStrength,
    explanation: scoringResult._supportResistanceExplanation
  };

  return {
    // Identity
    symbol,
    name: meta.name,
    icon: meta.icon,
    opportunityId: meta.opportunityId,
    type: meta.type,

    // Scores
    opportunityScore,
    riskScore: riskAssessment.riskScore,
    confidenceScore,
    riskLevel: riskAssessment.riskLevel,
    marketBias: scoringResult.marketBias,

    // Momentum
    momentumScore: scoringResult._momentumScore,
    momentumDirection: scoringResult._momentumDirection,

    // Market Structure
    structureBias: scoringResult._structureBias,
    structureStrength: scoringResult._structureStrength,

    // Support & Resistance
    supportLevels: scoringResult._supportLevels,
    resistanceLevels: scoringResult._resistanceLevels,
    nearestSupport: scoringResult._nearestSupport,
    nearestResistance: scoringResult._nearestResistance,
    distanceToSupport: scoringResult._distanceToSupport,
    distanceToResistance: scoringResult._distanceToResistance,
    supportStrength: scoringResult._supportStrength,
    resistanceStrength: scoringResult._resistanceStrength,

    // Direction
    direction,
    suggestedDirection: direction,

    // Trade Plan
    suggestedEntry: tradePlan.suggestedEntry,
    suggestedStopLoss: tradePlan.suggestedStopLoss,
    suggestedTakeProfit: tradePlan.suggestedTakeProfit,
    suggestedTakeProfit1: tradePlan.suggestedTakeProfit1,
    suggestedTakeProfit2: tradePlan.suggestedTakeProfit2,
    suggestedTakeProfit3: tradePlan.suggestedTakeProfit3,
    tradeProbability: tradePlan.probability,
    strategyUsed: tradePlan.strategyUsed,
    riskRewardRatio: tradePlan.riskRewardRatio,
    expectedDuration: tradePlan.expectedDuration,
    tradeQuality: tradePlan.tradeQuality,
    recommendedPositionSize: riskAssessment.recommendedPositionSize,

    // Market Context
    trendDirection,
    trendStrength,
    supportLevels,
    resistanceLevels,
    expectedReturn,

    // Raw signal data for reasoning
    _trendResult: trendResult,
    _momentumResult: momentumResult,
    _volumeResult: volumeResult,
    _volatilityResult: volatilityResult,
    _structureResult: structureResult,
    _supportResistanceResult: supportResistanceResult,
    _riskAssessment: riskAssessment
  };
}

/**
 * Main entry point for the Opportunity Engine.
 * 
 * Analyzes all assets, generates reasoning, and returns a ranked list.
 * 
 * @param {Array} tickers - Live tickers from MarketDataService
 * @param {Function} getAssetDetails - Async function to fetch OHLCV for a symbol
 * @param {Object} externalSignals - Future signal inputs (Funding Rates, News, etc.)
 * @returns {Promise<Array>} Ranked opportunity results, highest score first
 */
export async function runOpportunityEngine(tickers, getAssetDetails, externalSignals = {}) {
  console.log(`[OpportunityEngine] Starting full analysis for ${tickers.length} assets...`);

  const rawResults = [];

  // Stage 1–8: Analyze each asset
  for (const ticker of tickers) {
    try {
      const details = await getAssetDetails(ticker.symbol);
      const result = analyzeAsset(ticker, details, tickers, externalSignals);
      rawResults.push(result);
    } catch (err) {
      console.error(`[OpportunityEngine] Failed to analyze ${ticker.symbol}:`, err.message);
    }
  }

  // Stage 14: Generate reasoning now that we have all results for cross-asset comparison
  const resultsWithReasoning = rawResults.map(result => {
    const structuredExplanation = ReasoningEngine.generateStructuredExplanation({
      symbol: result.symbol,
      direction: result.direction,
      opportunityScore: result.opportunityScore,
      confidenceScore: result.confidenceScore,
      trendResult: result._trendResult,
      momentumResult: result._momentumResult,
      volumeResult: result._volumeResult,
      volatilityResult: result._volatilityResult,
      structureResult: result._structureResult,
      supportResistanceResult: result._supportResistanceResult,
      riskAssessment: result._riskAssessment,
      tradePlan: {
        suggestedEntry: result.suggestedEntry,
        suggestedStopLoss: result.suggestedStopLoss,
        suggestedTakeProfit: result.suggestedTakeProfit,
        riskRewardRatio: result.riskRewardRatio,
        expectedDuration: result.expectedDuration,
        tradeQuality: result.tradeQuality
      }
    });

    const reasoning = JSON.stringify(structuredExplanation);

    // Strip internal raw analyzer fields before returning
    const { _trendResult, _momentumResult, _volumeResult, _volatilityResult, _structureResult, _supportResistanceResult, _riskAssessment, ...cleanResult } = result;
    return { ...cleanResult, reasoningText: reasoning };
  });

  // Rank: highest Opportunity Score first
  resultsWithReasoning.sort((a, b) => b.opportunityScore - a.opportunityScore);

  console.log(`[OpportunityEngine] Analysis complete. Top asset: ${resultsWithReasoning[0]?.symbol} (Score: ${resultsWithReasoning[0]?.opportunityScore})`);

  return resultsWithReasoning;
}
