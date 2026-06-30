/**
 * Scoring Engine Weight Configuration
 * 
 * Defines the weight distribution for Araiven's decision scoring.
 * Weights can be adjusted here without modifying the core scoring logic.
 */
export const WEIGHT_CONFIG = {
  // Weights used to compute the Opportunity Score (must sum to 1.0)
  opportunity: {
    trend: 0.30,             // Trend alignment (EMA confluence)
    momentum: 0.30,          // Momentum velocity (RSI/MACD/ROC)
    marketStructure: 0.20,   // Market structure bias (HH/HL series)
    supportResistance: 0.20  // Proximity to support & resistance
  },

  // Weights used to compute the Confidence Score (must sum to 1.0)
  confidence: {
    trendStrength: 0.35,      // Reliability of the trend
    momentumStrength: 0.35,   // Velocity strength of momentum
    structureStrength: 0.15,  // Pivot structure validation strength
    levelStrength: 0.15       // S&R touch frequency validation strength
  }
};
