/**
 * Technical Indicators Calculator Module
 * Calculates standard quantitative technical indicators on historical candles.
 * Input candles are sorted chronologically (oldest to newest).
 */

export const TechnicalIndicators = {
  /**
   * Simple Moving Average (SMA)
   */
  calculateSMA(prices, period) {
    if (prices.length < period) return Array(prices.length).fill(null);
    const sma = [];
    for (let i = 0; i < prices.length; i++) {
      if (i < period - 1) {
        sma.push(null);
      } else {
        const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
        sma.push(sum / period);
      }
    }
    return sma;
  },

  /**
   * Exponential Moving Average (EMA)
   */
  calculateEMA(prices, period) {
    if (prices.length < period) return Array(prices.length).fill(null);
    const ema = [];
    const k = 2 / (period + 1);
    
    // SMA for initial seed
    const initialSma = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
    
    for (let i = 0; i < prices.length; i++) {
      if (i < period - 1) {
        ema.push(null);
      } else if (i === period - 1) {
        ema.push(initialSma);
      } else {
        const curEma = prices[i] * k + ema[i - 1] * (1 - k);
        ema.push(curEma);
      }
    }
    return ema;
  },

  /**
   * Relative Strength Index (RSI)
   */
  calculateRSI(prices, period = 14) {
    if (prices.length <= period) return Array(prices.length).fill(50);
    const rsi = Array(prices.length).fill(null);

    let gains = 0;
    let losses = 0;

    // First change averages
    for (let i = 1; i <= period; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) gains += change;
      else losses -= change;
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;
    
    rsi[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);

    for (let i = period + 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      const gain = change > 0 ? change : 0;
      const loss = change < 0 ? -change : 0;

      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;

      rsi[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
    }

    // Fill initial indices with first valid rsi value
    for (let i = 0; i < period; i++) {
      rsi[i] = rsi[period];
    }

    return rsi;
  },

  /**
   * Moving Average Convergence Divergence (MACD)
   */
  calculateMACD(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    const fastEma = this.calculateEMA(prices, fastPeriod);
    const slowEma = this.calculateEMA(prices, slowPeriod);

    const macdLine = [];
    for (let i = 0; i < prices.length; i++) {
      if (fastEma[i] === null || slowEma[i] === null) {
        macdLine.push(null);
      } else {
        macdLine.push(fastEma[i] - slowEma[i]);
      }
    }

    // Filter nulls to compute signal EMA
    const firstValidIdx = macdLine.findIndex(v => v !== null);
    const validMacd = macdLine.slice(firstValidIdx);
    const signalEma = this.calculateEMA(validMacd, signalPeriod);
    
    const signalLine = Array(firstValidIdx).fill(null).concat(signalEma);
    const histogram = [];

    for (let i = 0; i < prices.length; i++) {
      if (macdLine[i] === null || signalLine[i] === null) {
        histogram.push(null);
      } else {
        histogram.push(macdLine[i] - signalLine[i]);
      }
    }

    return { macdLine, signalLine, histogram };
  },

  /**
   * Average True Range (ATR)
   */
  calculateATR(candles, period = 14) {
    if (candles.length <= period) return Array(candles.length).fill(0);
    const tr = [candles[0].high - candles[0].low];
    
    for (let i = 1; i < candles.length; i++) {
      const h = candles[i].high;
      const l = candles[i].low;
      const prevClose = candles[i - 1].close;
      tr.push(Math.max(h - l, Math.abs(h - prevClose), Math.abs(l - prevClose)));
    }

    const atr = Array(candles.length).fill(null);
    let initialTrSum = tr.slice(0, period).reduce((a, b) => a + b, 0);
    atr[period - 1] = initialTrSum / period;

    for (let i = period; i < candles.length; i++) {
      atr[i] = (atr[i - 1] * (period - 1) + tr[i]) / period;
    }

    for (let i = 0; i < period - 1; i++) {
      atr[i] = atr[period - 1];
    }

    return atr;
  },

  /**
   * Volume Weighted Average Price (VWAP)
   */
  calculateVWAP(candles) {
    const vwap = [];
    let cumVolume = 0;
    let cumPV = 0;

    for (let i = 0; i < candles.length; i++) {
      const c = candles[i];
      const typicalPrice = (c.high + c.low + c.close) / 3;
      cumVolume += c.volume || 1;
      cumPV += typicalPrice * (c.volume || 1);
      vwap.push(cumPV / cumVolume);
    }
    return vwap;
  },

  /**
   * Bollinger Bands (BB)
   */
  calculateBollingerBands(prices, period = 20, multiplier = 2) {
    const middle = this.calculateSMA(prices, period);
    const upper = [];
    const lower = [];

    for (let i = 0; i < prices.length; i++) {
      if (middle[i] === null) {
        upper.push(null);
        lower.push(null);
      } else {
        const slice = prices.slice(i - period + 1, i + 1);
        const avg = middle[i];
        const variance = slice.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / period;
        const stdDev = Math.sqrt(variance);

        upper.push(avg + multiplier * stdDev);
        lower.push(avg - multiplier * stdDev);
      }
    }

    return { upper, middle, lower };
  },

  /**
   * Average Directional Index (ADX)
   */
  calculateADX(candles, period = 14) {
    if (candles.length <= period * 2) return Array(candles.length).fill(25);
    const adx = Array(candles.length).fill(null);

    const plusDM = [];
    const minusDM = [];
    const tr = [];

    tr.push(candles[0].high - candles[0].low);
    plusDM.push(0);
    minusDM.push(0);

    for (let i = 1; i < candles.length; i++) {
      const up = candles[i].high - candles[i - 1].high;
      const down = candles[i - 1].low - candles[i].low;

      plusDM.push(up > down && up > 0 ? up : 0);
      minusDM.push(down > up && down > 0 ? down : 0);

      const h = candles[i].high;
      const l = candles[i].low;
      const prevC = candles[i - 1].close;
      tr.push(Math.max(h - l, Math.abs(h - prevC), Math.abs(l - prevC)));
    }

    const smoothedTR = Array(candles.length).fill(0);
    const smoothedPlusDM = Array(candles.length).fill(0);
    const smoothedMinusDM = Array(candles.length).fill(0);

    smoothedTR[period] = tr.slice(0, period).reduce((a, b) => a + b, 0);
    smoothedPlusDM[period] = plusDM.slice(0, period).reduce((a, b) => a + b, 0);
    smoothedMinusDM[period] = minusDM.slice(0, period).reduce((a, b) => a + b, 0);

    for (let i = period + 1; i < candles.length; i++) {
      smoothedTR[i] = smoothedTR[i - 1] - (smoothedTR[i - 1] / period) + tr[i];
      smoothedPlusDM[i] = smoothedPlusDM[i - 1] - (smoothedPlusDM[i - 1] / period) + plusDM[i];
      smoothedMinusDM[i] = smoothedMinusDM[i - 1] - (smoothedMinusDM[i - 1] / period) + minusDM[i];
    }

    const dx = [];
    for (let i = 0; i < candles.length; i++) {
      if (i < period) {
        dx.push(null);
      } else {
        const plusDI = (smoothedPlusDM[i] / smoothedTR[i]) * 100;
        const minusDI = (smoothedMinusDM[i] / smoothedTR[i]) * 100;
        const sum = plusDI + minusDI;
        const diff = Math.abs(plusDI - minusDI);
        dx.push(sum === 0 ? 0 : (diff / sum) * 100);
      }
    }

    const validDx = dx.filter(v => v !== null);
    const adxValues = this.calculateEMA(validDx, period);
    
    const finalAdx = Array(dx.length - validDx.length).fill(null).concat(adxValues);
    
    // Fallback/fill initial indices
    for (let i = 0; i < finalAdx.length; i++) {
      if (finalAdx[i] === null) finalAdx[i] = 20.0;
    }

    return finalAdx;
  },

  /**
   * Stochastic Oscillator (%K and %D)
   */
  calculateStochastic(candles, period = 14, kPeriod = 3, dPeriod = 3) {
    const kLine = [];
    const dLine = [];

    for (let i = 0; i < candles.length; i++) {
      if (i < period - 1) {
        kLine.push(50);
      } else {
        const slice = candles.slice(i - period + 1, i + 1);
        const lows = slice.map(c => c.low);
        const highs = slice.map(c => c.high);
        const lowestLow = Math.min(...lows);
        const highestHigh = Math.max(...highs);

        const currentClose = candles[i].close;
        const k = highestHigh === lowestLow ? 50 : ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
        kLine.push(k);
      }
    }

    // D line is simple SMA of %K
    const smoothedK = this.calculateSMA(kLine, dPeriod);
    for (let i = 0; i < candles.length; i++) {
      dLine.push(smoothedK[i] === null ? 50 : smoothedK[i]);
    }

    return { kLine, dLine };
  },

  /**
   * Support & Resistance valley/peaks calculator
   */
  calculateSupportResistance(candles, period = 14) {
    const closes = candles.map(c => c.close);
    const sma = this.calculateSMA(closes, period);
    
    // Support is lowest low in last period, Resistance is highest high in last period
    const support = [];
    const resistance = [];

    for (let i = 0; i < candles.length; i++) {
      const start = Math.max(0, i - period + 1);
      const slice = candles.slice(start, i + 1);
      
      const lows = slice.map(c => c.low);
      const highs = slice.map(c => c.high);

      support.push(Math.min(...lows));
      resistance.push(Math.max(...highs));
    }

    return { support, resistance };
  }
};
