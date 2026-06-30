import { SwingPivotModel, BreakOfStructureModel } from './structureModels.js';

class MarketStructureServiceOrchestrator {
  constructor() {
    this.models = [];
    // Register default market structure models
    this.registerModel(new SwingPivotModel(0.5));
    this.registerModel(new BreakOfStructureModel(0.5));
  }

  /**
   * Registers a new market structure analysis model.
   * 
   * @param {BaseStructureModel} model - Instance of a class extending BaseStructureModel
   */
  registerModel(model) {
    if (typeof model.evaluate !== 'function' || !model.name || model.weight === undefined) {
      throw new Error(`Invalid market structure model interface for: ${model?.name || 'unknown'}`);
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
   * Analyzes the market structure of an asset by aggregating all registered models.
   * 
   * @param {number} currentPrice - Live market price
   * @param {Array} history - Historical price data
   * @returns {Object} Composite market structure analysis result
   */
  analyzeMarketStructure(currentPrice, history) {
    if (!history || history.length < 15) {
      return {
        structureBias: 'Neutral',
        structureStrength: 50,
        explanation: 'Insufficient historical data to analyze market structure.',
        peaks: [],
        troughs: [],
        breakEvent: null
      };
    }

    const modelResults = [];
    let weightedBiasScore = 0; // Bullish = +1, Bearish = -1, Neutral = 0
    let weightedScore = 0;
    const explanations = [];

    let peaks = [];
    let troughs = [];
    let breakEvent = null;

    // 1. Run evaluation on all registered models
    for (const model of this.models) {
      try {
        const result = model.evaluate(currentPrice, history);
        const weight = model.normalizedWeight || (1 / this.models.length);

        modelResults.push({
          name: model.name,
          weight,
          result
        });

        // Bias scoring
        let biasScore = 0;
        if (result.bias === 'Bullish') biasScore = 1;
        if (result.bias === 'Bearish') biasScore = -1;
        weightedBiasScore += biasScore * weight;

        // Score scoring
        weightedScore += result.score * weight;

        // Explanations
        if (result.explanation) {
          explanations.push(result.explanation);
        }

        // Capture raw metrics for downstream consumers
        if (model.name === 'SwingPivotSequence' && result.raw) {
          peaks = result.raw.peaks;
          troughs = result.raw.troughs;
        }
        if (model.name === 'StructuralBreaks' && result.raw) {
          breakEvent = result.raw;
        }
      } catch (err) {
        console.error(`[MarketStructureService] Model ${model.name} failed:`, err.message);
      }
    }

    // 2. Resolve composite bias
    let structureBias = 'Neutral';
    if (weightedBiasScore > 0.25) {
      structureBias = 'Bullish';
    } else if (weightedBiasScore < -0.25) {
      structureBias = 'Bearish';
    }

    // 3. Normalize strength
    // A score closer to 50 is weak/neutral, whereas closer to 0 or 100 is strong trend structure.
    // We convert the 0-100 score into a 0-100 strength value: strength = Math.abs(score - 50) * 2
    let structureStrength = Math.round(Math.abs(weightedScore - 50) * 2);
    structureStrength = Math.max(10, Math.min(98, structureStrength));

    // 4. Compile AI explanation
    const explanation = explanations.join(' ');

    return {
      structureBias,
      structureStrength,
      explanation,
      peaks,
      troughs,
      breakEvent,
      modelResults // Raw individual model outputs for auditing
    };
  }
}

export const MarketStructureService = new MarketStructureServiceOrchestrator();
export { MarketStructureServiceOrchestrator };
