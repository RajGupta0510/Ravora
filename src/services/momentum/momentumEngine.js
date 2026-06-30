import { calculateRSI, calculateSMA } from '../../utils/mathUtils.js';
import { calculateEMA } from '../trend/trendEngine.js';

/**
 * Calculates the Rate of Change (ROC) over a given period
 * ROC = ((Close_t - Close_{t-n}) / Close_{t-n}) * 100
 */
export function calculateROC(closePrices, period = 14) {
  if (!closePrices || closePrices.length <= period) return 0;
  const current = closePrices[closePrices.length - 1];
  const historical = closePrices[closePrices.length - 1 - period];
  if (historical === 0) return 0;
  return ((current - historical) / historical) * 100;
}

/**
 * Calculates the Moving Average Convergence Divergence (MACD)
 * MACD Line = 12 EMA - 26 EMA
 * Signal Line = 9 EMA of MACD Line
 * Histogram = MACD Line - Signal Line
 */
export function calculateMACD(closePrices) {
  if (!closePrices || closePrices.length < 35) {
    return { macdLine: 0, signalLine: 0, histogram: 0, isBullishCross: false, isRising: false };
  }

  // 1. Calculate 12 and 26 EMA for all historical points
  const ema12History = [];
  const ema26History = [];
  
  // Calculate rolling EMAs
  let ema12 = calculateSMA(closePrices.slice(0, 12), 12);
  let ema26 = calculateSMA(closePrices.slice(0, 26), 26);
  
  const k12 = 2 / (12 + 1);
  const k26 = 2 / (26 + 1);

  for (let i = 0; i < closePrices.length; i++) {
    if (i >= 12) {
      ema12 = closePrices[i] * k12 + ema12 * (1 - k12);
    }
    if (i >= 26) {
      ema26 = closePrices[i] * k26 + ema26 * (1 - k26);
    }
    ema12History.push(ema12);
    ema26History.push(ema26);
  }

  // 2. Calculate MACD Line (12 EMA - 26 EMA) history
  const macdLineHistory = [];
  for (let i = 26; i < closePrices.length; i++) {
    macdLineHistory.push(ema12History[i] - ema26History[i]);
  }

  if (macdLineHistory.length < 9) {
    return { macdLine: 0, signalLine: 0, histogram: 0, isBullishCross: false, isRising: false };
  }

  // 3. Calculate Signal Line (9 EMA of MACD Line)
  let signalLine = calculateSMA(macdLineHistory.slice(0, 9), 9);
  const k9 = 2 / (9 + 1);
  const signalLineHistory = [signalLine];

  for (let i = 9; i < macdLineHistory.length; i++) {
    signalLine = macdLineHistory[i] * k9 + signalLine * (1 - k9);
    signalLineHistory.push(signalLine);
  }

  const currentMacd = macdLineHistory[macdLineHistory.length - 1];
  const currentSignal = signalLineHistory[signalLineHistory.length - 1];
  const currentHistogram = currentMacd - currentSignal;

  const prevMacd = macdLineHistory[macdLineHistory.length - 2];
  const prevSignal = signalLineHistory[signalLineHistory.length - 2];
  const prevHistogram = prevMacd - prevSignal;

  const isBullishCross = currentMacd > currentSignal && prevMacd <= prevSignal;
  const isRising = currentHistogram > prevHistogram;

  return {
    macdLine: currentMacd,
    signalLine: currentSignal,
    histogram: currentHistogram,
    isBullishCross,
    isRising
  };
}

