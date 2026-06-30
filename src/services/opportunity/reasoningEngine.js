/**
 * Araiven Reasoning Engine
 * 
 * Responsibility: Translate raw quantitative outputs (scores, directions, and indicators)
 * into a structured, human-readable, and highly transparent explanation object.
 * 
 * Answers:
 *   - Why this asset?
 *   - Why now?
 *   - What changed?
 *   - What are the risks?
 *   - What would invalidate this trade?
 * 
 * Framework ref: Araiven Intelligence Framework §7 — Explainability Standard
 */
export const ReasoningEngine = {
  /**
   * Generates a standardized, structured explanation object for an asset.
   * 
   * @param {Object} params
   * @param {string} params.symbol - Asset symbol (e.g. 'BTC')
   * @param {string} params.direction - Suggested direction (LONG / SHORT / HOLD / WAIT)
   * @param {number} params.opportunityScore - 0-100 score
   * @param {number} params.confidenceScore - 0-100 score
   * @param {Object} params.trendResult - { trendDirection, trendStrength, trendDeviation, explanation }
   * @param {Object} params.momentumResult - { rsi, relativeMomentum, momDifference }
   * @param {Object} params.volumeResult - { volumeRatio, volumeConfirmation }
   * @param {Object} params.volatilityResult - { annualizedVolatility, volatilityScore }
   * @param {Object} params.riskAssessment - { riskScore, riskLevel, isVetoed, riskContext }
   * @param {Object} params.tradePlan - { suggestedEntry, suggestedStopLoss, suggestedTakeProfit, riskRewardRatio, expectedDuration }
   * @returns {Object} Standardized explanation object
   */
  generateStructuredExplanation(params) {
    const {
      symbol,
      direction,
      opportunityScore,
      confidenceScore,
      trendResult = {},
      momentumResult = {},
      volumeResult = {},
      volatilityResult = {},
      riskAssessment = {},
      tradePlan = {}
    } = params;

    const formattedPrice = (p) => {
      if (!p) return 'N/A';
      return p >= 100 ? `$${p.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : `$${p.toFixed(4)}`;
    };

    // 1. Summary
    let summary = '';
    if (direction === 'LONG') {
      summary = `Araiven has detected a high-probability bullish continuation setup for ${symbol} with an Opportunity Score of ${opportunityScore}/100 and ${confidenceScore}% confidence.`;
    } else if (direction === 'SHORT') {
      summary = `Araiven has detected a high-conviction bearish breakdown setup for ${symbol} with a short bias score of ${100 - opportunityScore}/100 and ${confidenceScore}% confidence.`;
    } else if (direction === 'WAIT') {
      summary = `A potential setup is forming for ${symbol}, but current risk parameters or incomplete confirmations require a temporary neutral stance.`;
    } else {
      summary = `${symbol} is currently consolidating in a range with no clear directional bias. Araiven recommends monitoring key support and resistance levels.`;
    }

    // 2. Why this opportunity exists (Why this asset? What changed?)
    let whyThisAsset = '';
    const trendText = trendResult.trendDirection === 'Bullish' ? 'bullish trend alignment' : (trendResult.trendDirection === 'Bearish' ? 'bearish trend pressure' : 'sideways consolidation');
    const momText = momentumResult.relativeMomentum > 60 ? 'outperforming momentum' : (momentumResult.relativeMomentum < 40 ? 'lagging momentum' : 'stable momentum');
    const volText = volumeResult.volumeConfirmation > 60 ? 'elevated trading volume' : 'normal trading volume';

    whyThisAsset = `The opportunity is driven by a confluence of ${trendText}, ${momText}, and ${volText}. `;
    if (trendResult.explanation) {
      whyThisAsset += trendResult.explanation + " ";
    }
    if (momentumResult.explanation) {
      whyThisAsset += momentumResult.explanation + " ";
    }
    if (structureResult.explanation) {
      whyThisAsset += structureResult.explanation;
    }

    // 3. Why now?
    let whyNow = '';
    if (direction === 'LONG') {
      if (momentumResult.rsi < 40) {
        whyNow = `RSI at ${momentumResult.rsi?.toFixed(1)} indicates oversold exhaustion near structural support, presenting an asymmetric risk-reward entry point before buyers reclaim control.`;
      } else if (volumeResult.volumeRatio > 1.25) {
        whyNow = `A recent ${((volumeResult.volumeRatio - 1) * 100).toFixed(1)}% spike in 24h trading volume confirms active capital participation and breakout momentum.`;
      } else {
        whyNow = `Price is stabilizing within the calculated accumulation zone near support, offering a high-probability entry before the next expansion phase.`;
      }
    } else if (direction === 'SHORT') {
      if (momentumResult.rsi > 70) {
        whyNow = `RSI at ${momentumResult.rsi?.toFixed(1)} indicates overbought exhaustion near key resistance, signaling high probability of a mean-reversion pullback.`;
      } else if (volumeResult.volumeRatio > 1.25) {
        whyNow = `A volume-backed breakdown below key moving averages indicates that sellers are aggressively dominating the orderbook.`;
      } else {
        whyNow = `Price is testing local resistance with declining buy volume, presenting an optimal entry for a short position.`;
      }
    } else if (direction === 'WAIT') {
      whyNow = `We are waiting for additional volume confirmation or for the price to pull back to the designated entry zone to satisfy our minimum 1.5:1 Risk/Reward requirement.`;
    } else {
      whyNow = `High-timeframe indicators are conflicting, and volatility remains within neutral bounds. There is no immediate edge to justify deploying capital.`;
    }

    const supportingEvidence = [];
    if (trendResult.trendStrength) {
      supportingEvidence.push(`Trend Strength is scored at ${trendResult.trendStrength}/100, indicating a ${trendResult.trendDirection.toLowerCase()} market phase.`);
    }
    if (momentumResult.rsi) {
      supportingEvidence.push(`Relative Strength Index (RSI) is at ${momentumResult.rsi.toFixed(1)}, supporting a ${direction === 'LONG' ? 'bullish accumulation' : 'neutral'} structure.`);
    }
    if (volumeResult.volumeRatio) {
      supportingEvidence.push(`24h trading volume ratio is running at ${volumeResult.volumeRatio.toFixed(2)}x of the 30-day historical average.`);
    }
    if (structureResult.bias) {
      supportingEvidence.push(`Market Structure is classified as ${structureResult.bias} with a strength rating of ${structureResult.strength}/100.`);
    }
    if (tradePlan.riskRewardRatio && tradePlan.riskRewardRatio !== 'N/A') {
      supportingEvidence.push(`The trade plan yields a favorable Risk/Reward ratio of ${tradePlan.riskRewardRatio} with a Quality rating of '${tradePlan.tradeQuality || 'B'}'.`);
    }

    // 5. Potential Risks
    let potentialRisks = '';
    if (riskAssessment.riskContext) {
      potentialRisks = riskAssessment.riskContext;
    } else {
      potentialRisks = `Risk is classified as ${riskAssessment.riskLevel || 'medium'} (score: ${riskAssessment.riskScore || 40}/100).`;
    }

    if (volatilityResult.annualizedVolatility > 0.8) {
      potentialRisks += ` Annualized volatility is extremely high at ${(volatilityResult.annualizedVolatility * 100).toFixed(1)}%, increasing the probability of wide price swings and potential stop-loss hunts.`;
    }

    // 6. Invalidation Trigger
    let invalidationTrigger = '';
    if (direction === 'LONG' && tradePlan.suggestedStopLoss > 0) {
      invalidationTrigger = `A daily candle close below the stop-loss level of ${formattedPrice(tradePlan.suggestedStopLoss)} invalidates the bullish thesis. This level lies below key structural support.`;
    } else if (direction === 'SHORT' && tradePlan.suggestedStopLoss > 0) {
      invalidationTrigger = `A daily candle close above the stop-loss level of ${formattedPrice(tradePlan.suggestedStopLoss)} invalidates the bearish thesis, indicating a breakout above resistance.`;
    } else {
      invalidationTrigger = `Extreme macro events, a spike in volatility (score >= 88), or a trend reversal (EMA50 crossing EMA200) will invalidate the current neutral stance.`;
    }

    // 7. Suggested Action
    let suggestedAction = '';
    if (direction === 'LONG') {
      suggestedAction = `Deploy capital in the designated Entry Zone around ${formattedPrice(tradePlan.suggestedEntry)}, targeting Take Profit at ${formattedPrice(tradePlan.suggestedTakeProfit)} with a strict stop-loss at ${formattedPrice(tradePlan.suggestedStopLoss)}.`;
    } else if (direction === 'SHORT') {
      suggestedAction = `Deploy a short position in the Entry Zone around ${formattedPrice(tradePlan.suggestedEntry)}, targeting Take Profit at ${formattedPrice(tradePlan.suggestedTakeProfit)} with a stop-loss at ${formattedPrice(tradePlan.suggestedStopLoss)}.`;
    } else {
      suggestedAction = `Do not deploy new capital. Maintain current holdings and wait for a clear structural breakout or a pullback to valid entry parameters.`;
    }

    return {
      summary,
      whyThisAsset,
      whyNow,
      supportingEvidence,
      potentialRisks,
      invalidationTrigger,
      suggestedAction,
      tradePlan: {
        entry: tradePlan.suggestedEntry || 0,
        stopLoss: tradePlan.suggestedStopLoss || 0,
        takeProfit: tradePlan.suggestedTakeProfit || 0,
        riskReward: tradePlan.riskRewardRatio || 'N/A',
        holdingPeriod: tradePlan.expectedDuration || 'N/A'
      }
    };
  }
};
