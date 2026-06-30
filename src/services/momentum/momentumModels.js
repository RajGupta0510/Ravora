import { BaseMomentumModel } from './momentumAnalyzer.js';
import { calculateRSI } from '../../utils/mathUtils.js';
import { calculateROC, calculateMACD } from './momentumUtils.js';

/**
 * Pluggable Model: Relative Strength Index (RSI)
 * Measures velocity and magnitude of directional price movements.
 */
export class RSIModel extends BaseMomentumModel {
  constructor(weight = 0.35) {
    super('RSI', weight);
  }

  evaluate(currentPrice, history) {
    if (!history || history.length < 15) {
      return { direction: 'Neutral', score: 50, explanation: 'Insufficient history for RSI.' };
    }

    const closePrices = history.map(h => h.close);
    const rsi = calculateRSI(closePrices, 14);

    let direction = 'Neutral';
    let score = Math.round(rsi);

    if (rsi > 55) {
      direction = 'Strengthening';
    } else if (rsi < 45) {
      direction = 'Weakening';
    } else {
      direction = 'Neutral';
    }

    let explanation = '';
    if (rsi > 70) {
      explanation = `RSI is at an overextended ${rsi.toFixed(1)}, indicating overbought conditions and potential near-term momentum consolidation.`;
    } else if (rsi < 30) {
      explanation = `RSI shows oversold exhaustion at ${rsi.toFixed(1)}, signaling potential rebound interest.`;
    } else {
      explanation = `RSI is at a stable, neutral ${rsi.toFixed(1)} level.`;
    }

    return { direction, score, explanation, raw: { rsi } };
  }
}

/**
 * Pluggable Model: MACD
 * Identifies changes in strength, direction, momentum, and duration of a trend.
 */
export class MACDModel extends BaseMomentumModel {
  constructor(weight = 0.35) {
    super('MACD', weight);
  }

  evaluate(currentPrice, history) {
    if (!history || history.length < 35) {
      return { direction: 'Neutral', score: 50, explanation: 'Insufficient history for MACD.' };
    }

    const closePrices = history.map(h => h.close);
    const macd = calculateMACD(closePrices);

    let direction = 'Neutral';
    let score = 50;

    if (macd.histogram > 0) {
      direction = 'Strengthening';
      score = macd.isRising ? 75 : 60;
    } else {
      direction = 'Weakening';
      score = !macd.isRising ? 25 : 40;
    }

    let explanation = '';
    if (macd.histogram > 0) {
      explanation = `MACD is above the signal line with a positive histogram of ${macd.histogram.toFixed(4)}, confirming ${macd.isRising ? 'accelerating' : 'decelerating'} bullish momentum.`;
    } else {
      explanation = `MACD is below the signal line with a negative histogram of ${macd.histogram.toFixed(4)}, indicating ${!macd.isRising ? 'accelerating' : 'decelerating'} selling pressure.`;
    }

    return { direction, score, explanation, raw: { macd } };
  }
}

/**
 * Pluggable Model: Rate of Change (ROC)
 * Measures the percentage change between current price and historical price.
 */
export class RateOfChangeModel extends BaseMomentumModel {
  constructor(weight = 0.3) {
    super('RateOfChange', weight);
  }

  evaluate(currentPrice, history) {
    if (!history || history.length < 15) {
      return { direction: 'Neutral', score: 50, explanation: 'Insufficient history for ROC.' };
    }

    const closePrices = history.map(h => h.close);
    const roc14 = calculateROC(closePrices, 14);

    let direction = 'Neutral';
    // Map ROC-14 (-15% to +15%) to a 0-100 score
    let score = Math.round(50 + (roc14 * 3.3));
    score = Math.max(5, Math.min(95, score));

    if (roc14 > 1.5) {
      direction = 'Strengthening';
    } else if (roc14 < -1.5) {
      direction = 'Weakening';
    } else {
      direction = 'Neutral';
    }

    let explanation = '';
    if (roc14 > 0) {
      explanation = `Price has advanced by ${roc14.toFixed(1)}% over the last 14 days, demonstrating positive velocity.`;
    } else {
      explanation = `Price has declined by ${Math.abs(roc14).toFixed(1)}% over 14 days, demonstrating downward velocity.`;
    }

    return { direction, score, explanation, raw: { roc14 } };
  }
}
