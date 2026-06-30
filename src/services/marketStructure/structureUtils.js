/**
 * Market Structure Utilities
 * 
 * Implements pivot detection (Swing Highs / Swing Lows), pivot classification (HH, HL, LH, LL),
 * and structural break detection (BOS, CHoCH) based on pure price action.
 */

/**
 * Detects swing high (peak) and swing low (trough) pivots in price history.
 * A swing high is a high that is higher than the highs of N candles to its left and right.
 */
export function findSwingPivots(history, windowSize = 3) {
  if (!history || history.length < windowSize * 2 + 1) {
    return { peaks: [], troughs: [] };
  }

  const peaks = [];
  const troughs = [];

  for (let i = windowSize; i < history.length - windowSize; i++) {
    const currentHigh = history[i].high;
    const currentLow = history[i].low;
    const currentTimestamp = history[i].timestamp;

    let isPeak = true;
    let isTrough = true;

    for (let w = 1; w <= windowSize; w++) {
      if (history[i - w].high >= currentHigh || history[i + w].high > currentHigh) {
        isPeak = false;
      }
      if (history[i - w].low <= currentLow || history[i + w].low < currentLow) {
        isTrough = false;
      }
    }

    if (isPeak) {
      peaks.push({ price: currentHigh, index: i, timestamp: currentTimestamp, type: 'High' });
    }
    if (isTrough) {
      troughs.push({ price: currentLow, index: i, timestamp: currentTimestamp, type: 'Low' });
    }
  }

  return { peaks, troughs };
}

/**
 * Classifies pivots as Higher Highs (HH), Higher Lows (HL), Lower Highs (LH), or Lower Lows (LL)
 * by comparing each pivot to its predecessor.
 */
export function classifyPivots(peaks, troughs) {
  const classifiedPeaks = [];
  const classifiedTroughs = [];

  // Classify Swing Highs
  for (let i = 0; i < peaks.length; i++) {
    const curr = peaks[i];
    if (i === 0) {
      classifiedPeaks.push({ ...curr, label: 'H' }); // Base High
      continue;
    }
    const prev = peaks[i - 1];
    const label = curr.price > prev.price ? 'HH' : 'LH';
    classifiedPeaks.push({ ...curr, label });
  }

  // Classify Swing Lows
  for (let i = 0; i < troughs.length; i++) {
    const curr = troughs[i];
    if (i === 0) {
      classifiedTroughs.push({ ...curr, label: 'L' }); // Base Low
      continue;
    }
    const prev = troughs[i - 1];
    const label = curr.price > prev.price ? 'HL' : 'LL';
    classifiedTroughs.push({ ...curr, label });
  }

  return { peaks: classifiedPeaks, troughs: classifiedTroughs };
}

/**
 * Detects structural breaks (BOS and CHoCH) by checking if the latest close price
 * has broken the most recent classified swing high or swing low.
 */
export function detectStructuralBreaks(history, classifiedPivots) {
  const { peaks, troughs } = classifiedPivots;
  if (peaks.length < 2 || troughs.length < 2) {
    return { hasBOS: false, hasCHoCH: false, breakLevel: null, type: null };
  }

  const latestClose = history[history.length - 1].close;
  
  // Last swing high and swing low
  const lastHigh = peaks[peaks.length - 1];
  const lastLow = troughs[troughs.length - 1];
  
  // Second-to-last swing high and swing low to determine the prevailing trend
  const prevHigh = peaks[peaks.length - 2];
  const prevLow = troughs[troughs.length - 2];

  const isUpTrend = lastHigh.price > prevHigh.price && lastLow.price > prevLow.price;
  const isDownTrend = lastHigh.price < prevHigh.price && lastLow.price < prevLow.price;

  // 1. Break of Structure (BOS) - Trend Continuation
  // Uptrend: Price breaks above the last HH
  if (isUpTrend && latestClose > lastHigh.price) {
    return {
      hasBOS: true,
      hasCHoCH: false,
      breakLevel: lastHigh.price,
      type: 'BOS_BULLISH',
      description: `Bullish Break of Structure (BOS) confirmed: Price closed above swing high resistance at $${lastHigh.price.toLocaleString()}.`
    };
  }
  // Downtrend: Price breaks below the last LL
  if (isDownTrend && latestClose < lastLow.price) {
    return {
      hasBOS: true,
      hasCHoCH: false,
      breakLevel: lastLow.price,
      type: 'BOS_BEARISH',
      description: `Bearish Break of Structure (BOS) confirmed: Price closed below swing low support at $${lastLow.price.toLocaleString()}.`
    };
  }

  // 2. Change of Character (CHoCH) - Reversal
  // Uptrend Reversal: Price breaks below the last HL
  if (isUpTrend && latestClose < lastLow.price) {
    return {
      hasBOS: false,
      hasCHoCH: true,
      breakLevel: lastLow.price,
      type: 'CHOCH_BEARISH',
      description: `Bearish Change of Character (CHoCH) detected: Price broke below the last swing low support at $${lastLow.price.toLocaleString()}, indicating a potential trend reversal.`
    };
  }
  // Downtrend Reversal: Price breaks above the last LH
  if (isDownTrend && latestClose > lastHigh.price) {
    return {
      hasBOS: false,
      hasCHoCH: true,
      breakLevel: lastHigh.price,
      type: 'CHOCH_BULLISH',
      description: `Bullish Change of Character (CHoCH) detected: Price broke above the last swing high resistance at $${lastHigh.price.toLocaleString()}, indicating a potential trend reversal.`
    };
  }

  return { hasBOS: false, hasCHoCH: false, breakLevel: null, type: null, description: 'No structural breaks detected.' };
}
