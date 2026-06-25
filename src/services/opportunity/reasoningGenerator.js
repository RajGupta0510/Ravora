/**
 * ReasoningGenerator
 * 
 * Responsibility: Produce a structured, human-readable explanation for every recommendation.
 * 
 * Every recommendation must answer the 7 explainability questions defined in the framework.
 * Output uses a structured tagged format: [TREND] [MOMENTUM] [VOLUME] [STRUCTURE] [RISK] [SIGNAL]
 * 
 * Framework ref: Araiven Intelligence Framework §7 — Explainability Standard
 * 
 * Design: Each section of the reasoning is independently generated from its respective 
 * signal data. This means future signal additions (News, Funding Rates) can simply 
 * prepend or append their own tagged block without restructuring the whole output.
 */

/**
 * Generates a complete, structured reasoning block for a recommendation.
 * 
 * @param {Object} params
 * @param {string} params.symbol - Asset symbol (e.g. 'BTC')
 * @param {string} params.direction - Recommended direction
 * @param {Object} params.trendResult - Output from TrendAnalyzer
 * @param {Object} params.momentumResult - Output from MomentumAnalyzer
 * @param {Object} params.volumeResult - Output from VolumeAnalyzer
 * @param {Object} params.volatilityResult - Output from VolatilityAnalyzer
 * @param {Object} params.structureResult - Output from MarketStructureAnalyzer
 * @param {Object} params.riskAssessment - Output from RiskEvaluator
 * @param {number} params.opportunityScore
 * @param {number} params.confidenceScore
 * @param {Object} params.tradePlan - Output from TradePlanGenerator
 * @param {Array<Object>} params.allOpportunities - Other scored assets for comparison
 * @returns {string} Full reasoning paragraph
 */
export function generateReasoning(params) {
  const {
    symbol,
    direction,
    trendResult,
    momentumResult,
    volumeResult,
    volatilityResult,
    structureResult,
    riskAssessment,
    opportunityScore,
    confidenceScore,
    tradePlan,
    allOpportunities = []
  } = params;

  const blocks = [];

  // [TREND] Block — §7 Q2: Why this direction?
  blocks.push(buildTrendBlock(trendResult));

  // [MOMENTUM] Block — §7 Q3: Why now?
  blocks.push(buildMomentumBlock(momentumResult));

  // [VOLUME] Block — Confirms or denies conviction
  blocks.push(buildVolumeBlock(volumeResult));

  // [STRUCTURE] Block — §7 Q5: What are the biggest risks?
  blocks.push(buildStructureBlock(structureResult, tradePlan));

  // [RISK] Block — §7 Q5 & Q6: What would invalidate?
  blocks.push(buildRiskBlock(riskAssessment, tradePlan));

  // [SIGNAL] Block — §7 Q7: Confidence + final summary
  blocks.push(buildSignalBlock(direction, opportunityScore, confidenceScore, symbol, allOpportunities));

  return blocks.filter(Boolean).join(' ');
}

// ---------------------------------------------------------------------------
// Section Builders
// ---------------------------------------------------------------------------

function buildTrendBlock(trendResult) {
  if (!trendResult) return '';
  const { trendDirection, trendStrength, trendDeviation } = trendResult;
  const pct = trendDeviation ? (Math.abs(trendDeviation) * 100).toFixed(1) : '0.0';

  if (trendDirection === 'Bullish') {
    return `[TREND] Trend is bullish — price is ${pct}% above its 30-day moving average with trend strength at ${trendStrength}/100, confirming sustained buyer control.`;
  } else if (trendDirection === 'Bearish') {
    return `[TREND] Trend is bearish — price is ${pct}% below its 30-day moving average with trend strength at ${trendStrength}/100, indicating persistent seller pressure.`;
  } else {
    return `[TREND] Trend is range-bound with no clear directional conviction (strength: ${trendStrength}/100). The market is in equilibrium between buyers and sellers.`;
  }
}

