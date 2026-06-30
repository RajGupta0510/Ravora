import { BaseAnalyzer } from './baseAnalyzer.js';
import { MarketStructureService } from '../../marketStructure/structureService.js';

export class MarketStructureAnalyzer extends BaseAnalyzer {
  constructor() {
    super('MarketStructure');
  }

  analyze(ticker, assetDetails, allTickers = []) {
    const history = assetDetails.history || [];
    const currentPrice = ticker.price;

    const structureResult = MarketStructureService.analyzeMarketStructure(currentPrice, history);

    // Calculate S&R from the detected swing highs and lows
    const sortedTroughs = [...structureResult.troughs]
      .filter(t => t.price <= currentPrice)
      .sort((a, b) => b.price - a.price); // Closest below current price

    const sortedPeaks = [...structureResult.peaks]
      .filter(p => p.price >= currentPrice)
      .sort((a, b) => a.price - b.price); // Closest above current price

    const S1 = sortedTroughs[0]?.price || (currentPrice * 0.95);
    const S2 = sortedTroughs[1]?.price || (S1 * 0.95);
    const R1 = sortedPeaks[0]?.price || (currentPrice * 1.05);
    const R2 = sortedPeaks[1]?.price || (R1 * 1.05);

    const supportLevels = [S1, S2];
    const resistanceLevels = [R1, R2];

    return {
      supportLevels,
      resistanceLevels,
      structureBias: structureResult.structureBias,
      structureStrength: structureResult.structureStrength,
      reasoning: [structureResult.explanation],
      // Expose raw metrics
      _peaks: structureResult.peaks,
      _troughs: structureResult.troughs,
      _breakEvent: structureResult.breakEvent
    };
  }
}
