/**
 * Araiven Decision Rules
 * 
 * Implements the deterministic decision rules to resolve the final trading recommendation
 * from the compiled outputs of the Trend, Momentum, Volume, and Risk engines.
 */

/**
 * Resolves the final recommendation for an asset.
 * 
 * @param {Object} inputs - Combined scoring and risk parameters
 * @returns {string} 'LONG' | 'SHORT' | 'WAIT' | 'HOLD'
 */
export function decideFinalRecommendation(inputs) {
  const {
    trendDirection = 'Sideways',
    rsi = 50,
    opportunityScore = 50,
    riskScore = 35,
    volumeConfirmation = 50,
    isVetoed = false
  } = inputs;

  // Rule 1: Risk Veto overrides all other signals
  if (isVetoed) {
    return 'WAIT';
  }

  // Rule 2: Long Setup Conditions
  const longConditions = [
    trendDirection === 'Bullish',
    rsi >= 40 && rsi <= 70,
    opportunityScore >= 60,
    riskScore < 65,
    volumeConfirmation >= 45
  ];

  // Rule 3: Short Setup Conditions
  const shortConditions = [
    trendDirection === 'Bearish',
    rsi >= 30 && rsi <= 60,
    opportunityScore < 45,
    riskScore < 65,
    volumeConfirmation >= 45
  ];

  const longMet = longConditions.filter(Boolean).length;
  const shortMet = shortConditions.filter(Boolean).length;

  // All 5 LONG conditions met -> Confirmed LONG
  if (longMet === 5) {
    return 'LONG';
  }

  // All 5 SHORT conditions met -> Confirmed SHORT
  if (shortMet === 5) {
    return 'SHORT';
  }

  // 4 LONG conditions met & opportunity is positive -> Potential setup forming, WAIT for confirmation
  if (longMet === 4 && opportunityScore >= 50) {
    return 'WAIT';
  }

  // 4 SHORT conditions met & opportunity is negative -> Potential setup forming, WAIT for confirmation
  if (shortMet === 4 && opportunityScore < 50) {
    return 'WAIT';
  }

  // No clear trading edge -> HOLD
  return 'HOLD';
}
