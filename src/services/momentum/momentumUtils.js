import { calculateRSI } from '../../utils/mathUtils.js';
import { calculateEMA } from '../trend/trendUtils.js';

/**
 * Calculates the Rate of Change (ROC) over a given period
 * ROC = ((Close_t - Close_{t-n}) / Close_{t-n}) * 100
 */
export function calculateROC(closePrices, period = 14) {
  if (!closePrices || closePrices.length <= period) return 0;
  const current = closePrices[closePrices.length - 1];
  const historical = closePrices[closePrices.length - 1 - period];
  if (historical === 0) return 0;
  return ((current - historical) / historical) * 100;
}

/**
 * Calculates the Moving Average Convergence Divergence (MACD)
 * MACD Line = 12 EMA - 26 EMA
 * Signal Line = 9 EMA of MACD Line
 * Histogram = MACD Line - Signal Line
 */
export function calculateMACD(closePrices) {
  if (!closePrices || closePrices.length < 35) {
    return { macdLine: 0, signalLine: 0, histogram: 0, isBullishCross: false, isRising: false };
  }

  const ema12History = [];
  const ema26History = [];
  
  const k12 = 2 / (12 + 1);
  const k26 = 2 / (26 + 1);

  // Initialize with SMA
  let ema12 = closePrices.slice(0, 12).reduce((a,b)=>a+b, 0) / 12;
  let ema26 = closePrices.slice(0, 26).reduce((a,b)=>a+b, 0) / 26;

  for (let i = 0; i < closePrices.length; i++) {
    if (i >= 12) {
      ema12 = closePrices[i] * k12 + ema12 * (1 - k12);
    }
    if (i >= 26) {
      ema26 = closePrices[i] * k26 + ema26 * (1 - k26);
    }
    ema12History.push(ema12);
    ema26History.push(ema26);
  }

  const macdLineHistory = [];
  for (let i = 26; i < closePrices.length; i++) {
    macdLineHistory.push(ema12History[i] - ema26History[i]);
  }

  if (macdLineHistory.length < 9) {
    return { macdLine: 0, signalLine: 0, histogram: 0, isBullishCross: false, isRising: false };
  }

  let signalLine = macdLineHistory.slice(0, 9).reduce((a,b)=>a+b, 0) / 9;
  const k9 = 2 / (9 + 1);
  const signalLineHistory = [signalLine];

  for (let i = 9; i < macdLineHistory.length; i++) {
    signalLine = macdLineHistory[i] * k9 + signalLine * (1 - k9);
    signalLineHistory.push(signalLine);
  }

  const currentMacd = macdLineHistory[macdLineHistory.length - 1];
  const currentSignal = signalLineHistory[signalLineHistory.length - 1];
  const currentHistogram = currentMacd - currentSignal;

  const prevMacd = macdLineHistory[macdLineHistory.length - 2];
  const prevSignal = signalLineHistory[signalLineHistory.length - 2];
  const prevHistogram = prevMacd - prevSignal;

  const isBullishCross = currentMacd > currentSignal && prevMacd <= prevSignal;
  const isRising = currentHistogram > prevHistogram;

  return {
    macdLine: currentMacd,
    signalLine: currentSignal,
    histogram: currentHistogram,
    isBullishCross,
    isRising
  };
}
