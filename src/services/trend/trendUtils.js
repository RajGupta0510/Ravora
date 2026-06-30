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
 */
export function calculateADX(history, period = 14) {
  if (!history || history.length < period * 2) {
    return { adx: 15, diPlus: 20, diMinus: 20 };
  }

  const tr = [];
  const dmPlus = [];
  const dmMinus = [];

  for (let i = 1; i < history.length; i++) {
    const curr = history[i];
    const prev = history[i - 1];

    const trVal = Math.max(
      curr.high - curr.low,
      Math.abs(curr.high - prev.close),
      Math.abs(curr.low - prev.close)
    );
    tr.push(trVal);

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

  let smoothedTR = tr.slice(0, period).reduce((a, b) => a + b, 0);
  let smoothedDMPlus = dmPlus.slice(0, period).reduce((a, b) => a + b, 0);
  let smoothedDMMinus = dmMinus.slice(0, period).reduce((a, b) => a + b, 0);

  const dxValues = [];

  let diPlus = smoothedTR > 0 ? 100 * (smoothedDMPlus / smoothedTR) : 0;
  let diMinus = smoothedTR > 0 ? 100 * (smoothedDMMinus / smoothedTR) : 0;
  let dx = Math.abs(diPlus - diMinus) / (diPlus + diMinus || 1) * 100;
  dxValues.push(dx);

  for (let i = period; i < tr.length; i++) {
    smoothedTR = smoothedTR - (smoothedTR / period) + tr[i];
    smoothedDMPlus = smoothedDMPlus - (smoothedDMPlus / period) + dmPlus[i];
    smoothedDMMinus = smoothedDMMinus - (smoothedDMMinus / period) + dmMinus[i];

    diPlus = smoothedTR > 0 ? 100 * (smoothedDMPlus / smoothedTR) : 0;
    diMinus = smoothedTR > 0 ? 100 * (smoothedDMMinus / smoothedTR) : 0;
    
    dx = Math.abs(diPlus - diMinus) / (diPlus + diMinus || 1) * 100;
    dxValues.push(dx);
  }

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
 * Finds local peak (swing high) and trough (swing low) pivots in price history
 */
export function findPivots(history, windowSize = 2) {
  const candles = history.slice(-30);
  if (candles.length < windowSize * 2 + 1) return { peaks: [], troughs: [] };

  const highs = candles.map(c => c.high);
  const lows = candles.map(c => c.low);
  const peaks = [];
  const troughs = [];

  for (let i = windowSize; i < candles.length - windowSize; i++) {
    let isPeak = true;
    let isTrough = true;

    for (let w = 1; w <= windowSize; w++) {
      if (highs[i] <= highs[i - w] || highs[i] <= highs[i + w]) isPeak = false;
      if (lows[i] >= lows[i - w] || lows[i] >= lows[i + w]) isTrough = false;
    }

    if (isPeak) peaks.push({ price: highs[i], index: i });
    if (isTrough) troughs.push({ price: lows[i], index: i });
  }

  return { peaks, troughs };
}
