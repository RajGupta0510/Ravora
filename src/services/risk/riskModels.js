import { BaseRiskModel } from './riskAnalyzer.js';

/**
 * Pluggable Model: Volatility & Drawdown Risk
 * Evaluates asset volatility and applies a safety veto if volatility is in the extreme regime (>= 88).
 */
export class VolatilityDrawdownRiskModel extends BaseRiskModel {
  constructor(weight = 0.4) {
    super('VolatilityDrawdown', weight);
  }

  evaluate(inputs) {
    const { volatilityScore = 50, annualizedVolatility = 0.65 } = inputs;
    
    let score = volatilityScore;
    let isVetoed = volatilityScore >= 88; // Safety veto threshold
    let explanation = '';

    if (isVetoed) {
      explanation = `Extreme volatility detected (score: ${volatilityScore}/100, annualized: ${(annualizedVolatility * 100).toFixed(1)}%). Trade vetoed for capital preservation.`;
    } else if (volatilityScore > 70) {
      explanation = `High volatility (score: ${volatilityScore}/100) increases the risk of wide price swings and potential stop-loss hunts.`;
    } else {
      explanation = `Volatility is within normal parameters (score: ${volatilityScore}/100).`;
    }

    return { score, isVetoed, explanation };
  }
}

/**
 * Pluggable Model: Indicator Confluence Risk
 * Evaluates the alignment of Trend, Momentum, and Market Structure.
 * Conflict increases risk; confluence reduces it.
 */
export class IndicatorConfluenceRiskModel extends BaseRiskModel {
  constructor(weight = 0.3) {
    super('IndicatorConfluence', weight);
  }

  evaluate(inputs) {
    const { trendDirection = 'Sideways', momentumDirection = 'Neutral', structureBias = 'Neutral', trendStrength = 50 } = inputs;

    let conflictCount = 0;
    let explanation = '';

    // Check for Trend vs Momentum conflict
    if (trendDirection === 'Bullish' && momentumDirection === 'Weakening') conflictCount++;
    if (trendDirection === 'Bearish' && momentumDirection === 'Strengthening') conflictCount++;

    // Check for Trend vs Market Structure conflict
    if (trendDirection === 'Bullish' && structureBias === 'Bearish') conflictCount++;
    if (trendDirection === 'Bearish' && structureBias === 'Bullish') conflictCount++;

    // Base risk score derived from trend uncertainty (100 - trendStrength)
    let score = 100 - trendStrength;

    if (conflictCount === 2) {
      score = Math.min(95, score + 30);
      explanation = `Critical indicator conflict: Trend is ${trendDirection}, but Momentum is ${momentumDirection} and Market Structure is ${structureBias}. High risk of false breakout.`;
    } else if (conflictCount === 1) {
      score = Math.min(85, score + 15);
      explanation = `Minor indicator conflict: Trend is ${trendDirection}, but Momentum/Structure shows divergence (${momentumDirection}/${structureBias}).`;
    } else {
      score = Math.max(10, score - 10);
      explanation = `Solid indicator confluence: Trend (${trendDirection}), Momentum (${momentumDirection}), and Market Structure (${structureBias}) are aligned.`;
    }

    return { score, isVetoed: false, explanation };
  }
}

/**
 * Pluggable Model: Risk/Reward Profile
 * Evaluates the Risk/Reward ratio of the trade plan.
 * An unfavorable R:R (< 1.5:1) increases risk and degrades trade quality.
 */
export class RiskRewardRiskModel extends BaseRiskModel {
  constructor(weight = 0.3) {
    super('RiskRewardProfile', weight);
  }

  evaluate(inputs) {
    const { suggestedEntry = 0, suggestedStopLoss = 0, suggestedTakeProfit = 0, riskRewardRatio = '2.0:1' } = inputs;

    let rrVal = 2.0;
    if (typeof riskRewardRatio === 'string') {
      rrVal = parseFloat(riskRewardRatio.split(':')[0]) || 2.0;
    } else if (typeof riskRewardRatio === 'number') {
      rrVal = riskRewardRatio;
    }

    let score = 50;
    let isVetoed = false;
    let explanation = '';

    if (suggestedEntry === 0 || suggestedStopLoss === 0 || suggestedTakeProfit === 0) {
      return { score: 50, isVetoed: false, explanation: 'No active trade targets established.' };
    }

    if (rrVal < 1.0) {
      score = 90;
      isVetoed = true; // Veto if SL is larger than TP
      explanation = `Extremely unfavorable Risk/Reward ratio of ${rrVal}:1 (Stop-Loss is wider than Take-Profit). Trade vetoed.`;
    } else if (rrVal < 1.5) {
      score = 75;
      explanation = `Unfavorable Risk/Reward ratio of ${rrVal}:1. Minimum recommended threshold is 1.5:1.`;
    } else {
      score = Math.max(15, Math.round(100 - (rrVal * 25)));
      explanation = `Favorable Risk/Reward ratio of ${rrVal}:1. Entry provides adequate margin of safety.`;
    }

    return { score, isVetoed, explanation };
  }
}
