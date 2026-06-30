import { BaseTrendModel } from './trendAnalyzer.js';
import { calculateEMA, calculateADX, findPivots } from './trendUtils.js';

/**
 * Pluggable Model: Moving Average Confluence
 * Compares price and EMA alignments (EMA-20, EMA-50, EMA-200)
 */
export class MovingAverageConfluenceModel extends BaseTrendModel {
  constructor(weight = 0.4) {
    super('MovingAverageConfluence', weight);
  }

  evaluate(currentPrice, history) {
    if (!history || history.length < 50) {
      return { direction: 'Sideways', strength: 30, explanation: 'Insufficient history for EMA confluence.' };
    }

    const closePrices = history.map(h => h.close);
    const ema20 = calculateEMA(closePrices, 20);
    const ema50 = calculateEMA(closePrices, 50);
    const ema200 = calculateEMA(closePrices, 200) || ema50;

    let direction = 'Sideways';
    let strength = 30;
    let explanation = '';

    const isBullish = currentPrice > ema50 && ema50 > ema200;
    const isBearish = currentPrice < ema50 && ema50 < ema200;

    if (isBullish) {
      direction = 'Bullish';
      // Calculate how far above the long-term average we are
      const dev = (currentPrice - ema200) / ema200;
      strength = Math.round(50 + Math.min(45, dev * 200));
      explanation = `Price ($${currentPrice.toLocaleString()}) is trading above its short-term EMA-20 ($${Math.round(ema20).toLocaleString()}) and long-term EMA-200 ($${Math.round(ema200).toLocaleString()}), confirming a sustained bullish structure.`;
    } else if (isBearish) {
      direction = 'Bearish';
      const dev = (ema200 - currentPrice) / ema200;
      strength = Math.round(50 + Math.min(45, dev * 200));
      explanation = `Price ($${currentPrice.toLocaleString()}) is trading below its EMA-50 ($${Math.round(ema50).toLocaleString()}) and long-term EMA-200 ($${Math.round(ema200).toLocaleString()}), indicating persistent bearish pressure.`;
    } else {
      direction = 'Sideways';
      strength = 30;
      explanation = `Price is consolidating between the medium-term EMA-50 ($${Math.round(ema50).toLocaleString()}) and long-term EMA-200, showing lack of moving average expansion.`;
    }

    return { direction, strength, explanation };
  }
}

/**
 * Pluggable Model: Average Directional Index (ADX)
 * Measures trend strength and directional indicator crossovers (+DI / -DI)
 */
export class ADXDirectionalModel extends BaseTrendModel {
  constructor(weight = 0.3) {
    super('ADXDirectional', weight);
  }

  evaluate(currentPrice, history) {
    if (!history || history.length < 30) {
      return { direction: 'Sideways', strength: 30, explanation: 'Insufficient history for ADX.' };
    }

    const { adx, diPlus, diMinus } = calculateADX(history, 14);

    let direction = 'Sideways';
    if (diPlus > diMinus) {
      direction = 'Bullish';
    } else if (diMinus > diPlus) {
      direction = 'Bearish';
    }

    // ADX measures strength directly (0-100)
    // ADX > 25 indicates a strong trend; ADX < 20 indicates range-bound
    const strength = Math.round(adx);
    
    let explanation = '';
    if (adx > 25) {
      explanation = `ADX is at a strong ${adx}, indicating high trend conviction. Positive buyer momentum (+DI: ${diPlus}) ${diPlus > diMinus ? 'dominates' : 'lags'} seller pressure (-DI: ${diMinus}).`;
    } else {
      explanation = `ADX is at a low ${adx}, indicating a weak, range-bound market phase with DI lines tightly coiled.`;
    }

    return { direction, strength, explanation, raw: { adx, diPlus, diMinus } };
  }
}

/**
 * Pluggable Model: Market Structure Pivot Analysis
 * Inspects local peaks and troughs to identify Higher Highs/Higher Lows (HH/HL)
 * or Lower Highs/Lower Lows (LH/LL)
 */
export class MarketStructurePivotModel extends BaseTrendModel {
  constructor(weight = 0.3) {
    super('MarketStructurePivot', weight);
  }

  evaluate(currentPrice, history) {
    if (!history || history.length < 20) {
      return { direction: 'Sideways', strength: 30, explanation: 'Insufficient history for pivot analysis.' };
    }

    const { peaks, troughs } = findPivots(history, 2);

    if (peaks.length < 2 || troughs.length < 2) {
      return {
        direction: 'Sideways',
        strength: 40,
        explanation: 'Price action is consolidating within a narrow range with no established pivot structure.'
      };
    }

    const lastTwoPeaks = peaks.slice(-2);
    const lastTwoTroughs = troughs.slice(-2);

    const higherHigh = lastTwoPeaks[1].price > lastTwoPeaks[0].price;
    const higherLow = lastTwoTroughs[1].price > lastTwoTroughs[0].price;
    
    const lowerHigh = lastTwoPeaks[1].price < lastTwoPeaks[0].price;
    const lowerLow = lastTwoTroughs[1].price < lastTwoTroughs[0].price;

    let direction = 'Sideways';
    let strength = 50;
    let explanation = '';

    if (higherHigh && higherLow) {
      direction = 'Bullish';
      strength = 80;
      explanation = `Market structure shows a textbook bullish continuation with a sequence of rising swing highs and higher lows.`;
    } else if (lowerHigh && lowerLow) {
      direction = 'Bearish';
      strength = 80;
      explanation = `Market structure shows a bearish breakdown with a sequence of lower highs and lower lows.`;
    } else if (higherHigh && !higherLow) {
      direction = 'Sideways';
      strength = 45;
      explanation = `Price made a higher swing high but failed to establish a higher low, indicating expanding volatility rather than a clean trend.`;
    } else {
      direction = 'Sideways';
      strength = 35;
      explanation = `Price action is choppy with overlapping swing pivots, indicating a balance between buyers and sellers.`;
    }

    return { direction, strength, explanation };
  }
}
