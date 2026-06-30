import { BaseStructureModel } from './marketStructureAnalyzer.js';
import { findSwingPivots, classifyPivots, detectStructuralBreaks } from './structureUtils.js';

/**
 * Pluggable Model: Swing Pivot Sequence
 * Classifies the sequence of swing highs and swing lows (HH/HL vs. LH/LL).
 */
export class SwingPivotModel extends BaseStructureModel {
  constructor(weight = 0.5) {
    super('SwingPivotSequence', weight);
  }

  evaluate(currentPrice, history) {
    if (!history || history.length < 20) {
      return { bias: 'Neutral', score: 50, explanation: 'Insufficient history for swing pivot analysis.' };
    }

    const { peaks, troughs } = findSwingPivots(history, 3);
    const classified = classifyPivots(peaks, troughs);

    if (classified.peaks.length < 2 || classified.troughs.length < 2) {
      return {
        bias: 'Neutral',
        score: 50,
        explanation: 'Price action is consolidating within a narrow range with no established swing pivot structure.'
      };
    }

    const lastPeak = classified.peaks[classified.peaks.length - 1];
    const lastTrough = classified.troughs[classified.troughs.length - 1];

    let bias = 'Neutral';
    let score = 50;
    let explanation = '';

    // Classify based on the latest swing labels
    if (lastPeak.label === 'HH' && lastTrough.label === 'HL') {
      bias = 'Bullish';
      score = 85;
      explanation = `Swing structure is bullish: price is establishing consecutive Higher Highs ($${lastPeak.price.toLocaleString()}) and Higher Lows ($${lastTrough.price.toLocaleString()}).`;
    } else if (lastPeak.label === 'LH' && lastTrough.label === 'LL') {
      bias = 'Bearish';
      score = 15;
      explanation = `Swing structure is bearish: price is establishing consecutive Lower Highs ($${lastPeak.price.toLocaleString()}) and Lower Lows ($${lastTrough.price.toLocaleString()}).`;
    } else if (lastPeak.label === 'HH' && lastTrough.label === 'LL') {
      // Expanding volatility (broadening formation)
      bias = 'Neutral';
      score = 50;
      explanation = `Broadening price structure detected: price has registered a Higher High ($${lastPeak.price.toLocaleString()}) and a Lower Low ($${lastTrough.price.toLocaleString()}), indicating high volatility and lack of trend direction.`;
    } else {
      // Contracting volatility / consolidation
      bias = 'Neutral';
      score = 45;
      explanation = `Consolidating swing structure: price is registering Lower Highs ($${lastPeak.price.toLocaleString()}) and Higher Lows ($${lastTrough.price.toLocaleString()}) in a contracting range.`;
    }

    return { bias, score, explanation, raw: classified };
  }
}

/**
 * Pluggable Model: Structural Breaks (BOS & CHoCH)
 * Evaluates if price has recently closed above/below key swing levels to signal trend continuation or reversal.
 */
export class BreakOfStructureModel extends BaseStructureModel {
  constructor(weight = 0.5) {
    super('StructuralBreaks', weight);
  }

  evaluate(currentPrice, history) {
    if (!history || history.length < 20) {
      return { bias: 'Neutral', score: 50, explanation: 'Insufficient history for break analysis.' };
    }

    const { peaks, troughs } = findSwingPivots(history, 3);
    const classified = classifyPivots(peaks, troughs);
    const structuralBreak = detectStructuralBreaks(history, classified);

    let bias = 'Neutral';
    let score = 50;
    let explanation = structuralBreak.description;

    if (structuralBreak.type === 'BOS_BULLISH') {
      bias = 'Bullish';
      score = 90;
    } else if (structuralBreak.type === 'BOS_BEARISH') {
      bias = 'Bearish';
      score = 10;
    } else if (structuralBreak.type === 'CHOCH_BULLISH') {
      bias = 'Bullish';
      score = 80;
    } else if (structuralBreak.type === 'CHOCH_BEARISH') {
      bias = 'Bearish';
      score = 20;
    } else {
      bias = 'Neutral';
      score = 50;
      // Provide context about nearest key levels
      if (classified.peaks.length > 0 && classified.troughs.length > 0) {
        const lastHigh = classified.peaks[classified.peaks.length - 1].price;
        const lastLow = classified.troughs[classified.troughs.length - 1].price;
        explanation = `Price is trading inside the structural range: Support at $${lastLow.toLocaleString()} and Resistance at $${lastHigh.toLocaleString()}. No breakout confirmed.`;
      }
    }

    return { bias, score, explanation, raw: structuralBreak };
  }
}
