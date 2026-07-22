/**
 * Rule-Based Decision Review Engine
 * Generates structured, educational reviews for virtual trades without external LLM dependencies.
 * Analyzes indicators, risk limits, and entry/exit parameters deterministically.
 */

export const RuleBasedReviewEngine = {
  /**
   * Generates a complete trade review
   * @param {object} trade
   * @param {string} trade.symbol
   * @param {string} trade.side - 'buy' | 'sell'
   * @param {number} trade.price - entry price
   * @param {number} trade.exitPrice - exit price
   * @param {number} trade.pnl - net profit/loss
   * @param {number} trade.quantity - size
   * @param {number} [trade.leverage=1.0]
   * @param {number} [trade.stopLoss]
   * @param {number} [trade.takeProfit]
   * @param {object} [indicators] - optional live indicators
   */
  generateReview(trade, indicators = {}) {
    const { symbol, side, price, exitPrice, pnl, quantity, leverage = 1.0, stopLoss, takeProfit } = trade;

    // Default indicators if not passed
    const rsi = parseFloat(indicators.rsi || 50.0);
    const trend = indicators.trend || 'neutral'; // 'bullish' | 'bearish' | 'neutral'

    const tradePnlPct = (pnl / (price * quantity)) * 100;
    const isWin = pnl >= 0;

    // 1. Entry Quality Audit
    let entryQuality = 70;
    let entryReason = "Entered during neutral market conditions.";
    
    if (side === 'buy') {
      if (rsi <= 35) {
        entryQuality = 90;
        entryReason = "Highly opportunistic entry in oversold territory (RSI under 35). High probability of reversal.";
      } else if (rsi >= 70) {
        entryQuality = 40;
        entryReason = "Low-quality entry in overbought territory (RSI over 70). High risk of immediate correction.";
      } else if (trend === 'bullish') {
        entryQuality = 80;
        entryReason = "Solid trend-following entry. Price moving with strong bullish momentum.";
      }
    } else { // sell/short
      if (rsi >= 65) {
        entryQuality = 88;
        entryReason = "Strong entry in overbought territory (RSI over 65) for a short position.";
      } else if (rsi <= 30) {
        entryQuality = 35;
        entryReason = "Weak entry for a short. Asset is heavily oversold (RSI under 30) and ripe for a bounce.";
      }
    }

    // 2. Exit Quality Audit
    let exitQuality = 70;
    let exitReason = "Position closed manually.";
    
    if (isWin) {
      if (tradePnlPct >= 5) {
        exitQuality = 90;
        exitReason = "High-quality exit. Trailing profit targets or market conditions captured optimal range expansion.";
      } else {
        exitQuality = 80;
        exitReason = "Profitable exit. Locked in returns before potential reversal.";
      }
    } else {
      if (Math.abs(tradePnlPct) >= 5) {
        exitQuality = 35;
        exitReason = "Low-quality exit. Allowed trade to run deep into a loss before terminating.";
      } else {
        exitQuality = 75;
        exitReason = "Disciplined risk mitigation. Terminated position quickly when the trade thesis failed.";
      }
    }

    // 3. Risk Management & Position Sizing
    const tradeCost = price * quantity;
    const margin = tradeCost / leverage;
    
    let positionSizingReview = "Perfect position size. Leverage is within safe limits (under 5x).";
    let isSizingSafe = true;

    if (leverage > 10) {
      positionSizingReview = "High leverage warning. Virtual leverage exceeds 10x, exposing the account to rapid liquidation risks.";
      isSizingSafe = false;
    } else if (margin > 15000) {
      positionSizingReview = "High exposure warning. Margin allocated exceeds 15% of virtual account. Limit single allocations to 5-10%.";
      isSizingSafe = false;
    }

    // SL/TP placement
    let sltpReview = "Excellent trade execution parameters. Defined Stop Loss and Take Profit levels protect the virtual account.";
    let hasProtection = true;

    if (!stopLoss && !takeProfit) {
      sltpReview = "High risk configuration. Entering positions without defined SL/TP limits exposes you to unmitigated downside volatility.";
      hasProtection = false;
    } else if (!stopLoss) {
      sltpReview = "Missing Stop Loss. Set a Stop Loss to bound potential downside risk automatically.";
      hasProtection = false;
    }

    // 4. Portfolio Impact & Suggested Improvements
    const portfolioImpact = pnl > 0 
      ? `Captured positive P&L of +$${pnl.toFixed(2)} (+${tradePnlPct.toFixed(2)}%).`
      : `Realized virtual drawdown of -$${Math.abs(pnl).toFixed(2)} (${tradePnlPct.toFixed(2)}%).`;

    const improvements = [];
    if (!hasProtection) {
      improvements.push("Always attach a Stop Loss (e.g. 2-3% below entry) to define your invalidation level before placing orders.");
    }
    if (!isSizingSafe) {
      improvements.push("Keep leverage below 5x and single asset allocations below 10% to survive drawdowns.");
    }
    if (side === 'buy' && rsi > 60) {
      improvements.push("Avoid buying assets that have run up high in RSI. Wait for a pullback to support or Bollinger Band mean-reversion.");
    }
    if (improvements.length === 0) {
      improvements.push("Maintain current discipline. Continue tracking trends, and scaling out at defined take-profit zones.");
    }

    // 5. Confidence Score
    let confidenceScore = 50;
    confidenceScore += (entryQuality - 50) * 0.5;
    confidenceScore += (exitQuality - 50) * 0.3;
    if (hasProtection) confidenceScore += 10;
    if (isSizingSafe) confidenceScore += 10;
    confidenceScore = Math.max(10, Math.min(100, confidenceScore));

    return {
      verdict: isWin ? "approve" : "warn",
      entryQuality,
      exitQuality,
      riskRewardRatio: stopLoss && takeProfit ? `1:${((takeProfit - price) / Math.max(0.01, price - stopLoss)).toFixed(1)}` : "1:2.0",
      suggestedStopLoss: stopLoss || price * 0.97,
      suggestedTakeProfit: takeProfit || price * 1.06,
      reasoning: `Trade review for ${symbol.toUpperCase()}: Entry quality is ${entryQuality}/100 (${entryReason}). Exit quality is ${exitQuality}/100 (${exitReason}).`,
      confidenceScore: Math.round(confidenceScore),
      riskLevel: isSizingSafe ? "low" : "high",
      assumptions: `Market indicators at entry: RSI was ${Math.round(rsi)}. Long trend bias was ${trend}.`,
      alternativeScenario: side === 'buy' 
        ? "If support levels hold, expect target take-profit zones. If support breaks, look to re-enter near previous liquidity blocks."
        : "If rejection holds, targets are likely. If range breakouts occur, cut losses immediately.",
      educationalExplanation: `This ${side} trade had a ${isWin ? 'successful' : 'unsuccessful'} outcome. Technical context: ${sltpReview} ${positionSizingReview} ${portfolioImpact}`,
      suggestedImprovements: improvements
    };
  }
};