export const MomentumEngine = {
  /**
   * Analyzes an asset's price momentum using RSI, MACD, and ROC.
   * 
   * @param {number} currentPrice - Live market price
   * @param {Array} history - Historical OHLCV [{open, high, low, close, volume, timestamp}]
   * @returns {Object} Momentum analysis result
   */
  analyzeMomentum(currentPrice, history) {
    if (!history || history.length < 30) {
      return {
        momentumScore: 50,
        momentumDirection: 'Neutral',
        rsi: 50,
        roc14: 0.0,
        explanation: 'Insufficient price history to compute momentum analysis. Minimum 30 days required.',
        macd: { macdLine: 0, signalLine: 0, histogram: 0 }
      };
    }

    const closePrices = history.map(h => h.close);

    // 1. Calculate RSI-14
    const rsi = calculateRSI(closePrices, 14);

    // 2. Calculate ROC-14 (Rate of Change)
    const roc14 = calculateROC(closePrices, 14);

    // 3. Calculate MACD (12, 26, 9)
    const macd = calculateMACD(closePrices);

    // 4. Determine Momentum Direction
    let momentumDirection = 'Neutral';
    if (macd.histogram > 0 && macd.isRising && rsi > 50 && roc14 > 1.5) {
      momentumDirection = 'Strengthening';
    } else if (macd.histogram < 0 && !macd.isRising && rsi < 50 && roc14 < -1.5) {
      momentumDirection = 'Weakening';
    } else if (rsi > 60 && macd.histogram > 0) {
      momentumDirection = 'Strengthening';
    } else if (rsi < 40 && macd.histogram < 0) {
      momentumDirection = 'Weakening';
    } else {
      momentumDirection = 'Neutral';
    }

    // 5. Calculate Composite Momentum Score (0 - 100)
    // We map RSI (30% weight), MACD histogram alignment (40%), and ROC-14 (30%)
    let score = 50;

    // RSI component (centered at 50, maps 0-100 to -25 to +25 score impact)
    const rsiContribution = (rsi - 50) * 0.6; // Max +/- 30

    // MACD component
    let macdContribution = 0;
    if (macd.histogram > 0) {
      macdContribution += 15; // Above zero is bullish
      if (macd.isRising) macdContribution += 10; // Accelerating bullish
    } else {
      macdContribution -= 15; // Below zero is bearish
      if (!macd.isRising) macdContribution -= 10; // Accelerating bearish
    }

    // ROC component
    let rocContribution = 0;
    // Map ROC-14 up to +/- 15% to a max score impact of +/- 20
    rocContribution = Math.max(-20, Math.min(20, roc14 * 1.33));

    // Combine contributions
    score = Math.round(50 + rsiContribution + macdContribution + rocContribution);
    score = Math.max(5, Math.min(95, score));

    // 6. Generate structured explanation
    const explanation = generateExplanation(
      momentumDirection,
      score,
      rsi,
      roc14,
      macd
    );

    return {
      momentumScore: score,
      momentumDirection,
      rsi,
      roc14,
      macd,
      explanation
    };
  }
};

/**
 * Generates a dynamic explanation of momentum based on quantitative evidence.
 */
function generateExplanation(direction, score, rsi, roc14, macd) {
  const parts = [];

  if (direction === 'Strengthening') {
    parts.push(`Momentum is strengthening (Score: ${score}/100).`);
    
    if (rsi > 70) {
      parts.push(`RSI is at an overextended ${rsi.toFixed(1)}, suggesting strong buying pressure that is entering overbought territory.`);
    } else {
      parts.push(`RSI is at a bullish ${rsi.toFixed(1)}, indicating healthy upward expansion.`);
    }

    if (macd.histogram > 0) {
      parts.push(`The MACD line is above the signal line with a positive histogram of ${macd.histogram.toFixed(4)}, confirming bullish acceleration.`);
    }

    if (roc14 > 0) {
      parts.push(`Price has advanced by ${roc14.toFixed(1)}% over the last 14 days, demonstrating strong velocity.`);
    }
  } else if (direction === 'Weakening') {
    parts.push(`Momentum is weakening (Score: ${score}/100).`);

    if (rsi < 30) {
      parts.push(`RSI is at an oversold ${rsi.toFixed(1)}, indicating heavy liquidations and potential downside exhaustion.`);
    } else {
      parts.push(`RSI is at a bearish ${rsi.toFixed(1)}, showing a lack of buyer support.`);
    }

    if (macd.histogram < 0) {
      parts.push(`MACD shows a bearish crossover with a negative histogram of ${macd.histogram.toFixed(4)}, confirming selling pressure.`);
    }

    if (roc14 < 0) {
      parts.push(`Price has declined by ${Math.abs(roc14).toFixed(1)}% over the last 14 days, indicating downward velocity.`);
    }
  } else {
    parts.push(`Momentum is currently neutral and consolidating (Score: ${score}/100).`);

    parts.push(`RSI is hovering at a neutral ${rsi.toFixed(1)}.`);

    if (Math.abs(macd.histogram) < 0.05) {
      parts.push("The MACD and signal lines are tightly coiled, indicating a squeeze and potential breakout phase.");
    } else {
      parts.push(`MACD histogram is flat at ${macd.histogram.toFixed(4)}, showing no strong directional velocity.`);
    }
  }

  return parts.join(' ');
}
