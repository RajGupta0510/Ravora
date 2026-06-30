import { RiskService } from '../risk/riskService.js';

/**
 * RiskEvaluator
 * 
 * Responsibility: Bridge between the orchestrating OpportunityEngine and the pluggable
 * RiskService. Computes the composite risk score, veto conditions, trade quality, and position sizing.
 * 
 * Framework ref: Araiven Intelligence Framework §4.2 — Risk Score, §9.2 — Conservatism by Default
 */

/**
 * Evaluates risk for an asset and determines if a veto should be applied.
 * 
 * @param {Object} inputs - Combined indicator outputs
 * @param {Object} signalInputs - Future: external signals (e.g. Funding Rates)
 * @returns {Object} Risk assessment result
 */
export function evaluateRisk(inputs, signalInputs = {}) {
  // Use default capital of $132,000 (aligned with onboarding default)
  const capital = 132000;
  
  const assessment = RiskService.evaluateRisk(inputs, capital);

  return {
    riskScore: assessment.riskScore,
    riskLevel: assessment.riskLevel.toLowerCase(), // Maintain lowercase for backward compatibility
    isVetoed: assessment.isVetoed,
    tradeQuality: assessment.tradeQuality,
    recommendedPositionSize: assessment.recommendedPositionSize,
    riskContext: assessment.explanation
  };
}
