import { calculateSMA } from '../../utils/mathUtils.js';

/**
 * Calculates the Exponential Moving Average (EMA) of an array of numbers
 */
export function calculateEMA(values, period) {
  if (!values || values.length === 0 || period <= 0) return 0;
  if (values.length < period) return calculateSMA(values, values.length);
  
  const k = 2 / (period + 1);
  let ema = calculateSMA(values.slice(0, period), period);
  
  for (let i = period; i < values.length; i++) {
    ema = values[i] * k + ema * (1 - k);
  }
  return ema;
}

/**
 * Calculates the Average Directional Index (ADX) along with +DI and -DI
 * ADX measures trend strength from 0 to 100, regardless of direction.
 */
export function calculateADX(history, period = 14) {
  if (!history || history.length < period * 2) {
    return { adx: 15, diPlus: 20, diMinus: 20 }; // Default weak range state
  }

  const tr = [];
  const dmPlus = [];
  const dmMinus = [];

  for (let i = 1; i < history.length; i++) {
    const curr = history[i];
    const prev = history[i - 1];

    // 1. True Range (TR)
    const trVal = Math.max(
      curr.high - curr.low,
      Math.abs(curr.high - prev.close),
      Math.abs(curr.low - prev.close)
    );
    tr.push(trVal);

    // 2. Directional Movement (+DM and -DM)
    const upMove = curr.high - prev.high;
    const downMove = prev.low - curr.low;

    let dp = 0;
    let dm = 0;

    if (upMove > downMove && upMove > 0) {
      dp = upMove;
    }
    if (downMove > upMove && downMove > 0) {
      dm = downMove;
    }

    dmPlus.push(dp);
    dmMinus.push(dm);
  }

  // 3. Wilder's Smoothing
  let smoothedTR = tr.slice(0, period).reduce((a, b) => a + b, 0);
  let smoothedDMPlus = dmPlus.slice(0, period).reduce((a, b) => a + b, 0);
  let smoothedDMMinus = dmMinus.slice(0, period).reduce((a, b) => a + b, 0);

  const dxValues = [];

  // Initial DI
  let diPlus = smoothedTR > 0 ? 100 * (smoothedDMPlus / smoothedTR) : 0;
  let diMinus = smoothedTR > 0 ? 100 * (smoothedDMMinus / smoothedTR) : 0;
  let dx = Math.abs(diPlus - diMinus) / (diPlus + diMinus || 1) * 100;
  dxValues.push(dx);

  // Subsequent values
  for (let i = period; i < tr.length; i++) {
    smoothedTR = smoothedTR - (smoothedTR / period) + tr[i];
    smoothedDMPlus = smoothedDMPlus - (smoothedDMPlus / period) + dmPlus[i];
    smoothedDMMinus = smoothedDMMinus - (smoothedDMMinus / period) + dmMinus[i];

    diPlus = smoothedTR > 0 ? 100 * (smoothedDMPlus / smoothedTR) : 0;
    diMinus = smoothedTR > 0 ? 100 * (smoothedDMMinus / smoothedTR) : 0;
    
    dx = Math.abs(diPlus - diMinus) / (diPlus + diMinus || 1) * 100;
    dxValues.push(dx);
  }

  // Calculate ADX (smoothed DX)
  let adx = dxValues.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < dxValues.length; i++) {
    adx = (adx * (period - 1) + dxValues[i]) / period;
  }

  return {
    adx: Math.round(adx * 10) / 10,
    diPlus: Math.round(diPlus * 10) / 10,
    diMinus: Math.round(diMinus * 10) / 10
  };
}

/**
 * Analyzes market structure to identify Higher Highs/Higher Lows (HH/HL)
 * or Lower Highs/Lower Lows (LH/LL) based on swing pivots.
 */
export function analyzeMarketStructure(history) {
  const candles = history.slice(-30);
  if (candles.length < 10) return 'neutral';

  const highs = candles.map(c => c.high);
  const lows = candles.map(c => c.low);

  const peaks = [];
  const troughs = [];

  // Swing detection with window size 2
  for (let i = 2; i < candles.length - 2; i++) {
    if (highs[i] > highs[i - 1] && highs[i] > highs[i - 2] && highs[i] > highs[i + 1] && highs[i] > highs[i + 2]) {
      peaks.push({ price: highs[i], index: i });
    }
    if (lows[i] < lows[i - 1] && lows[i] < lows[i - 2] && lows[i] < lows[i + 1] && lows[i] < lows[i + 2]) {
      troughs.push({ price: lows[i], index: i });
    }
  }

  if (peaks.length < 2 || troughs.length < 2) return 'neutral';

  const lastTwoPeaks = peaks.slice(-2);
  const lastTwoTroughs = troughs.slice(-2);

  const higherHigh = lastTwoPeaks[1].price > lastTwoPeaks[0].price;
  const higherLow = lastTwoTroughs[1].price > lastTwoTroughs[0].price;
  
  const lowerHigh = lastTwoPeaks[1].price < lastTwoPeaks[0].price;
  const lowerLow = lastTwoTroughs[1].price < lastTwoTroughs[0].price;

  if (higherHigh && higherLow) return 'HH_HL'; // Bullish structure
  if (lowerHigh && lowerLow) return 'LH_LL'; // Bearish structure
  return 'choppy';
}

