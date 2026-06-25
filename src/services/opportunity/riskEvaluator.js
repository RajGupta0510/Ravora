/**
 * RiskEvaluator
 * 
 * Responsibility: Evaluate all risk dimensions for a scored asset and produce a final risk assessment.
 * Applies veto rules per the Araiven Intelligence Framework.
 * 
 * Framework ref: Araiven Intelligence Framework §4.2 — Risk Score, §9.2 — Conservatism by Default
 * 
 * Future: This module is designed to receive additional signals (Funding Rates,
 * Open Interest, On-chain Metrics, News) via the signalInputs parameter.
 */

/**
 * Evaluates risk for an asset and determines if a veto should be applied.
 * 
 * @param {Object} scores - Scores from ScoringEngine (volatilityScore, trendStrength, etc.)
 * @param {Object} signalInputs - Future: { fundingRate, openInterest, newsScore, onChainScore }
 * @returns {Object} Risk assessment result
 */
export function evaluateRisk(scores, signalInputs = {}) {
  const {
    volatilityScore = 50,
    trendStrength = 50,
    confidenceScore = 50,
    opportunityScore = 50,
    suggestedDirection = 'HOLD'
  } = scores;

  /**
   * §4.2 Risk Score Formula:
   *   Risk Score = round( (Volatility × 0.60) + ((100 - TrendStrength) × 0.40) )
   * 
   * Volatility is the dominant factor (60%) because it represents
   * the probability of a large adverse move in either direction.
   * 
   * (100 - TrendStrength) is the uncertainty factor — a weak or conflicting
   * trend means higher probability of loss even on a "correct" directional bet.
   */
  const riskScore = Math.round((volatilityScore * 0.6) + ((100 - trendStrength) * 0.4));

  // Classify risk level
  const riskLevel = classifyRiskLevel(riskScore);

  // §4.1 Score Combination Rules — Rule 1: Risk Score veto
  // If risk >= 81, no active trade recommendation is possible
  const isVetoed = riskScore >= 81;

  // §9.2 Conservatism: Apply additional veto conditions
  const vetoed = isVetoed || isExtremeVolatilityVeto(volatilityScore);

  // Future hook for additional signal inputs (Funding Rates, News severity, etc.)
  // const externalRiskBoost = evaluateExternalSignals(signalInputs);
  // riskScore = Math.min(100, riskScore + externalRiskBoost);

  return {
    riskScore: Math.min(100, Math.max(0, riskScore)),
    riskLevel,
    isVetoed: vetoed,
    riskContext: buildRiskContext(riskScore, volatilityScore, trendStrength)
  };
}

/**
 * Classifies a numeric risk score into a human-readable label.
 * Used for display and for filtering by user risk profile.
 */
function classifyRiskLevel(riskScore) {
  if (riskScore <= 25) return 'low';
  if (riskScore <= 45) return 'medium';
  if (riskScore <= 65) return 'elevated';
  if (riskScore <= 80) return 'high';
  return 'extreme';
}

/**
 * Veto if volatility score is in the extreme regime (≥ 88).
 * Per framework: extreme volatility regime defaults to WAIT regardless of other signals.
 */
function isExtremeVolatilityVeto(volatilityScore) {
  return volatilityScore >= 88;
}

/**
 * Builds the risk context sentence for the reasoning block.
 */
function buildRiskContext(riskScore, volatilityScore, trendStrength) {
  const parts = [];

  if (riskScore <= 25) {
    parts.push(`Risk profile is low at ${riskScore}/100.`);
  } else if (riskScore <= 45) {
    parts.push(`Risk profile is moderate at ${riskScore}/100.`);
  } else if (riskScore <= 65) {
    parts.push(`Risk is elevated at ${riskScore}/100 — consider reduced position sizing.`);
  } else if (riskScore <= 80) {
    parts.push(`Risk is high at ${riskScore}/100 — deploy only minimal capital if trading.`);
  } else {
    parts.push(`Risk is extreme at ${riskScore}/100 — no active trade is recommended.`);
  }

  if (volatilityScore > 70) {
    parts.push(`Volatility is the primary risk driver (score: ${volatilityScore}/100).`);
  }
  if (trendStrength < 40) {
    parts.push(`A weak trend contributes to uncertainty — conflicting signals increase directional risk.`);
  }

  return parts.join(' ');
}
