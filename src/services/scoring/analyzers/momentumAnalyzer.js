import { BaseAnalyzer } from './baseAnalyzer.js';
import { calculatePercentageChange, calculateRSI } from '../../../utils/mathUtils.js';

export class MomentumAnalyzer extends BaseAnalyzer {
  constructor() {
    super('Momentum');
  }

  analyze(ticker, assetDetails, allTickers = []) {
    const history = assetDetails.history || [];
    const closePrices = history.map(h => h.close);

    // Calculate RSI-14
    const rsi = calculateRSI(closePrices, 14);

    // Calculate relative momentum over 14 days vs other assets
    const change14 = calculatePercentageChange(closePrices, 14);
    let avgChange14 = 0.0;
    if (allTickers && allTickers.length > 0) {
      const changes = allTickers.map(t => t.change24h / 100);
      avgChange14 = changes.reduce((a, b) => a + b, 0) / changes.length;
    }
    
    const momDifference = change14 - (avgChange14 * 14); 
    let relativeMomentum = 50 + Math.round(momDifference * 150);
    relativeMomentum = Math.max(15, Math.min(95, relativeMomentum));

    const reasoning = [];
    
    // Add RSI explanation
    if (rsi > 70) {
      reasoning.push(`Momentum is overextended with RSI at ${rsi.toFixed(1)}, indicating overbought conditions and potential near-term consolidation.`);
    } else if (rsi < 30) {
      reasoning.push(`Momentum shows oversold exhaustion with RSI at ${rsi.toFixed(1)}, signaling potential rebound interest.`);
    } else {
      reasoning.push(`Momentum is stable with RSI at a neutral ${rsi.toFixed(1)} level.`);
    }

    // Add Relative Momentum explanation
    if (momDifference > 0.05) {
      reasoning.push(`Relative momentum is strong, outperforming the market baseline by ${(momDifference * 100).toFixed(1)}% over the last 14 days.`);
    } else if (momDifference < -0.05) {
      reasoning.push(`Relative momentum is lagging, underperforming the market baseline by ${Math.abs(momDifference * 100).toFixed(1)}% over 14 days.`);
    } else {
      reasoning.push(`Relative momentum remains neutral, tracking the market capitalization averages closely.`);
    }

    return {
      rsi,
      momDifference,
      relativeMomentum,
      reasoning
    };
  }
}
