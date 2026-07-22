/**
 * Technical Chart Pattern Recognition Engine
 * Detects price structures, liquidity levels, and classic chart patterns.
 * Input candles are sorted chronologically (oldest to newest).
 */

export const PatternDetector = {
  /**
   * Scans and returns all patterns detected in a dataset
   */
  detectAll(candles) {
    if (candles.length < 10) return [];
    
    const results = [];
    
    // Scan chronological index for single-point or sequence-point triggers
    const fvgs = this.detectFairValueGaps(candles);
    const obs = this.detectOrderBlocks(candles);
    const sweeps = this.detectLiquiditySweeps(candles);
    const doubleTopsBottoms = this.detectDoubleTopsBottoms(candles);
    const headAndShoulders = this.detectHeadAndShoulders(candles);
    const breakouts = this.detectBreakouts(candles);

    return [
      ...fvgs,
      ...obs,
      ...sweeps,
      ...doubleTopsBottoms,
      ...headAndShoulders,
      ...breakouts
    ];
  },

  /**
   * Detects Fair Value Gaps (FVG)
   * A 3-candle imbalance where candle 1 low > candle 3 high (Bullish FVG)
   * or candle 1 high < candle 3 low (Bearish FVG).
   */
  detectFairValueGaps(candles) {
    const patterns = [];
    for (let i = 2; i < candles.length; i++) {
      const c1 = candles[i - 2];
      const c2 = candles[i - 1];
      const c3 = candles[i];

      // Bullish FVG (buying imbalance)
      if (c1.low > c3.high) {
        patterns.push({
          patternName: 'bullish_fvg',
          symbol: c3.symbol || 'ASSET',
          detectedAt: c3.timestamp || new Date().toISOString(),
          index: i,
          price: c2.close,
          meta: {
            gapStart: c3.high,
            gapEnd: c1.low,
            imbalanceSizePct: ((c1.low - c3.high) / c3.high) * 100
          }
        });
      }
      
      // Bearish FVG (selling imbalance)
      if (c1.high < c3.low) {
        patterns.push({
          patternName: 'bearish_fvg',
          symbol: c3.symbol || 'ASSET',
          detectedAt: c3.timestamp || new Date().toISOString(),
          index: i,
          price: c2.close,
          meta: {
            gapStart: c1.high,
            gapEnd: c3.low,
            imbalanceSizePct: ((c3.low - c1.high) / c1.high) * 100
          }
        });
      }
    }
    return patterns;
  },

  /**
   * Detects Order Blocks (OB)
   * Identify large displacement candles (using body > average size)
   * and mark the previous opposite-color candle as the block.
   */
  detectOrderBlocks(candles) {
    const patterns = [];
    
    // Calculate average candle body size to identify displacement
    let totalBody = 0;
    for (let i = 0; i < candles.length; i++) {
      totalBody += Math.abs(candles[i].close - candles[i].open);
    }
    const avgBody = totalBody / candles.length;

    for (let i = 1; i < candles.length; i++) {
      const prev = candles[i - 1];
      const curr = candles[i];
      const body = Math.abs(curr.close - curr.open);

      // Large displacement (e.g. 2.5x average body)
      if (body > avgBody * 2.5) {
        const isBullishDisplacement = curr.close > curr.open;
        const isPrevBearish = prev.close < prev.open;

        if (isBullishDisplacement && isPrevBearish) {
          patterns.push({
            patternName: 'bullish_order_block',
            symbol: curr.symbol || 'ASSET',
            detectedAt: curr.timestamp || new Date().toISOString(),
            index: i,
            price: prev.low,
            meta: {
              blockHigh: prev.high,
              blockLow: prev.low,
              mitigated: false
            }
          });
        }

        if (!isBullishDisplacement && !isPrevBearish) {
          patterns.push({
            patternName: 'bearish_order_block',
            symbol: curr.symbol || 'ASSET',
            detectedAt: curr.timestamp || new Date().toISOString(),
            index: i,
            price: prev.high,
            meta: {
              blockHigh: prev.high,
              blockLow: prev.low,
              mitigated: false
            }
          });
        }
      }
    }
    return patterns;
  },

  /**
   * Detects Liquidity Sweeps
   * Price spikes past a recent low/high but closes back inside the range.
   */
  detectLiquiditySweeps(candles, lookback = 10) {
    const patterns = [];

    for (let i = lookback; i < candles.length; i++) {
      const curr = candles[i];
      const slice = candles.slice(i - lookback, i);
      
      const prevLows = slice.map(c => c.low);
      const prevHighs = slice.map(c => c.high);
      
      const localMin = Math.min(...prevLows);
      const localMax = Math.max(...prevHighs);

      // Bullish Sweep: Low is below localMin, but Close is above localMin
      if (curr.low < localMin && curr.close > localMin) {
        patterns.push({
          patternName: 'bullish_liquidity_sweep',
          symbol: curr.symbol || 'ASSET',
          detectedAt: curr.timestamp || new Date().toISOString(),
          index: i,
          price: curr.low,
          meta: {
            sweptLevel: localMin,
            rejectionRatio: (localMin - curr.low) / (curr.high - curr.low)
          }
        });
      }

      // Bearish Sweep: High is above localMax, but Close is below localMax
      if (curr.high > localMax && curr.close < localMax) {
        patterns.push({
          patternName: 'bearish_liquidity_sweep',
          symbol: curr.symbol || 'ASSET',
          detectedAt: curr.timestamp || new Date().toISOString(),
          index: i,
          price: curr.high,
          meta: {
            sweptLevel: localMax,
            rejectionRatio: (curr.high - localMax) / (curr.high - curr.low)
          }
        });
      }
    }
    return patterns;
  },

  /**
   * Detects Double Tops & Double Bottoms
   */
  detectDoubleTopsBottoms(candles, thresholdPct = 1.0) {
    const patterns = [];
    if (candles.length < 15) return [];

    // Find swing points
    const highs = [];
    const lows = [];

    for (let i = 2; i < candles.length - 2; i++) {
      // Swing High Check
      if (candles[i].high > candles[i-1].high && candles[i].high > candles[i-2].high &&
          candles[i].high > candles[i+1].high && candles[i].high > candles[i+2].high) {
        highs.push({ index: i, val: candles[i].high, time: candles[i].timestamp });
      }
      // Swing Low Check
      if (candles[i].low < candles[i-1].low && candles[i].low < candles[i-2].low &&
          candles[i].low < candles[i+1].low && candles[i].low < candles[i+2].low) {
        lows.push({ index: i, val: candles[i].low, time: candles[i].timestamp });
      }
    }

    // Match Double Tops
    for (let j = 1; j < highs.length; j++) {
      const p1 = highs[j - 1];
      const p2 = highs[j];
      const diff = Math.abs(p1.val - p2.val) / p1.val;

      if (diff <= thresholdPct / 100 && (p2.index - p1.index) > 3) {
        patterns.push({
          patternName: 'double_top',
          symbol: candles[p2.index].symbol || 'ASSET',
          detectedAt: p2.time,
          index: p2.index,
          price: p2.val,
          meta: {
            peak1: p1.val,
            peak2: p2.val,
            distanceBars: p2.index - p1.index
          }
        });
      }
    }

    // Match Double Bottoms
    for (let j = 1; j < lows.length; j++) {
      const v1 = lows[j - 1];
      const v2 = lows[j];
      const diff = Math.abs(v1.val - v2.val) / v1.val;

      if (diff <= thresholdPct / 100 && (v2.index - v1.index) > 3) {
        patterns.push({
          patternName: 'double_bottom',
          symbol: candles[v2.index].symbol || 'ASSET',
          detectedAt: v2.time,
          index: v2.index,
          price: v2.val,
          meta: {
            valley1: v1.val,
            valley2: v2.val,
            distanceBars: v2.index - v1.index
          }
        });
      }
    }

    return patterns;
  },

  /**
   * Detects Head and Shoulders (H&S) patterns
   */
  detectHeadAndShoulders(candles, thresholdPct = 2.0) {
    const patterns = [];
    if (candles.length < 20) return [];

    // Simple peak scanning
    const peaks = [];
    for (let i = 2; i < candles.length - 2; i++) {
      if (candles[i].high > candles[i-1].high && candles[i].high > candles[i-2].high &&
          candles[i].high > candles[i+1].high && candles[i].high > candles[i+2].high) {
        peaks.push({ index: i, val: candles[i].high, time: candles[i].timestamp });
      }
    }

    // Need at least 3 peaks
    for (let j = 2; j < peaks.length; j++) {
      const p1 = peaks[j - 2]; // Left Shoulder
      const p2 = peaks[j - 1]; // Head
      const p3 = peaks[j];     // Right Shoulder

      const isHeadHigher = p2.val > p1.val && p2.val > p3.val;
      const shouldersDiff = Math.abs(p1.val - p3.val) / p1.val;

      if (isHeadHigher && shouldersDiff <= thresholdPct / 100) {
        patterns.push({
          patternName: 'head_and_shoulders',
          symbol: candles[p3.index].symbol || 'ASSET',
          detectedAt: p3.time,
          index: p3.index,
          price: p3.val,
          meta: {
            leftShoulder: p1.val,
            head: p2.val,
            rightShoulder: p3.val
          }
        });
      }
    }

    return patterns;
  },

  /**
   * Detects breakout conditions above recent highs/lows with volume spikes
   */
  detectBreakouts(candles, lookback = 14) {
    const patterns = [];
    for (let i = lookback; i < candles.length; i++) {
      const curr = candles[i];
      const slice = candles.slice(i - lookback, i);
      
      const highs = slice.map(c => c.high);
      const lows = slice.map(c => c.low);
      const volumes = slice.map(c => c.volume || 1);

      const maxHigh = Math.max(...highs);
      const minLow = Math.min(...lows);
      const avgVol = volumes.reduce((a, b) => a + b, 0) / lookback;

      const isVolumeSpike = (curr.volume || 0) > avgVol * 1.5;

      if (curr.close > maxHigh && isVolumeSpike) {
        patterns.push({
          patternName: 'bullish_breakout',
          symbol: curr.symbol || 'ASSET',
          detectedAt: curr.timestamp || new Date().toISOString(),
          index: i,
          price: curr.close,
          meta: {
            brokenResistance: maxHigh,
            volumeRatio: (curr.volume || 0) / avgVol
          }
        });
      }

      if (curr.close < minLow && isVolumeSpike) {
        patterns.push({
          patternName: 'bearish_breakout',
          symbol: curr.symbol || 'ASSET',
          detectedAt: curr.timestamp || new Date().toISOString(),
          index: i,
          price: curr.close,
          meta: {
            brokenSupport: minLow,
            volumeRatio: (curr.volume || 0) / avgVol
          }
        });
      }
    }
    return patterns;
  }
};
