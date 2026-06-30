import { TrendAnalyzer } from './analyzers/trendAnalyzer.js';
import { MomentumAnalyzer } from './analyzers/momentumAnalyzer.js';
import { VolatilityAnalyzer } from './analyzers/volatilityAnalyzer.js';
import { VolumeAnalyzer } from './analyzers/volumeAnalyzer.js';
import { MarketStructureAnalyzer } from './analyzers/marketStructureAnalyzer.js';
import { PriceActionAnalyzer } from './analyzers/priceActionAnalyzer.js';
import { SupportResistanceAnalyzer } from './analyzers/supportResistanceAnalyzer.js';
import { ScoringService } from './scoringService.js';

// Registry of modular signal analyzers.
// Adding a new signal: create a class extending BaseAnalyzer and push it here.
const analyzersRegistry = [
  new TrendAnalyzer(),
  new MomentumAnalyzer(),
  new VolatilityAnalyzer(),
  new VolumeAnalyzer(),
  new MarketStructureAnalyzer(),
  new PriceActionAnalyzer(),
  new SupportResistanceAnalyzer()
];

export const ScoringEngine = {
  /**
   * Runs all registered signal analyzers against an asset and computes composite scores.
   * 
   * Composite Score Formulas (per Araiven Intelligence Framework §4):
   *   Opportunity Score = round( (TrendStrength × 0.40) + (Momentum × 0.40) + (Volume × 0.20) )
   *   Risk Score        = round( (Volatility × 0.60) + ((100 - TrendStrength) × 0.40) )
   *   Confidence Score  = round( (TrendStrength × 0.40) + (Volume × 0.40) + ((100 - Volatility) × 0.20) )
   * 
   * @param {Object} ticker - Standardized ticker { symbol, price, change24h, volume24h, marketCap }
   * @param {Object} assetDetails - { history: [{open, high, low, close, volume, timestamp}] }
   * @param {Array<Object>} allTickers - All tracked tickers for relative calculations
   * @returns {Object} All scores + raw intermediate values prefixed with _
   */
  calculateAssetScores(ticker, assetDetails, allTickers = []) {
    const analyzerResults = {};
    const reasoning = [];

    // Run all registered signal analyzers
    for (const analyzer of analyzersRegistry) {
      try {
        const res = analyzer.analyze(ticker, assetDetails, allTickers);
        analyzerResults[analyzer.name] = res;
        if (res.reasoning && Array.isArray(res.reasoning)) {
          reasoning.push(...res.reasoning);
        }
      } catch (err) {
        console.error(`[ScoringEngine] Analyzer ${analyzer.name} failed:`, err.message);
      }
    }

    // Extract values from analyzer results with safe defaults
    const trendStrength     = analyzerResults.Trend?.trendStrength ?? 50;
    const trendDirection    = analyzerResults.Trend?.trendDirection ?? 'Range';
    const trendDeviation    = analyzerResults.Trend?.trendDeviation ?? 0;

    const volatilityScore   = analyzerResults.Volatility?.volatilityScore ?? 50;
    const annVol            = analyzerResults.Volatility?.annualizedVolatility ?? 0.65;

    const relativeMomentum  = analyzerResults.Momentum?.relativeMomentum ?? 50;
    const rsi               = analyzerResults.Momentum?.rsi ?? 50;
    const momDifference     = analyzerResults.Momentum?.momDifference ?? 0;

    const volumeConfirmation = analyzerResults.Volume?.volumeConfirmation ?? 50;
    const volumeRatio        = analyzerResults.Volume?.volumeRatio ?? 1.0;

    const supportLevels     = analyzerResults.MarketStructure?.supportLevels ?? [ticker.price * 0.95, ticker.price * 0.90];
    const resistanceLevels  = analyzerResults.MarketStructure?.resistanceLevels ?? [ticker.price * 1.05, ticker.price * 1.10];

    // -----------------------------------------------------------------------
    // Modular Scoring Service Evaluation
    // -----------------------------------------------------------------------
    const scoringResult = ScoringService.evaluateScores({
      trendDirection,
      trendStrength,
      momentumDirection: analyzerResults.Momentum?.momentumDirection ?? 'Neutral',
      momentumScore: analyzerResults.Momentum?.momentumScore ?? 50,
      structureBias: analyzerResults.MarketStructure?.structureBias ?? 'Neutral',
      structureStrength: analyzerResults.MarketStructure?.structureStrength ?? 50,
      distanceToSupport: analyzerResults.SupportResistance?.distanceToSupport ?? 5.0,
      distanceToResistance: analyzerResults.SupportResistance?.distanceToResistance ?? 5.0,
      supportStrength: analyzerResults.SupportResistance?.supportStrength ?? 50,
      resistanceStrength: analyzerResults.SupportResistance?.resistanceStrength ?? 50
    });

    const opportunityScore = scoringResult.opportunityScore;
    const confidenceScore = scoringResult.confidenceScore;

    // §4.2 Risk Score: measures how dangerous the current conditions are
    // (handled more fully by RiskEvaluator, but computed here for backwards compat)
    const riskScore = Math.min(100, Math.max(0,
      Math.round((volatilityScore * 0.60) + ((100 - trendStrength) * 0.40))
    ));

    return {
      // Composite scores
      opportunityScore,
      riskScore,
      confidenceScore,
      marketBias: scoringResult.marketBias,
      scoringSummary: scoringResult.summary,

      // Signal scores used in composites
      trendStrength,
      trendDirection,
      volatilityScore,
      relativeMomentum,
      volumeConfirmation,
      supportLevels,
      resistanceLevels,

      // Raw reasoning sentences (legacy support)
      reasoning,

      // Raw intermediate values exposed for OpportunityEngine modules
      // Prefixed with _ to signal "internal use"
      _rsi: rsi,
      _annualizedVolatility: annVol,
      _trendDeviation: trendDeviation,
      _trendExplanation: analyzerResults.Trend?.reasoning?.[0],
      _momDifference: momDifference,
      _volumeRatio: volumeRatio,
      _momentumScore: analyzerResults.Momentum?.momentumScore ?? 50,
      _momentumDirection: analyzerResults.Momentum?.momentumDirection ?? 'Neutral',
      _momentumExplanation: analyzerResults.Momentum?.reasoning?.[0] ?? '',
      _structureBias: analyzerResults.MarketStructure?.structureBias ?? 'Neutral',
      _structureStrength: analyzerResults.MarketStructure?.structureStrength ?? 50,
      _structureExplanation: analyzerResults.MarketStructure?.reasoning?.[0] ?? '',
      _supportLevels: analyzerResults.SupportResistance?.supportLevels ?? [ticker.price * 0.95, ticker.price * 0.90],
      _resistanceLevels: analyzerResults.SupportResistance?.resistanceLevels ?? [ticker.price * 1.05, ticker.price * 1.10],
      _nearestSupport: analyzerResults.SupportResistance?.nearestSupport ?? (ticker.price * 0.95),
      _nearestResistance: analyzerResults.SupportResistance?.nearestResistance ?? (ticker.price * 1.05),
      _distanceToSupport: analyzerResults.SupportResistance?.distanceToSupport ?? 5.0,
      _distanceToResistance: analyzerResults.SupportResistance?.distanceToResistance ?? 5.0,
      _supportStrength: analyzerResults.SupportResistance?.supportStrength ?? 50,
      _resistanceStrength: analyzerResults.SupportResistance?.resistanceStrength ?? 50,
      _supportResistanceExplanation: analyzerResults.SupportResistance?.reasoning?.[0] ?? ''
    };
  }
};

