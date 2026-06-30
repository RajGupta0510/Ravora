/**
 * Scoring Rules
 * 
 * Provides pure mathematical rules to normalize and map raw intelligence engine outputs
 * (directions, levels, distances) into standard 0-100 scales.
 */

/**
 * Maps trend parameters to a 0-100 score.
 */
export function evaluateTrendScore(direction, strength) {
  let base = 50;
  if (direction === 'Bullish') base = 85;
  if (direction === 'Bearish') base = 15;
  
  // Blend direction base with strength
  const factor = strength / 100;
  if (direction === 'Bullish') {
    return Math.round(base + (15 * factor)); // 85 to 100
  } else if (direction === 'Bearish') {
    return Math.round(base - (15 * factor)); // 15 to 0
  }
  return base; // Sideways is 50
}

/**
 * Maps momentum parameters to a 0-100 score.
 */
export function evaluateMomentumScore(direction, score) {
  let base = 50;
  if (direction === 'Strengthening') base = 75;
  if (direction === 'Weakening') base = 25;

  // Blend with raw momentum score
  return Math.round((base * 0.4) + (score * 0.6));
}

/**
 * Maps market structure parameters to a 0-100 score.
 */
export function evaluateStructureScore(bias, strength) {
  let base = 50;
  if (bias === 'Bullish') base = 75;
  if (bias === 'Bearish') base = 25;

  // Blend with structure strength
  const factor = strength / 100;
  if (bias === 'Bullish') {
    return Math.round(50 + (base - 50) * factor); // 50 to 75
  } else if (bias === 'Bearish') {
    return Math.round(50 - (50 - base) * factor); // 50 to 25
  }
  return base;
}

/**
 * Evaluates support & resistance proximity.
 * If price is closer to support, it is a higher score for LONG (buying near floor).
 * If price is closer to resistance, it is a lower score (buying near ceiling).
 */
export function evaluateSRScore(distanceToSupport, distanceToResistance) {
  const totalDistance = distanceToSupport + distanceToResistance;
  if (totalDistance === 0) return 50;

  // Percentage proximity to support: closer to support = higher score (towards 90)
  const supportProximity = distanceToResistance / totalDistance; // 1.0 = at support, 0.0 = at resistance
  return Math.round(20 + (supportProximity * 60)); // Map to 20 - 80 range
}
