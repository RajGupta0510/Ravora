import { BaseTradeModel } from './tradePlanner.js';
import { calculateTakeProfits, calculateRiskRewardRatio, calculateTradeProbability, estimateHoldingTime } from './tradeUtils.js';

/**
 * Pluggable Model: Pullback Trade Model
 * Triggers in trending markets. Buys near support in uptrends, sells near resistance in downtrends.
 */
export class PullbackTradeModel extends BaseTradeModel {
  constructor() {
    super('Pullback');
  }

  generatePlan(inputs) {
    const {
      price,
      direction,
      supportLevels = [],
      resistanceLevels = [],
      opportunityScore = 50,
      confidenceScore = 50,
      riskScore = 35,
      annualizedVolatility = 0.65
    } = inputs;

    const S1 = supportLevels[0] || price * 0.95;
    const R1 = resistanceLevels[0] || price * 1.05;

    let entry = price;
    let stopLoss = 0;

    if (direction === 'LONG') {
      // Entry is slightly below current price (pullback buffer)
      entry = Math.round(price * 0.995 * 100) / 100;
      // Stop Loss is 1.5% below S1 support
      stopLoss = Math.round(S1 * 0.985 * 100) / 100;
      if (stopLoss >= entry) stopLoss = Math.round(entry * 0.97 * 100) / 100;
    } else {
      // Entry is slightly above current price (bounce buffer)
      entry = Math.round(price * 1.005 * 100) / 100;
      // Stop Loss is 1.5% above R1 resistance
      stopLoss = Math.round(R1 * 1.015 * 100) / 100;
      if (stopLoss <= entry) stopLoss = Math.round(entry * 1.03 * 100) / 100;
    }

    const targets = calculateTakeProfits(entry, stopLoss, direction, supportLevels, resistanceLevels);
    const rrVal = calculateRiskRewardRatio(entry, stopLoss, targets.tp2);
    const probability = calculateTradeProbability(opportunityScore, confidenceScore, riskScore);
    const duration = estimateHoldingTime(annualizedVolatility);

    return {
      suggestedEntry: entry,
      suggestedStopLoss: stopLoss,
      suggestedTakeProfit: targets.tp2,
      suggestedTakeProfit1: targets.tp1,
      suggestedTakeProfit2: targets.tp2,
      suggestedTakeProfit3: targets.tp3,
      riskRewardRatio: `${rrVal}:1`,
      expectedDuration: duration,
      probability
    };
  }
}

/**
 * Pluggable Model: Breakout Trade Model
 * Triggers in high-momentum trending markets. Enters as price crosses S&R levels.
 */
export class BreakoutTradeModel extends BaseTradeModel {
  constructor() {
    super('Breakout');
  }

  generatePlan(inputs) {
    const {
      price,
      direction,
      supportLevels = [],
      resistanceLevels = [],
      opportunityScore = 50,
      confidenceScore = 50,
      riskScore = 35,
      annualizedVolatility = 0.65
    } = inputs;

    const S1 = supportLevels[0] || price * 0.95;
    const R1 = resistanceLevels[0] || price * 1.05;

    let entry = price;
    let stopLoss = 0;

    if (direction === 'LONG') {
      // Entry is slightly above R1 resistance (breakout confirmation)
      entry = Math.round(R1 * 1.005 * 100) / 100;
      // Stop Loss is placed inside the broken range, below R1
      stopLoss = Math.round(R1 * 0.98 * 100) / 100;
      if (stopLoss >= entry) stopLoss = Math.round(entry * 0.97 * 100) / 100;
    } else {
      // Entry is slightly below S1 support (breakdown confirmation)
      entry = Math.round(S1 * 0.995 * 100) / 100;
      // Stop Loss is placed inside the broken range, above S1
      stopLoss = Math.round(S1 * 1.02 * 100) / 100;
      if (stopLoss <= entry) stopLoss = Math.round(entry * 1.03 * 100) / 100;
    }

    const targets = calculateTakeProfits(entry, stopLoss, direction, supportLevels, resistanceLevels);
    const rrVal = calculateRiskRewardRatio(entry, stopLoss, targets.tp2);
    // Breakouts have slightly lower win rate but higher risk-reward
    const probability = Math.round(calculateTradeProbability(opportunityScore, confidenceScore, riskScore) * 0.9);
    const duration = estimateHoldingTime(annualizedVolatility * 1.5); // Faster execution

    return {
      suggestedEntry: entry,
      suggestedStopLoss: stopLoss,
      suggestedTakeProfit: targets.tp2,
      suggestedTakeProfit1: targets.tp1,
      suggestedTakeProfit2: targets.tp2,
      suggestedTakeProfit3: targets.tp3,
      riskRewardRatio: `${rrVal}:1`,
      expectedDuration: duration,
      probability
    };
  }
}

/**
 * Pluggable Model: Mean Reversion Trade Model
 * Triggers in range-bound markets. Trades against price extremes.
 */
export class MeanReversionTradeModel extends BaseTradeModel {
  constructor() {
    super('MeanReversion');
  }

  generatePlan(inputs) {
    const {
      price,
      direction,
      supportLevels = [],
      resistanceLevels = [],
      opportunityScore = 50,
      confidenceScore = 50,
      riskScore = 35,
      annualizedVolatility = 0.65
    } = inputs;

    const S1 = supportLevels[0] || price * 0.95;
    const R1 = resistanceLevels[0] || price * 1.05;

    let entry = price;
    let stopLoss = 0;

    if (direction === 'LONG') {
      // Entry is exactly at S1 support (limit order)
      entry = Math.round(S1 * 100) / 100;
      // Tight stop loss below S1
      stopLoss = Math.round(S1 * 0.99 * 100) / 100;
    } else {
      // Entry is exactly at R1 resistance
      entry = Math.round(R1 * 100) / 100;
      // Tight stop loss above R1
      stopLoss = Math.round(R1 * 1.01 * 100) / 100;
    }

    const targets = calculateTakeProfits(entry, stopLoss, direction, supportLevels, resistanceLevels);
    const rrVal = calculateRiskRewardRatio(entry, stopLoss, targets.tp2);
    // Mean reversion has higher win rate but tighter risk parameters
    const probability = Math.round(calculateTradeProbability(opportunityScore, confidenceScore, riskScore) * 1.05);
    const duration = estimateHoldingTime(annualizedVolatility * 0.7); // Longer holding time

    return {
      suggestedEntry: entry,
      suggestedStopLoss: stopLoss,
      suggestedTakeProfit: targets.tp2,
      suggestedTakeProfit1: targets.tp1,
      suggestedTakeProfit2: targets.tp2,
      suggestedTakeProfit3: targets.tp3,
      riskRewardRatio: `${rrVal}:1`,
      expectedDuration: duration,
      probability
    };
  }
}
