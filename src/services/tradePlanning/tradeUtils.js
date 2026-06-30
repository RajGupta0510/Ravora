/**
 * Trade Planning Utilities
 * 
 * Implements quantitative calculations for take-profit levels, risk-reward ratios,
 * trade probability estimation, and holding period classification.
 */

/**
 * Calculates three take profit targets (TP1, TP2, TP3) based on entry, stop-loss,
 * and historical S&R levels.
 */
export function calculateTakeProfits(entry, stopLoss, direction, supportLevels, resistanceLevels) {
  const risk = Math.abs(entry - stopLoss);
  const S1 = supportLevels[0] || entry * 0.95;
  const S2 = supportLevels[1] || S1 * 0.95;
  const R1 = resistanceLevels[0] || entry * 1.05;
  const R2 = resistanceLevels[1] || R1 * 1.05;

  let tp1 = 0;
  let tp2 = 0;
  let tp3 = 0;

  if (direction === 'LONG') {
    // TP1: Conservative (1.2:1 R:R or R1 resistance)
    tp1 = Math.min(R1 * 1.005, entry + (risk * 1.2));
    // TP2: Balanced (2.0:1 R:R or R2 resistance)
    tp2 = Math.min(R2 * 1.005, entry + (risk * 2.0));
    // TP3: Aggressive (3.0:1 R:R)
    tp3 = entry + (risk * 3.0);
    
    // Safety checks
    if (tp1 <= entry) tp1 = entry * 1.03;
    if (tp2 <= tp1) tp2 = tp1 * 1.05;
    if (tp3 <= tp2) tp3 = tp2 * 1.08;
  } else {
    // TP1: Conservative (1.2:1 R:R or S1 support)
    tp1 = Math.max(S1 * 0.995, entry - (risk * 1.2));
    // TP2: Balanced (2.0:1 R:R or S2 support)
    tp2 = Math.max(S2 * 0.995, entry - (risk * 2.0));
    // TP3: Aggressive (3.0:1 R:R)
    tp3 = entry - (risk * 3.0);

    // Safety checks
    if (tp1 >= entry) tp1 = entry * 0.97;
    if (tp2 >= tp1) tp2 = tp1 * 0.95;
    if (tp3 >= tp2) tp3 = tp2 * 0.92;
  }

  return {
    tp1: Math.round(tp1 * 100) / 100,
    tp2: Math.round(tp2 * 100) / 100,
    tp3: Math.round(tp3 * 100) / 100
  };
}

/**
 * Calculates the Risk/Reward ratio based on Entry, Stop Loss, and Take Profit 2 (our balanced target).
 */
export function calculateRiskRewardRatio(entry, stopLoss, takeProfit) {
  const risk = Math.abs(entry - stopLoss);
  const reward = Math.abs(takeProfit - entry);
  if (risk === 0) return 0;
  return Math.round((reward / risk) * 10) / 10;
}

/**
 * Estimates the probability of trade success (0% to 100%) by blending the
 * Opportunity, Confidence, and Risk scores.
 */
export function calculateTradeProbability(oppScore, confScore, riskScore) {
  // Blend: 40% Opportunity, 40% Confidence, 20% Low Risk (100 - riskScore)
  const probability = (oppScore * 0.4) + (confScore * 0.4) + ((100 - riskScore) * 0.2);
  // Clamp between 35% and 85% (no trade is 100% guaranteed)
  return Math.round(Math.max(35, Math.min(85, probability)));
}

/**
 * Estimates the holding duration based on annualized volatility.
 */
export function estimateHoldingTime(annualizedVolatility) {
  if (annualizedVolatility > 1.2) return '1-2 days';
  if (annualizedVolatility > 0.8) return '2-3 days';
  if (annualizedVolatility > 0.5) return '3-5 days';
  return '7-10 days';
}
