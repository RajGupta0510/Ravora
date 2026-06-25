import { TrendAnalyzer } from './analyzers/trendAnalyzer.js';
import { MomentumAnalyzer } from './analyzers/momentumAnalyzer.js';
import { VolatilityAnalyzer } from './analyzers/volatilityAnalyzer.js';
import { VolumeAnalyzer } from './analyzers/volumeAnalyzer.js';
import { MarketStructureAnalyzer } from './analyzers/marketStructureAnalyzer.js';
import { PriceActionAnalyzer } from './analyzers/priceActionAnalyzer.js';

// Registry of modular signal analyzers
const analyzersRegistry = [
  new TrendAnalyzer(),
  new MomentumAnalyzer(),
  new VolatilityAnalyzer(),
  new VolumeAnalyzer(),
  new MarketStructureAnalyzer(),
  new PriceActionAnalyzer()
];

export const ScoringEngine = {
  /**
   * Evaluates a target asset against the market and calculates quantitative scores
   * @param {Object} ticker - Standardized ticker information
   * @param {Object} assetDetails - Standardized asset details containing history
   * @param {Array<Object>} allTickers - Latest tickers of all assets (for relative calculations)
   * @returns {Object} Calculated scores and explainability details
   */
  calculateAssetScores(ticker, assetDetails, allTickers = []) {
    const results = {};
    const reasoning = [];

    // Run all registered signal analyzers
    for (const analyzer of analyzersRegistry) {
      try {
        const res = analyzer.analyze(ticker, assetDetails, allTickers);
        results[analyzer.name] = res;
        if (res.reasoning && Array.isArray(res.reasoning)) {
          reasoning.push(...res.reasoning);
        }
      } catch (err) {
        console.error(`[ScoringEngine] Error running analyzer ${analyzer.name}:`, err);
      }
    }

    // Extract values from analyzer results
    const trendStrength = results.Trend?.trendStrength ?? 50;
    const trendDirection = results.Trend?.trendDirection ?? 'Range';
    
    const volatilityScore = results.Volatility?.volatilityScore ?? 50;
    const annVol = results.Volatility?.annualizedVolatility ?? 0.5;

    const relativeMomentum = results.Momentum?.relativeMomentum ?? 50;
    const rsi = results.Momentum?.rsi ?? 50;

    const volumeConfirmation = results.Volume?.volumeConfirmation ?? 50;

    const supportLevels = results.MarketStructure?.supportLevels ?? [ticker.price * 0.95, ticker.price * 0.9];
    const resistanceLevels = results.MarketStructure?.resistanceLevels ?? [ticker.price * 1.05, ticker.price * 1.1];

    // Compute composite normalized scores
    const opportunityScore = Math.round((trendStrength * 0.4) + (relativeMomentum * 0.4) + (volumeConfirmation * 0.2));
    const riskScore = Math.round((volatilityScore * 0.6) + ((100 - trendStrength) * 0.4));
    const confidenceScore = Math.round((trendStrength * 0.4) + (volumeConfirmation * 0.4) + ((100 - volatilityScore) * 0.2));

    // Classify suggested direction (LONG, SHORT, HOLD)
    let suggestedDirection = 'HOLD';
    if (trendDirection === 'Bullish' && rsi >= 45 && opportunityScore >= 60) {
      suggestedDirection = 'LONG';
    } else if (trendDirection === 'Bearish' && rsi <= 55 && opportunityScore < 45) {
      suggestedDirection = 'SHORT';
    } else {
      suggestedDirection = 'HOLD';
    }

    // Generate trade setups based on suggested direction
    let suggestedEntry = 0;
    let suggestedStopLoss = 0;
    let suggestedTakeProfit = 0;
    let expectedDuration = 'N/A';
    let riskRewardRatio = 'N/A';

    const currentPrice = ticker.price;
    const S1 = supportLevels[0];
    const R1 = resistanceLevels[0];

    if (suggestedDirection === 'LONG') {
      suggestedEntry = Math.round(currentPrice * 0.995 * 100) / 100;
      suggestedStopLoss = Math.round(S1 * 0.98 * 100) / 100;
      suggestedTakeProfit = Math.round(R1 * 1.01 * 100) / 100;
      
      if (suggestedStopLoss >= suggestedEntry) suggestedStopLoss = Math.round(suggestedEntry * 0.97 * 100) / 100;
      if (suggestedTakeProfit <= suggestedEntry) suggestedTakeProfit = Math.round(suggestedEntry * 1.08 * 100) / 100;

      expectedDuration = annVol > 0.8 ? '1-2 days' : (annVol < 0.4 ? '7-10 days' : '3-5 days');
    } else if (suggestedDirection === 'SHORT') {
      suggestedEntry = Math.round(currentPrice * 1.005 * 100) / 100;
      suggestedStopLoss = Math.round(R1 * 1.02 * 100) / 100;
      suggestedTakeProfit = Math.round(S1 * 0.99 * 100) / 100;
      
      if (suggestedStopLoss <= suggestedEntry) suggestedStopLoss = Math.round(suggestedEntry * 1.03 * 100) / 100;
      if (suggestedTakeProfit >= suggestedEntry) suggestedTakeProfit = Math.round(suggestedEntry * 0.92 * 100) / 100;

      expectedDuration = annVol > 0.8 ? '1-2 days' : (annVol < 0.4 ? '7-10 days' : '3-5 days');
    } else {
      // Suggested Direction is HOLD
      suggestedEntry = 0;
      suggestedStopLoss = 0;
      suggestedTakeProfit = 0;
      expectedDuration = 'N/A';
      reasoning.push('Consolidation signals or conflicting indicator setups warrant a defensive HOLD stance.');
    }

    if (suggestedDirection !== 'HOLD') {
      const riskDiff = Math.abs(suggestedEntry - suggestedStopLoss);
      const rewardDiff = Math.abs(suggestedTakeProfit - suggestedEntry);
      if (riskDiff > 0) {
        riskRewardRatio = `${(rewardDiff / riskDiff).toFixed(1)}:1`;
      }
    }

    return {
      trendStrength,
      volatilityScore,
      relativeMomentum,
      volumeConfirmation,
      opportunityScore,
      riskScore,
      confidenceScore,
      reasoning,
      trendDirection,
      supportLevels,
      resistanceLevels,
      suggestedEntry,
      suggestedStopLoss,
      suggestedTakeProfit,
      riskRewardRatio,
      expectedDuration,
      suggestedDirection
    };
  }
};
