import { MovingAverageConfluenceModel, ADXDirectionalModel, MarketStructurePivotModel } from './trendModels.js';

class TrendServiceOrchestrator {
  constructor() {
    this.models = [];
    // Register default analysis models
    this.registerModel(new MovingAverageConfluenceModel(0.4));
    this.registerModel(new ADXDirectionalModel(0.3));
    this.registerModel(new MarketStructurePivotModel(0.3));
  }

  /**
   * Registers a new trend analysis model into the engine.
   * 
   * @param {BaseTrendModel} model - Instance of a class extending BaseTrendModel
   */
  registerModel(model) {
    // Validate model interface
    if (typeof model.evaluate !== 'function' || !model.name || model.weight === undefined) {
      throw new Error(`Invalid trend model interface for: ${model?.name || 'unknown'}`);
    }
    // Remove existing model with the same name if present
    this.models = this.models.filter(m => m.name !== model.name);
    this.models.push(model);
    // Re-normalize weights so they sum up to 1.0
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
   * Analyzes the market trend of an asset by aggregating all registered models.
   * 
   * @param {number} currentPrice - Live market price
   * @param {Array} history - Historical price data
   * @returns {Object} Composite trend analysis result
   */
  analyzeTrend(currentPrice, history) {
    if (!history || history.length < 15) {
      return {
        trendDirection: 'Sideways',
        trendStrength: 30,
        trendDeviation: 0.0,
        explanation: 'Insufficient historical data to analyze market trend.',
        adx: 15,
        diPlus: 20,
        diMinus: 20,
        structure: 'neutral'
      };
    }

    const modelResults = [];
    let weightedDirectionScore = 0; // Bullish = +1, Bearish = -1, Sideways = 0
    let weightedStrength = 0;
    const explanations = [];

    let adx = 15;
    let diPlus = 20;
    let diMinus = 20;
    let structure = 'neutral';

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
        if (result.direction === 'Bullish') dirScore = 1;
        if (result.direction === 'Bearish') dirScore = -1;
        weightedDirectionScore += dirScore * weight;

        // Strength scoring
        weightedStrength += result.strength * weight;

        // Explanations
        if (result.explanation) {
          explanations.push(result.explanation);
        }

        // Capture raw metrics for downstream consumers
        if (model.name === 'ADXDirectional' && result.raw) {
          adx = result.raw.adx;
          diPlus = result.raw.diPlus;
          diMinus = result.raw.diMinus;
        }
        if (model.name === 'MarketStructurePivot') {
          if (result.direction === 'Bullish') structure = 'HH_HL';
          else if (result.direction === 'Bearish') structure = 'LH_LL';
          else structure = 'choppy';
        }
      } catch (err) {
        console.error(`[TrendService] Model ${model.name} failed:`, err.message);
      }
    }

    // 2. Resolve composite direction
    let trendDirection = 'Sideways';
    if (weightedDirectionScore > 0.25) {
      trendDirection = 'Bullish';
    } else if (weightedDirectionScore < -0.25) {
      trendDirection = 'Bearish';
    }

    // 3. Normalize strength
    let trendStrength = Math.round(weightedStrength);
    trendStrength = Math.max(10, Math.min(98, trendStrength));

    // Calculate deviation from medium-term trend (EMA-50)
    const closePrices = history.map(h => h.close);
    const ema50 = closePrices.length >= 50 ? closePrices.slice(-50).reduce((a,b)=>a+b, 0)/50 : currentPrice;
    const trendDeviation = ema50 > 0 ? (currentPrice - ema50) / ema50 : 0.0;

    // 4. Compile AI explanation
    const explanation = explanations.join(' ');

    return {
      trendDirection,
      trendStrength,
      trendDeviation,
      explanation,
      adx,
      diPlus,
      diMinus,
      structure,
      modelResults // Raw individual model outputs for auditing
    };
  }
}

export const TrendService = new TrendServiceOrchestrator();
export { TrendServiceOrchestrator };
