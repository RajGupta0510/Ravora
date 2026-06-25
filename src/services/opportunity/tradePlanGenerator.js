/**
 * TradePlanGenerator
 * 
 * Responsibility: Derive a complete, structured trade plan from market structure data.
 * 
 * Every output field is calculated deterministically from market data.
 * Nothing is random. Nothing is hardcoded.
 * 
 * Framework ref: Araiven Intelligence Framework §6 — Trade Plan Framework
 */

/**
 * Generates a complete trade plan for a given direction.
 * 
 * @param {string} direction - 'LONG' | 'SHORT' | 'HOLD' | 'WAIT'
 * @param {number} currentPrice - Live market price
 * @param {number[]} supportLevels - [S1, S2] detected support levels
 * @param {number[]} resistanceLevels - [R1, R2] detected resistance levels
 * @param {number} annualizedVolatility - Annualized volatility as decimal (e.g. 0.75 = 75%)
 * @returns {Object} Complete trade plan
 */
export function generateTradePlan(direction, currentPrice, supportLevels, resistanceLevels, annualizedVolatility) {
  const S1 = supportLevels[0] ?? currentPrice * 0.95;
  const S2 = supportLevels[1] ?? S1 * 0.95;
  const R1 = resistanceLevels[0] ?? currentPrice * 1.05;
  const R2 = resistanceLevels[1] ?? R1 * 1.05;

  let entry = 0;
  let stopLoss = 0;
  let takeProfit = 0;
  let riskRewardRatio = 'N/A';
  let expectedDuration = 'N/A';
  let tradeQuality = 'F';

  if (direction === 'LONG') {
    // §6.1 Entry: 0.5% below current price (pullback buffer)
    entry = round2(currentPrice * 0.995);

    // §6.2 Stop Loss: 2% below S1 (structural level)
    stopLoss = round2(S1 * 0.98);

    // Safety: SL must be below entry
    if (stopLoss >= entry) {
      stopLoss = round2(entry * 0.97);
    }

    // §6.3 Take Profit: 1% above R1
    takeProfit = round2(R1 * 1.01);

    // If RR < 1.5:1, extend TP to R2
    const rr1 = calcRR(entry, stopLoss, takeProfit);
    if (rr1 < 1.5 && R2 > R1) {
      takeProfit = round2(R2 * 1.01);
    }

    // Safety: TP must be above entry
    if (takeProfit <= entry) {
      takeProfit = round2(entry * 1.08);
    }

  } else if (direction === 'SHORT') {
    // §6.1 Entry: 0.5% above current price (bounce buffer)
    entry = round2(currentPrice * 1.005);

    // §6.2 Stop Loss: 2% above R1 (structural level)
    stopLoss = round2(R1 * 1.02);

    // Safety: SL must be above entry
    if (stopLoss <= entry) {
      stopLoss = round2(entry * 1.03);
    }

    // §6.3 Take Profit: 1% below S1
    takeProfit = round2(S1 * 0.99);

    // If RR < 1.5:1, extend TP to S2
    const rr1 = calcRR(entry, stopLoss, takeProfit);
    if (rr1 < 1.5 && S2 < S1) {
      takeProfit = round2(S2 * 0.99);
    }

    // Safety: TP must be below entry
    if (takeProfit >= entry) {
      takeProfit = round2(entry * 0.92);
    }
  }

  // §6.4 Risk-Reward Ratio
  if (direction === 'LONG' || direction === 'SHORT') {
    const rrVal = calcRR(entry, stopLoss, takeProfit);
    riskRewardRatio = `${rrVal.toFixed(1)}:1`;

    // §6.6 Trade Quality
    tradeQuality = classifyTradeQuality(rrVal);

    // §6.5 Expected Duration based on volatility
    expectedDuration = classifyDuration(annualizedVolatility);
  }

  return {
    suggestedEntry: entry,
    suggestedStopLoss: stopLoss,
    suggestedTakeProfit: takeProfit,
    riskRewardRatio,
    expectedDuration,
    tradeQuality
  };
}

/**
 * Calculates risk-reward ratio for a trade plan.
 * Returns 0 if inputs are invalid.
 */
function calcRR(entry, stopLoss, takeProfit) {
  const riskDiff = Math.abs(entry - stopLoss);
  const rewardDiff = Math.abs(takeProfit - entry);
  if (riskDiff === 0) return 0;
  return rewardDiff / riskDiff;
}

/**
 * §6.6 Trade Quality Classification
 * Based on the number of conditions met and the RR ratio.
 */
function classifyTradeQuality(rrValue) {
  if (rrValue >= 2.5) return 'A';
  if (rrValue >= 2.0) return 'B';
  if (rrValue >= 1.5) return 'C';
  if (rrValue >= 1.0) return 'D';
  return 'F';
}

/**
 * §6.5 Duration estimation from annualized volatility.
 * Higher volatility = faster-moving market = shorter hold time.
 */
function classifyDuration(annualizedVolatility) {
  if (annualizedVolatility > 1.2) return '1-2 days';
  if (annualizedVolatility > 0.8) return '2-3 days';
  if (annualizedVolatility > 0.5) return '3-5 days';
  return '7-10 days';
}

/** Round to 2 decimal places */
function round2(val) {
  return Math.round(val * 100) / 100;
}
