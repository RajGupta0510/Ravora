import { SwingLevelModel, PsychologicalLevelModel, VolumeProfileLevelModel } from './supportResistanceModels.js';
import { clusterLevels } from './supportResistanceUtils.js';

class SupportResistanceServiceOrchestrator {
  constructor() {
    this.models = [];
    // Register default level models
    this.registerModel(new SwingLevelModel(0.5));
    this.registerModel(new PsychologicalLevelModel(0.2));
    this.registerModel(new VolumeProfileLevelModel(0.3));
  }

  /**
   * Registers a new support & resistance analysis model.
   */
  registerModel(model) {
    if (typeof model.detectLevels !== 'function' || !model.name || model.weight === undefined) {
      throw new Error(`Invalid level model interface for: ${model?.name || 'unknown'}`);
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
   * Identifies composite support and resistance zones by aggregating all registered models.
   * 
   * @param {number} currentPrice - Live market price
   * @param {Array} history - Historical price data
   * @returns {Object} Clean structured level data
   */
  analyzeLevels(currentPrice, history) {
    if (!history || history.length < 5) {
      return {
        supportLevels: [currentPrice * 0.95, currentPrice * 0.90],
        resistanceLevels: [currentPrice * 1.05, currentPrice * 1.10],
        nearestSupport: currentPrice * 0.95,
        nearestResistance: currentPrice * 1.05,
        distanceToSupport: 5.0,
        distanceToResistance: 5.0,
        supportStrength: 50,
        resistanceStrength: 50,
        explanation: 'Insufficient historical data to calculate key price levels.',
        rawLevels: { supports: [], resistances: [] }
      };
    }

    const rawSupports = [];
    const rawResistances = [];
    const explanations = [];

    // 1. Collect levels from all registered models
    for (const model of this.models) {
      try {
        const result = model.detectLevels(currentPrice, history);
        const weight = model.normalizedWeight || (1 / this.models.length);

        if (result.supports) {
          result.supports.forEach(s => {
            rawSupports.push({ ...s, weight });
          });
        }
        if (result.resistances) {
          result.resistances.forEach(r => {
            rawResistances.push({ ...r, weight });
          });
        }
        if (result.explanation) {
          explanations.push(result.explanation);
        }
      } catch (err) {
        console.error(`[SupportResistanceService] Model ${model.name} failed:`, err.message);
      }
    }

    // 2. Perform a secondary density clustering pass on the aggregated levels
    const clusteredSupports = clusterLevels(rawSupports.map(s => s.price), 0.015);
    const clusteredResistances = clusterLevels(rawResistances.map(r => r.price), 0.015);

    // Filter and sort relative to current price
    const supports = clusteredSupports
      .filter(s => s.price < currentPrice)
      .sort((a, b) => b.price - a.price); // Closest below

    const resistances = clusteredResistances
      .filter(r => r.price > currentPrice)
      .sort((a, b) => a.price - b.price); // Closest above

    // Fallbacks if no levels detected
    const nearestSupport = supports[0]?.price || (currentPrice * 0.95);
    const nearestResistance = resistances[0]?.price || (currentPrice * 1.05);

    // Calculate percentage distances
    const distanceToSupport = Math.round(((currentPrice - nearestSupport) / currentPrice) * 1000) / 10;
    const distanceToResistance = Math.round(((nearestResistance - currentPrice) / currentPrice) * 1000) / 10;

    // Calculate level strengths (0-100)
    const supportStrength = supports[0] ? Math.min(98, Math.round(supports[0].touches * 25)) : 40;
    const resistanceStrength = resistances[0] ? Math.min(98, Math.round(resistances[0].touches * 25)) : 40;

    // 3. Compile AI explanation
    const explanation = explanations.join(' ');

    return {
      supportLevels: supports.map(s => s.price),
      resistanceLevels: resistances.map(r => r.price),
      nearestSupport,
      nearestResistance,
      distanceToSupport,
      distanceToResistance,
      supportStrength,
      resistanceStrength,
      explanation,
      rawLevels: {
        supports: supports,
        resistances: resistances
      }
    };
  }
}

export const SupportResistanceService = new SupportResistanceServiceOrchestrator();
export { SupportResistanceServiceOrchestrator };