export const TrendEngine = {
  /**
   * Analyzes an asset's trend using MAs, ADX, and Market Structure.
   * 
   * @param {number} currentPrice - Live market price
   * @param {Array} history - Historical OHLCV [{open, high, low, close, volume, timestamp}]
   * @returns {Object} Trend analysis result
   */
  analyzeTrend(currentPrice, history) {
    if (!history || history.length < 30) {
      return {
        trendDirection: 'Sideways',
        trendStrength: 30,
        trendDeviation: 0.0,
        explanation: 'Insufficient price history to compute trend analysis. Minimum 30 days required.',
        adx: 15,
        diPlus: 20,
        diMinus: 20,
        structure: 'neutral'
      };
    }

    const closePrices = history.map(h => h.close);

    // 1. Calculate Moving Averages (EMA 20, 50, and 200)
    const ema20 = calculateEMA(closePrices, 20);
    const ema50 = calculateEMA(closePrices, 50);
    const ema200 = calculateEMA(closePrices, 200) || ema50; // Fallback if history < 200

    // 2. Calculate ADX (14) for Trend Strength
    const { adx, diPlus, diMinus } = calculateADX(history, 14);

    // 3. Analyze Market Structure (swing pivots)
    const structure = analyzeMarketStructure(history);

    // 4. Determine Direction
    let trendDirection = 'Sideways';
    const isBullishMA = currentPrice > ema50 && ema50 > ema200;
    const isBearishMA = currentPrice < ema50 && ema50 < ema200;

    if (isBullishMA && (structure === 'HH_HL' || diPlus > diMinus)) {
      trendDirection = 'Bullish';
    } else if (isBearishMA && (structure === 'LH_LL' || diMinus > diPlus)) {
      trendDirection = 'Bearish';
    } else if (adx < 20 || structure === 'choppy') {
      trendDirection = 'Sideways';
    } else if (diPlus > diMinus && currentPrice > ema50) {
      trendDirection = 'Bullish';
    } else if (diMinus > diPlus && currentPrice < ema50) {
      trendDirection = 'Bearish';
    }

    // 5. Calculate Trend Strength (0 to 100)
    // Strength is a function of ADX (conviction) and MA alignment
    let trendStrength = 30;
    if (trendDirection === 'Bullish' || trendDirection === 'Bearish') {
      // ADX ranges from 0-100. ADX > 25 is strong trend.
      // We scale ADX and reward structure alignment.
      trendStrength = Math.round(adx * 1.4);
      if (structure === 'HH_HL' && trendDirection === 'Bullish') trendStrength += 15;
      if (structure === 'LH_LL' && trendDirection === 'Bearish') trendStrength += 15;
      
      // Confluence: price above/below short-term EMA
      if (trendDirection === 'Bullish' && currentPrice > ema20) trendStrength += 10;
      if (trendDirection === 'Bearish' && currentPrice < ema20) trendStrength += 10;

      trendStrength = Math.max(35, Math.min(98, trendStrength));
    } else {
      // Sideways / range-bound
      trendStrength = Math.round(100 - (adx * 1.5));
      trendStrength = Math.max(10, Math.min(45, trendStrength));
    }

    // 6. Trend Deviation (distance from medium-term trendline)
    const trendDeviation = ema50 > 0 ? (currentPrice - ema50) / ema50 : 0.0;

    // 7. Generate structured quantitative explanation
    const explanation = generateExplanation(
      trendDirection,
      trendStrength,
      currentPrice,
      ema50,
      ema200,
      adx,
      diPlus,
      diMinus,
      structure
    );

    return {
      trendDirection,
      trendStrength,
      trendDeviation,
      explanation,
      adx,
      diPlus,
      diMinus,
      structure
    };
  }
};

/**
 * Generates a dynamic explanation of the trend based on quantitative evidence.
 */
function generateExplanation(direction, strength, price, ema50, ema200, adx, diPlus, diMinus, structure) {
  const parts = [];

  const devPct = (((price - ema50) / ema50) * 100).toFixed(1);

  if (direction === 'Bullish') {
    parts.push(`Price is in a clear uptrend, trading ${devPct}% above its 50-day EMA ($${ema50.toLocaleString(undefined, { maximumFractionDigits: 2 })}).`);
    
    if (structure === 'HH_HL') {
      parts.push("Market structure confirms this with a sequence of rising swing highs and higher lows.");
    } else {
      parts.push("Short-term price action remains supportive of the upward trajectory.");
    }

    if (adx > 25) {
      parts.push(`The Average Directional Index (ADX) is at a strong ${adx}, indicating high trend conviction.`);
    } else {
      parts.push(`ADX is at a low ${adx}, suggesting the bullish trend is in its early consolidation phase.`);
    }

    if (diPlus > diMinus) {
      parts.push(`Positive buyer momentum (+DI: ${diPlus}) dominates seller pressure (-DI: ${diMinus}).`);
    }
  } else if (direction === 'Bearish') {
    parts.push(`Price is under sustained downward pressure, trading ${Math.abs(devPct)}% below its 50-day EMA ($${ema50.toLocaleString(undefined, { maximumFractionDigits: 2 })}).`);
    
    if (structure === 'LH_LL') {
      parts.push("Market structure confirms this with a sequence of lower highs and lower lows.");
    }

    if (adx > 25) {
      parts.push(`ADX is at ${adx}, confirming strong seller momentum.`);
    }

    if (diMinus > diPlus) {
      parts.push(`Negative seller momentum (-DI: ${diMinus}) dominates buyer interest (+DI: ${diPlus}).`);
    }
  } else {
    parts.push(`Price is consolidating sideways within a range, hovering near its 50-day EMA ($${ema50.toLocaleString(undefined, { maximumFractionDigits: 2 })}).`);
    
    if (adx < 20) {
      parts.push(`A low ADX of ${adx} confirms a lack of directional trend conviction.`);
    }
    
    if (structure === 'choppy') {
      parts.push("Price action is choppy with overlapping swing pivots, indicating a balance between buyers and sellers.");
    }
  }

  return parts.join(' ');
}
