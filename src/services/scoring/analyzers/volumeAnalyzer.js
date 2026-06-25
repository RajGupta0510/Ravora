import { BaseAnalyzer } from './baseAnalyzer.js';
import { calculateSMA } from '../../../utils/mathUtils.js';

export class VolumeAnalyzer extends BaseAnalyzer {
  constructor() {
    super('Volume');
  }

  analyze(ticker, assetDetails, allTickers = []) {
    const history = assetDetails.history || [];
    const historicalVolumes = history.map(h => h.volume).filter(v => v > 0);
    const avgVolume30 = calculateSMA(historicalVolumes, 30) || ticker.volume24h;
    const volumeRatio = avgVolume30 > 0 ? (ticker.volume24h / avgVolume30) : 1.0;

    let volumeConfirmation = 50 + Math.round((volumeRatio - 1.0) * 35);
    volumeConfirmation = Math.max(15, Math.min(95, volumeConfirmation));

    const reasoning = [];
    if (volumeRatio > 1.25) {
      reasoning.push(`24h trading volume is ${(volumeRatio * 100 - 100).toFixed(1)}% above its 30-day historical average, confirming active capital inflows and breakout participation.`);
    } else if (volumeRatio < 0.75) {
      reasoning.push(`24h trading volume is ${Math.abs(volumeRatio * 100 - 100).toFixed(1)}% below its 30-day average, signaling low volume consolidation and range-bound trade.`);
    } else {
      reasoning.push(`24h volume aligns with historical averages (ratio: ${volumeRatio.toFixed(2)}x), confirming stable market participation.`);
    }

    return {
      volumeRatio,
      volumeConfirmation,
      reasoning
    };
  }
}
