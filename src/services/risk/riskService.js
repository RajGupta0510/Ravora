import { VolatilityDrawdownRiskModel, IndicatorConfluenceRiskModel, RiskRewardRiskModel } from './riskModels.js';
import { calculatePositionSize } from './riskUtils.js';

class RiskServiceOrchestrator {
  constructor() {
    this.models = [];
    // Register default risk models
    this.registerModel(new VolatilityDrawdownRiskModel(0.4));
    this.registerModel(new IndicatorConfluenceRiskModel(0.3));
    this.registerModel(new RiskRewardRiskModel(0.3));
  }

  /**
   * Registers a new risk evaluation model.
   * 
   * @param {BaseRiskModel} model - Instance of a class extending BaseRiskModel
   */
  registerModel(model) {
    if (typeof model.evaluate !== 'function' || !model.name || model.weight === undefined) {
      throw new Error(`Invalid risk model interface for: ${model?.name || 'unknown'}`);
    }
    this.models = this.models.filter(m => m.name !== model.name);
    this.models.push(model);
    this.normalizeWeights();
  }

  /**
   * Normalizes the weights of all registered models to ensure they sum to 1.0
   */
  normalizeWeights() {
    const totalWeight = this.models.reduce((sum, m) => sum + m.weight, 0);
    if (totalWeight > 0) {
      this.models.forEach(m => {
        m.normalizedWeight = m.weight / totalWeight;
      });
    }
  }

  /**
   * Evaluates all risk dimensions for an asset and produces a comprehensive risk assessment.
   * 
   * @param {Object} inputs - Combined outputs from Trend, Momentum, S&R, Volatility, and Trade Plan
   * @param {number} capital - User's available capital (for position sizing)
   * @returns {Object} Structured risk assessment
   */
  evaluateRisk(inputs, capital = 132000) {
    const modelResults = [];
    let weightedScore = 0;
    let isVetoed = false;
    const explanations = [];

    // 1. Run evaluation on all registered models
    for (const model of this.models) {
      try {
        const result = model.evaluate(inputs);
        const weight = model.normalizedWeight || (1 / this.models.length);

        modelResults.push({
          name: model.name,
          weight,
          result
        });

        // Accumulate score
        weightedScore += result.score * weight;

        // Any model triggering a veto vetoes the entire trade
        if (result.isVetoed) {
          isVetoed = true;
        }

        if (result.explanation) {
          explanations.push(result.explanation);
        }
      } catch (err) {
        console.error(`[RiskService] Model ${model.name} failed:`, err.message);
      }
    }

    // 2. Resolve composite risk score and level
    let riskScore = Math.round(weightedScore);
    riskScore = Math.max(0, Math.min(100, riskScore));

    const riskLevel = this.classifyRiskLevel(riskScore);

    // If the composite score is very high (>= 81), trigger an automatic veto
    if (riskScore >= 81) {
      isVetoed = true;
    }

    // 3. Determine Trade Quality
    const tradeQuality = this.determineTradeQuality(
      inputs.opportunityScore || 50,
      riskScore,
      isVetoed,
      inputs.riskRewardRatio || '2.0:1'
    );

    // 4. Calculate Recommended Position Size
    // Risk percent per trade is determined by the risk level
    const riskPercentages = {
      'Very Low': 0.02,   // Risk 2.0% of capital
      'Low': 0.015,       // Risk 1.5%
      'Medium': 0.01,     // Risk 1.0%
      'High': 0.005,      // Risk 0.5%
      'Very High': 0.00   // Risk 0% (Avoid)
    };

    const riskPercent = isVetoed ? 0.0 : (riskPercentages[riskLevel] || 0.01);
    const positionSize = calculatePositionSize(
      capital,
      riskPercent,
      inputs.suggestedEntry || 0,
      inputs.suggestedStopLoss || 0
    );

    // 5. Compile AI explanation
    const explanation = explanations.join(' ');

    return {
      riskScore,
      riskLevel,
      isVetoed,
      tradeQuality,
      recommendedPositionSize: positionSize,
      explanation,
      modelResults
    };
  }

  /**
   * Classifies a numeric risk score into a human-readable label.
   */
  classifyRiskLevel(score) {
    if (score <= 20) return 'Very Low';
    if (score <= 40) return 'Low';
    if (score <= 60) return 'Medium';
    if (score <= 80) return 'High';
    return 'Very High';
  }

  /**
   * Classifies the overall trade setup quality.
   */
  determineTradeQuality(oppScore, riskScore, isVetoed, riskRewardRatio) {
    if (isVetoed) return 'Avoid';

    let rrVal = 2.0;
    if (typeof riskRewardRatio === 'string') {
      rrVal = parseFloat(riskRewardRatio.split(':')[0]) || 2.0;
    } else if (typeof riskRewardRatio === 'number') {
      rrVal = riskRewardRatio;
    }

    if (oppScore >= 80 && riskScore <= 35 && rrVal >= 2.5) {
      return 'Excellent';
    }
    if (oppScore >= 65 && riskScore <= 50 && rrVal >= 1.8) {
      return 'Good';
    }
    if (oppScore >= 50 && riskScore <= 65 && rrVal >= 1.5) {
      return 'Average';
    }
    if (oppScore < 50 || riskScore > 75) {
      return 'Poor';
    }
    return 'Avoid';
  }
}

export const RiskService = new RiskServiceOrchestrator();
export { RiskServiceOrchestrator };
