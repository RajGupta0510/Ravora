import { WEIGHT_CONFIG } from './weightConfiguration.js';
import { OpportunityScoreModel, ConfidenceScoreModel, MarketBiasModel } from './scoringModels.js';

class ScoringServiceOrchestrator {
  constructor() {
    this.models = [];
    this.weights = WEIGHT_CONFIG;
    
    // Register default scoring models
    this.registerModel(new OpportunityScoreModel());
    this.registerModel(new ConfidenceScoreModel());
    this.registerModel(new MarketBiasModel());
  }

  /**
   * Registers a new scoring model.
   * 
   * @param {BaseScoringModel} model - Instance of a class extending BaseScoringModel
   */
  registerModel(model) {
    if (typeof model.evaluate !== 'function' || !model.name) {
      throw new Error(`Invalid scoring model interface for: ${model?.name || 'unknown'}`);
    }
    this.models = this.models.filter(m => m.name !== model.name);
    this.models.push(model);
  }

  /**
   * Updates the weight configuration.
   * 
   * @param {Object} newWeights - New weight configuration object
   */
  updateWeights(newWeights) {
    this.weights = { ...this.weights, ...newWeights };
  }

  /**
   * Combines outputs from all intelligence engines into a unified market assessment.
   * 
   * @param {Object} inputs - Combined outputs from Trend, Momentum, Structure, S&R, and Risk engines
   * @returns {Object} Unified market assessment
   */
  evaluateScores(inputs) {
    const results = {};

    // Run all registered scoring models
    for (const model of this.models) {
      try {
        results[model.name] = model.evaluate(inputs, this.weights);
      } catch (err) {
        console.error(`[ScoringService] Model ${model.name} failed:`, err.message);
      }
    }

    const opportunityScore = results.OpportunityScore !== undefined ? results.OpportunityScore : 50;
    const confidenceScore = results.ConfidenceScore !== undefined ? results.ConfidenceScore : 50;
    const marketBias = results.MarketBias || 'Neutral';

    // Compile a unified summary based on the scores
    const summary = this.compileSummary(opportunityScore, confidenceScore, marketBias, inputs.riskLevel || 'medium');

    return {
      opportunityScore,
      confidenceScore,
      marketBias,
      summary
    };
  }

  /**
   * Compiles a concise market summary based on the unified scores.
   */
  compileSummary(oppScore, confScore, bias, riskLevel) {
    let strengthText = 'moderate';
    if (confScore > 75) strengthText = 'strong';
    if (confScore < 35) strengthText = 'weak';

    let actionText = 'consolidation and range-bound behavior';
    if (oppScore > 75) actionText = 'high-probability bullish expansion';
    else if (oppScore < 25) actionText = 'high-probability bearish distribution';
    else if (oppScore > 55) actionText = 'moderate upward continuation';
    else if (oppScore < 45) actionText = 'moderate downward continuation';

    return `Araiven evaluates this asset as having a ${bias} bias with ${strengthText} conviction (Confidence: ${confScore}%). The scoring engine indicates ${actionText} under a ${riskLevel} risk regime.`;
  }
}

export const ScoringService = new ScoringServiceOrchestrator();
export { ScoringServiceOrchestrator };
