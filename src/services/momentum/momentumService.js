import { RSIModel, MACDModel, RateOfChangeModel } from './momentumModels.js';

class MomentumServiceOrchestrator {
  constructor() {
    this.models = [];
    // Register default momentum analysis models
    this.registerModel(new RSIModel(0.35));
    this.registerModel(new MACDModel(0.35));
    this.registerModel(new RateOfChangeModel(0.30));
  }

  /**
   * Registers a new momentum analysis model.
   * 
   * @param {BaseMomentumModel} model - Instance of a class extending BaseMomentumModel
   */
  registerModel(model) {
    if (typeof model.evaluate !== 'function' || !model.name || model.weight === undefined) {
      throw new Error(`Invalid momentum model interface for: ${model?.name || 'unknown'}`);
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
   * Analyzes the momentum of an asset by aggregating all registered models.
   * 
   * @param {number} currentPrice - Live market price
   * @param {Array} history - Historical price data
   * @returns {Object} Composite momentum analysis result
   */
  analyzeMomentum(currentPrice, history) {
    if (!history || history.length < 15) {
      return {
        momentumScore: 50,
        momentumDirection: 'Neutral',
        explanation: 'Insufficient historical data to analyze momentum.',
        rsi: 50,
        roc14: 0.0,
        macd: { macdLine: 0, signalLine: 0, histogram: 0 }
      };
    }

    const modelResults = [];
    let weightedDirectionScore = 0; // Strengthening = +1, Weakening = -1, Neutral = 0
    let weightedScore = 0;
    const explanations = [];

    let rsi = 50;
    let roc14 = 0.0;
    let macd = { macdLine: 0, signalLine: 0, histogram: 0 };

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

        // Direction scoring
        let dirScore = 0;
        if (result.direction === 'Strengthening') dirScore = 1;
        if (result.direction === 'Weakening') dirScore = -1;
        weightedDirectionScore += dirScore * weight;

        // Score scoring
        weightedScore += result.score * weight;

        // Explanations
        if (result.explanation) {
          explanations.push(result.explanation);
        }

        // Capture raw metrics for downstream consumers
        if (model.name === 'RSI' && result.raw) {
          rsi = result.raw.rsi;
        }
        if (model.name === 'RateOfChange' && result.raw) {
          roc14 = result.raw.roc14;
        }
        if (model.name === 'MACD' && result.raw) {
          macd = result.raw.macd;
        }
      } catch (err) {
        console.error(`[MomentumService] Model ${model.name} failed:`, err.message);
      }
    }

    // 2. Resolve composite direction
    let momentumDirection = 'Neutral';
    if (weightedDirectionScore > 0.25) {
      momentumDirection = 'Strengthening';
    } else if (weightedDirectionScore < -0.25) {
      momentumDirection = 'Weakening';
    }

    // 3. Normalize score
    let momentumScore = Math.round(weightedScore);
    momentumScore = Math.max(5, Math.min(95, momentumScore));

    // 4. Compile AI explanation
    const explanation = explanations.join(' ');

    return {
      momentumScore,
      momentumDirection,
      explanation,
      rsi,
      roc14,
      macd,
      modelResults // Raw individual model outputs for auditing
    };
  }
}

export const MomentumService = new MomentumServiceOrchestrator();
export { MomentumServiceOrchestrator };
