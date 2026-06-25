import { BaseAnalyzer } from './baseAnalyzer.js';
import { calculateSMA } from '../../../utils/mathUtils.js';

export class TrendAnalyzer extends BaseAnalyzer {
  constructor() {
    super('Trend');
  }

  analyze(ticker, assetDetails, allTickers = []) {
    const history = assetDetails.history || [];
    const closePrices = history.map(h => h.close);
    const currentPrice = ticker.price;

    const sma30 = calculateSMA(closePrices, 30) || currentPrice;
    const sma7 = calculateSMA(closePrices, 7) || currentPrice;
    const trendDeviation = sma30 > 0 ? (currentPrice - sma30) / sma30 : 0.0;
    const shortTermDeviation = sma30 > 0 ? (sma7 - sma30) / sma30 : 0.0;
    
    let trendStrength = 50 + Math.round(trendDeviation * 200) + Math.round(shortTermDeviation * 100);
    trendStrength = Math.max(10, Math.min(95, trendStrength));

    let trendDirection = 'Range';
    if (currentPrice > sma30 && sma7 > sma30) {
      trendDirection = 'Bullish';
    } else if (currentPrice < sma30 && sma7 < sma30) {
      trendDirection = 'Bearish';
    }

    const reasoning = [];
    if (currentPrice >= sma30) {
      reasoning.push(`Trend is bullish with the price sitting ${(trendDeviation * 100).toFixed(1)}% above its 30-day moving average.`);
    } else {
      reasoning.push(`Trend shows bearish pressure with the price trading ${Math.abs(trendDeviation * 100).toFixed(1)}% below its 30-day moving average.`);
    }

    return {
      trendStrength,
      trendDirection,
      trendDeviation,
      reasoning
    };
  }
}