function buildMomentumBlock(momentumResult) {
  if (!momentumResult) return '';
  const { rsi, momDifference, relativeMomentum } = momentumResult;
  const rsiVal = rsi ? rsi.toFixed(1) : '50.0';
  const momPct = momDifference ? (Math.abs(momDifference) * 100).toFixed(1) : '0.0';

  let rsiContext = '';
  if (rsi > 70) {
    rsiContext = `RSI at ${rsiVal} is approaching overbought territory — momentum is strong but may face short-term resistance.`;
  } else if (rsi < 30) {
    rsiContext = `RSI at ${rsiVal} is in oversold territory — selling pressure may be exhausted with potential for a rebound.`;
  } else {
    rsiContext = `RSI at ${rsiVal} sits in a neutral zone with room to develop in either direction.`;
  }

  const relContext = momDifference > 0.05
    ? `Relative momentum is outperforming the market basket by ${momPct}% over the last 14 days.`
    : momDifference < -0.05
    ? `Relative momentum is lagging the market basket by ${momPct}% over the last 14 days.`
    : `Relative momentum is tracking the market average closely.`;

  return `[MOMENTUM] ${rsiContext} ${relContext}`;
}

function buildVolumeBlock(volumeResult) {
  if (!volumeResult) return '';
  const { volumeRatio, volumeConfirmation } = volumeResult;
  const pct = volumeRatio ? ((volumeRatio - 1) * 100).toFixed(1) : '0.0';

  if (volumeRatio > 1.25) {
    return `[VOLUME] Volume is ${Math.abs(parseFloat(pct)).toFixed(1)}% above the 30-day average — strong capital participation confirms the price move. Confidence Score supported by high-conviction volume.`;
  } else if (volumeRatio < 0.75) {
    return `[VOLUME] Volume is ${Math.abs(parseFloat(pct)).toFixed(1)}% below the 30-day average — low participation raises questions about the sustainability of any price move. Treat any setup with caution.`;
  } else {
    return `[VOLUME] Volume is near historical averages (ratio: ${volumeRatio ? volumeRatio.toFixed(2) : '1.00'}x), indicating stable but not exceptional market participation.`;
  }
}

function buildStructureBlock(structureResult, tradePlan) {
  if (!structureResult) return '';
  const { supportLevels, resistanceLevels } = structureResult;
  const S1 = supportLevels?.[0];
  const R1 = resistanceLevels?.[0];

  const formatPrice = (p) => {
    if (!p) return 'N/A';
    return p >= 100 ? `$${p.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : `$${p.toFixed(4)}`;
  };

  return `[STRUCTURE] Key support is established at ${formatPrice(S1)} and primary resistance lies at ${formatPrice(R1)}. ${tradePlan?.suggestedStopLoss ? `Stop loss placed at ${formatPrice(tradePlan.suggestedStopLoss)}, below structural support.` : ''}`;
}

function buildRiskBlock(riskAssessment, tradePlan) {
  if (!riskAssessment) return '';
  const { riskContext, riskScore, isVetoed } = riskAssessment;

  const slContext = tradePlan?.suggestedStopLoss
    ? ` This trade is invalidated if price closes below the stop loss level.`
    : '';

  if (isVetoed) {
    return `[RISK] ${riskContext} No active trade is recommended under current risk conditions.`;
  }

  return `[RISK] ${riskContext}${slContext}`;
}

function buildSignalBlock(direction, opportunityScore, confidenceScore, symbol, allOpportunities) {
  // Rank this asset vs others
  const ranked = [...allOpportunities]
    .filter(o => o.symbol !== symbol)
    .sort((a, b) => b.opportunityScore - a.opportunityScore);
  const betterCount = ranked.filter(o => o.opportunityScore > opportunityScore).length;

  let rankContext = '';
  if (ranked.length > 0) {
    if (betterCount === 0) {
      rankContext = `${symbol} ranks highest among all scanned assets.`;
    } else {
      rankContext = `${symbol} ranks ${betterCount + 1} of ${allOpportunities.length} scanned assets by Opportunity Score.`;
    }
  }

  let directionContext = '';
  if (direction === 'LONG') {
    directionContext = `All primary conditions satisfied for a LONG entry.`;
  } else if (direction === 'SHORT') {
    directionContext = `All primary conditions satisfied for a SHORT entry.`;
  } else if (direction === 'WAIT') {
    directionContext = `Setup is forming but not yet confirmed. Wait for cleaner conditions before entry.`;
  } else {
    directionContext = `No active trade setup detected. Araiven recommends monitoring this asset.`;
  }

  return `[SIGNAL] ${directionContext} ${rankContext} Opportunity Score: ${opportunityScore}/100. Confidence: ${confidenceScore}%.`;
}
