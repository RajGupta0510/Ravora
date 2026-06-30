import { StandardDecisionModel, ConservativeDecisionModel, AggressiveDecisionModel } from './decisionModels.js';
import { ScoringEngine } from '../scoring/scoringEngine.js';
import { evaluateRisk } from '../opportunity/riskEvaluator.js';
import { TradePlanningService } from '../tradePlanning/tradePlanningService.js';
import { ReasoningEngine } from '../opportunity/reasoningEngine.js';

class DecisionServiceOrchestrator {
  constructor() {
    this.models = {};
    this.activeModelName = 'Standard';

    // Register default decision models
    this.registerModel(new StandardDecisionModel());
    this.registerModel(new ConservativeDecisionModel());
    this.registerModel(new AggressiveDecisionModel());
  }

  /**
   * Registers a new decision model.
   * 
   * @param {BaseDecisionModel} model - Instance of a class extending BaseDecisionModel
   */
  registerModel(model) {
    if (typeof model.makeDecision !== 'function' || !model.name) {
      throw new Error(`Invalid decision model interface for: ${model?.name || 'unknown'}`);
    }
    this.models[model.name] = model;
  }

  /**
   * Sets the active decision model.
   * 
   * @param {string} name - Name of the registered decision model
   */
  setActiveModel(name) {
    if (!this.models[name]) {
      throw new Error(`Decision model ${name} is not registered.`);
    }
    this.activeModelName = name;
  }

  /**
   * Executes the full Araiven Decision Pipeline for a single asset.
   * Consolidates all underlying intelligence engines into a single decision object.
   * 
   * @param {Object} ticker - Live ticker data
   * @param {Object} assetDetails - Historical OHLCV data
   * @param {Array} allTickers - All tracked tickers
   * @param {Object} externalSignals - Future: macro/on-chain signal inputs
   * @returns {Object} Complete Decision Object
   */
  makeDecision(ticker, assetDetails, allTickers = [], externalSignals = {}) {
    // 1. Execute Scoring Engine (Trend, Momentum, Structure, S&R)
    const scoringResult = ScoringEngine.calculateAssetScores(ticker, assetDetails, allTickers);

    const {
      opportunityScore,
      confidenceScore,
      trendStrength,
      trendDirection,
      volatilityScore,
      supportLevels,
      resistanceLevels
    } = scoringResult;

    const rsi = scoringResult._rsi ?? 50;
    const annVol = scoringResult._annualizedVolatility ?? 0.65;

    // 2. Generate Potential Trade Plan to evaluate Risk/Reward
    const potentialDirection = opportunityScore >= 50 ? 'LONG' : 'SHORT';
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

    // 3. Execute Risk Engine (evaluateRisk)
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

    // 4. Resolve Final Recommendation using the active decision model
    const activeModel = this.models[this.activeModelName] || this.models['Standard'];
    const recommendation = activeModel.makeDecision({
      trendDirection,
      rsi,
      opportunityScore,
      riskScore: riskAssessment.riskScore,
      volumeConfirmation: scoringResult.volumeConfirmation,
      isVetoed: riskAssessment.isVetoed
    });

    // 5. Finalize Trade Plan based on final recommendation
    const tradePlan = { ...potentialTradePlan };
    if (recommendation === 'WAIT' || recommendation === 'HOLD') {
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
      tradePlan.tradeQuality = riskAssessment.tradeQuality;
    }

    // 6. Execute Reasoning Engine
    const structuredExplanation = ReasoningEngine.generateStructuredExplanation({
      symbol: ticker.symbol,
      direction: recommendation,
      opportunityScore,
      confidenceScore,
      trendResult: scoringResult._trendResult || { trendDirection, trendStrength, explanation: scoringResult._trendExplanation },
      momentumResult: { relativeMomentum: scoringResult.relativeMomentum, rsi, explanation: scoringResult._momentumExplanation },
      volumeResult: { volumeRatio: scoringResult._volumeRatio, volumeConfirmation: scoringResult.volumeConfirmation },
      volatilityResult: { annualizedVolatility: annVol, volatilityScore },
      structureResult: { bias: scoringResult._structureBias, strength: scoringResult._structureStrength, explanation: scoringResult._structureExplanation },
      supportResistanceResult: {
        nearestSupport: scoringResult._nearestSupport,
        nearestResistance: scoringResult._nearestResistance,
        distanceToSupport: scoringResult._distanceToSupport,
        distanceToResistance: scoringResult._distanceToResistance,
        supportStrength: scoringResult._supportStrength,
        resistanceStrength: scoringResult._resistanceStrength,
        explanation: scoringResult._supportResistanceExplanation
      },
      riskAssessment,
      tradePlan
    });

    // 7. Assemble the Complete Decision Object
    return {
      symbol: ticker.symbol,
      recommendation,
      opportunityScore,
      confidenceScore,
      riskScore: riskAssessment.riskScore,
      riskLevel: riskAssessment.riskLevel,
      tradeQuality: tradePlan.tradeQuality,
      recommendedPositionSize: riskAssessment.recommendedPositionSize,
      suggestedEntry: tradePlan.suggestedEntry,
      suggestedStopLoss: tradePlan.suggestedStopLoss,
      suggestedTakeProfit: tradePlan.suggestedTakeProfit,
      suggestedTakeProfit1: tradePlan.suggestedTakeProfit1,
      suggestedTakeProfit2: tradePlan.suggestedTakeProfit2,
      suggestedTakeProfit3: tradePlan.suggestedTakeProfit3,
      riskRewardRatio: tradePlan.riskRewardRatio,
      expectedDuration: tradePlan.expectedDuration,
      tradeProbability: tradePlan.probability,
      marketBias: scoringResult.marketBias,
      strategyUsed: tradePlan.strategyUsed,
      reasoningText: JSON.stringify(structuredExplanation),
      
      // Legacy compatibility fields
      direction: recommendation,
      suggestedDirection: recommendation,
      expectedReturn: (recommendation === 'LONG' ? 1.0 : (recommendation === 'SHORT' ? -1.0 : 0.0)) * (scoringResult._trendDeviation || 0.0),
      supportLevels,
      resistanceLevels,
      trendDirection,
      trendStrength
    };
  }
}

export const DecisionService = new DecisionServiceOrchestrator();
export { DecisionServiceOrchestrator };
