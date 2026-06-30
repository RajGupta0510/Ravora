import { evaluateTrendScore, evaluateMomentumScore, evaluateStructureScore, evaluateSRScore } from './scoringRules.js';

/**
 * Abstract Base Class for all pluggable Scoring Models.
 */
export class BaseScoringModel {
  constructor(name) {
    if (this.constructor === BaseScoringModel) {
      throw new Error("BaseScoringModel is abstract and cannot be instantiated directly.");
    }
    this.name = name;
  }

  evaluate(inputs, weights) {
    throw new Error("Method 'evaluate(inputs, weights)' must be implemented by subclass.");
  }
}

/**
 * Pluggable Model: Opportunity Score
 * Combines the normalized scores of all modules using the configured weights.
 */
export class OpportunityScoreModel extends BaseScoringModel {
  constructor() {
    super('OpportunityScore');
  }

  evaluate(inputs, weights) {
    const trendScore = evaluateTrendScore(inputs.trendDirection, inputs.trendStrength);
    const momentumScore = evaluateMomentumScore(inputs.momentumDirection, inputs.momentumScore);
    const structureScore = evaluateStructureScore(inputs.structureBias, inputs.structureStrength);
    const srScore = evaluateSRScore(inputs.distanceToSupport, inputs.distanceToResistance);

    const oppWeights = weights.opportunity;
    const compositeScore = 
      (trendScore * oppWeights.trend) +
      (momentumScore * oppWeights.momentum) +
      (structureScore * oppWeights.marketStructure) +
      (srScore * oppWeights.supportResistance);

    return Math.round(compositeScore);
  }
}

/**
 * Pluggable Model: Confidence Score
 * Evaluates the reliability and strength of each indicator model.
 */
export class ConfidenceScoreModel extends BaseScoringModel {
  constructor() {
    super('ConfidenceScore');
  }

  evaluate(inputs, weights) {
    const trendStrength = inputs.trendStrength || 50;
    const momentumStrength = inputs.momentumScore || 50; // Use momentum score as strength proxy
    const structureStrength = inputs.structureStrength || 50;
    
    // Level strength is based on S&R touches (1 touch = 25%, 4+ touches = 100%)
    const levelStrength = Math.max(inputs.supportStrength || 50, inputs.resistanceStrength || 50);

    const confWeights = weights.confidence;
    const compositeConfidence = 
      (trendStrength * confWeights.trendStrength) +
      (momentumStrength * confWeights.momentumStrength) +
      (structureStrength * confWeights.structureStrength) +
      (levelStrength * confWeights.levelStrength);

    return Math.round(compositeConfidence);
  }
}

/**
 * Pluggable Model: Market Bias
 * Resolves the overall directional bias of the market based on indicator votes.
 */
export class MarketBiasModel extends BaseScoringModel {
  constructor() {
    super('MarketBias');
  }

  evaluate(inputs, weights) {
    let bullishVotes = 0;
    let bearishVotes = 0;

    // Vote 1: Trend Direction
    if (inputs.trendDirection === 'Bullish') bullishVotes++;
    else if (inputs.trendDirection === 'Bearish') bearishVotes++;

    // Vote 2: Momentum Direction
    if (inputs.momentumDirection === 'Strengthening') bullishVotes++;
    else if (inputs.momentumDirection === 'Weakening') bearishVotes++;

    // Vote 3: Market Structure Bias
    if (inputs.structureBias === 'Bullish') bullishVotes++;
    else if (inputs.structureBias === 'Bearish') bearishVotes++;

    if (bullishVotes >= 2) return 'Bullish';
    if (bearishVotes >= 2) return 'Bearish';
    return 'Neutral';
  }
}
