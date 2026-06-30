import { BaseAnalyzer } from './baseAnalyzer.js';
import { TrendEngine } from '../../trend/trendEngine.js';

export class TrendAnalyzer extends BaseAnalyzer {
  constructor() {
    super('Trend');
  }

  analyze(ticker, assetDetails, allTickers = []) {
    const history = assetDetails.history || [];
    const trendResult = TrendEngine.analyzeTrend(ticker.price, history);

    return {
      trendStrength: trendResult.trendStrength,
      trendDirection: trendResult.trendDirection,
      trendDeviation: trendResult.trendDeviation,
      reasoning: [trendResult.explanation],
      // Expose raw metrics for downstream analyzers
      _adx: trendResult.adx,
      _diPlus: trendResult.diPlus,
      _diMinus: trendResult.diMinus,
      _structure: trendResult.structure
    };
  }
}
