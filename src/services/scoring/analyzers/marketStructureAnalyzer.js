import { BaseAnalyzer } from './baseAnalyzer.js';

export class MarketStructureAnalyzer extends BaseAnalyzer {
  constructor() {
    super('MarketStructure');
  }

  analyze(ticker, assetDetails, allTickers = []) {
    const history = assetDetails.history || [];
    const closePrices = history.map(h => h.close);
    const currentPrice = ticker.price;

    const localMinima = [];
    const localMaxima = [];
    
    for (let i = 1; i < closePrices.length - 1; i++) {
      const prev = closePrices[i - 1];
      const curr = closePrices[i];
      const next = closePrices[i + 1];
      
      if (curr < prev && curr < next) {
        localMinima.push(curr);
      }
      if (curr > prev && curr > next) {
        localMaxima.push(curr);
      }
    }
    
    const supports = localMinima
      .filter(p => p <= currentPrice)
      .sort((a, b) => b - a); // closest below current price
      
    const resistances = localMaxima
      .filter(p => p >= currentPrice)
      .sort((a, b) => a - b); // closest above current price
      
    const S1 = supports[0] || (currentPrice * 0.95);
    const S2 = supports[1] || (S1 * 0.95);
    const R1 = resistances[0] || (currentPrice * 1.05);
    const R2 = resistances[1] || (R1 * 1.05);
    
    const supportLevels = [S1, S2];
    const resistanceLevels = [R1, R2];

    const reasoning = [
      `Key market structure support detected at $${S1.toLocaleString()} and resistance at $${R1.toLocaleString()}.`
    ];

    return {
      supportLevels,
      resistanceLevels,
      reasoning
    };
  }
}
