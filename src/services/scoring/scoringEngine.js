import {
  calculateSMA,
  calculateDailyReturns,
  calculateAnnualizedVolatility,
  calculatePercentageChange
} from '../../utils/mathUtils.js';

export const ScoringEngine = {
  /**
   * Evaluates a target asset against the market and calculates quantitative scores
   * @param {Object} ticker - Standardized ticker information
   * @param {Object} assetDetails - Standardized asset details containing history
   * @param {Array<Object>} allTickers - Latest tickers of all assets (for relative calculations)
   * @returns {Object} Calculated scores and explainability details
   */
  calculateAssetScores(ticker, assetDetails, allTickers = []) {
    const history = assetDetails.history || [];
    const closePrices = history.map(h => h.close);
    const currentPrice = ticker.price;

    // 1. Trend Strength (0-100)
    const sma30 = calculateSMA(closePrices, 30) || currentPrice;
    const sma7 = calculateSMA(closePrices, 7) || currentPrice;
    const trendDeviation = sma30 > 0 ? (currentPrice - sma30) / sma30 : 0.0;
    const shortTermDeviation = sma30 > 0 ? (sma7 - sma30) / sma30 : 0.0;
    
    let trendStrength = 50 + Math.round(trendDeviation * 200) + Math.round(shortTermDeviation * 100);
    trendStrength = Math.max(10, Math.min(95, trendStrength));

    // 2. Volatility (0-100)
    const annVol = calculateAnnualizedVolatility(closePrices);
    let volatilityScore = Math.round(annVol * 100 * 0.65); // Scale annualized volatility
    volatilityScore = Math.max(15, Math.min(90, volatilityScore));

    // 3. Relative Momentum (0-100)
    const change14 = calculatePercentageChange(closePrices, 14);
    let avgChange14 = 0.0;
    if (allTickers && allTickers.length > 0) {
      const changes = allTickers.map(t => t.change24h / 100);
      avgChange14 = changes.reduce((a, b) => a + b, 0) / changes.length;
    }
    
    const momDifference = change14 - (avgChange14 * 14); 
    let relativeMomentum = 50 + Math.round(momDifference * 150);
    relativeMomentum = Math.max(15, Math.min(95, relativeMomentum));

    // 4. Volume Confirmation (0-100)
    const historicalVolumes = history.map(h => h.volume).filter(v => v > 0);
    const avgVolume30 = calculateSMA(historicalVolumes, 30) || ticker.volume24h;
    const volumeRatio = avgVolume30 > 0 ? (ticker.volume24h / avgVolume30) : 1.0;

    let volumeConfirmation = 50 + Math.round((volumeRatio - 1.0) * 35);
    volumeConfirmation = Math.max(15, Math.min(95, volumeConfirmation));

    // 5. Final Composite Scores
    const opportunityScore = Math.round((trendStrength * 0.4) + (relativeMomentum * 0.4) + (volumeConfirmation * 0.2));
    const riskScore = Math.round((volatilityScore * 0.6) + ((100 - trendStrength) * 0.4));
    const confidenceScore = Math.round((trendStrength * 0.4) + (volumeConfirmation * 0.4) + ((100 - volatilityScore) * 0.2));

    // 6. Support & Resistance (Local Extrema over past 30 days)
    const localMinima = [];
    const localMaxima = [];
    
    for (let i = 1; i < closePrices.length - 1; i++) {
      const prev = closePrices[i - 1];
      const curr = closePrices[i];
      const next = closePrices[i + 1];
      
      if (curr < prev && curr < next) {
        localMinima.push(curr);
      }
      if (curr > prev && curr > next) {
        localMaxima.push(curr);
      }
    }
    
    const supports = localMinima
      .filter(p => p <= currentPrice)
      .sort((a, b) => b - a); // closest below current price
      
    const resistances = localMaxima
      .filter(p => p >= currentPrice)
      .sort((a, b) => a - b); // closest above current price
      
    const S1 = supports[0] || (currentPrice * 0.95);
    const S2 = supports[1] || (S1 * 0.95);
    const R1 = resistances[0] || (currentPrice * 1.05);
    const R2 = resistances[1] || (R1 * 1.05);
    
    const supportLevels = [S1, S2];
    const resistanceLevels = [R1, R2];

    // 7. Trend Direction Classifier
    let trendDirection = 'Range';
    if (currentPrice > sma30 && sma7 > sma30) {
      trendDirection = 'Bullish';
    } else if (currentPrice < sma30 && sma7 < sma30) {
      trendDirection = 'Bearish';
    }

    // 8. Trade Setup Generator (Suggested Entry, SL, TP)
    let suggestedEntry = 0;
    let suggestedStopLoss = 0;
    let suggestedTakeProfit = 0;
    let expectedDuration = '3-5 days';
    
    if (annVol > 0.8) {
      expectedDuration = '1-2 days';
    } else if (annVol < 0.4) {
      expectedDuration = '7-10 days';
    }

    if (trendDirection === 'Bearish') {
      // Short Setup
      suggestedEntry = currentPrice * 1.005; // Entry at slight bounce
      suggestedStopLoss = R1 * 1.02; // Stop loss just above resistance
      suggestedTakeProfit = S1 * 0.99; // Take profit just below support
      
      if (suggestedStopLoss <= suggestedEntry) suggestedStopLoss = suggestedEntry * 1.03;
      if (suggestedTakeProfit >= suggestedEntry) suggestedTakeProfit = suggestedEntry * 0.92;
    } else {
      // Long Setup (default for Bullish and Range)
      suggestedEntry = currentPrice * 0.995; // Entry at slight pullback
      suggestedStopLoss = S1 * 0.98; // Stop loss just below support
      suggestedTakeProfit = R1 * 1.01; // Take profit just above resistance
      
      if (suggestedStopLoss >= suggestedEntry) suggestedStopLoss = suggestedEntry * 0.97;
      if (suggestedTakeProfit <= suggestedEntry) suggestedTakeProfit = suggestedEntry * 1.08;
    }

    let riskRewardRatio = '2.0:1';
    const riskDiff = Math.abs(suggestedEntry - suggestedStopLoss);
    const rewardDiff = Math.abs(suggestedTakeProfit - suggestedEntry);
    if (riskDiff > 0) {
      const rr = rewardDiff / riskDiff;
      riskRewardRatio = `${rr.toFixed(1)}:1`;
    }

    // 9. Explainability Reasoning Points
    const reasoning = [];

    if (currentPrice >= sma30) {
      reasoning.push(`Trend is bullish with the price sitting ${(trendDeviation * 100).toFixed(1)}% above its 30-day moving average.`);
    } else {
      reasoning.push(`Trend shows bearish pressure with the price trading ${Math.abs(trendDeviation * 100).toFixed(1)}% below its 30-day moving average.`);
    }

    if (annVol > 0.8) {
      reasoning.push(`Annualized volatility is high at ${(annVol * 100).toFixed(1)}%, signaling higher drawdown variance risk.`);
    } else if (annVol > 0.4) {
      reasoning.push(`Annualized volatility is moderate at ${(annVol * 100).toFixed(1)}%, maintaining stable risk-adjusted parameters.`);
    } else {
      reasoning.push(`Annualized volatility is low at ${(annVol * 100).toFixed(1)}%, providing a highly secure drawdown buffer.`);
    }

    if (volumeRatio > 1.25) {
      reasoning.push(`24h trading volume is ${(volumeRatio * 100 - 100).toFixed(1)}% above its 30-day historical average, confirming active capital inflows.`);
    } else if (volumeRatio < 0.75) {
      reasoning.push(`24h trading volume is ${Math.abs(volumeRatio * 100 - 100).toFixed(1)}% below its 30-day average, signaling low volume consolidation.`);
    } else {
      reasoning.push(`24h volume aligns with historical averages (ratio: ${volumeRatio.toFixed(2)}x), confirming stable market participation.`);
    }

    if (momDifference > 0.05) {
      reasoning.push(`Relative momentum is strong, outperforming the market baseline by ${(momDifference * 100).toFixed(1)}% over the last 14 days.`);
    } else if (momDifference < -0.05) {
      reasoning.push(`Relative momentum is lagging, underperforming the market baseline by ${Math.abs(momDifference * 100).toFixed(1)}% over 14 days.`);
    } else {
      reasoning.push(`Relative momentum remains neutral, tracking the market capitalization averages closely.`);
    }

    return {
      trendStrength,
      volatilityScore,
      relativeMomentum,
      volumeConfirmation,
      opportunityScore,
      riskScore,
      confidenceScore,
      reasoning,
      trendDirection,
      supportLevels,
      resistanceLevels,
      suggestedEntry,
      suggestedStopLoss,
      suggestedTakeProfit,
      riskRewardRatio,
      expectedDuration
    };
  }
};
