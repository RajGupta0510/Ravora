import { BaseAnalyzer } from './baseAnalyzer.js';

export class PriceActionAnalyzer extends BaseAnalyzer {
  constructor() {
    super('PriceAction');
  }

  analyze(ticker, assetDetails, allTickers = []) {
    const history = assetDetails.history || [];
    const patterns = [];
    const reasoning = [];

    if (history.length < 3) {
      return { patterns, reasoning: ['Insufficient historical candles to perform price action analysis.'] };
    }
    
    // Check the last 3 candles in daily history
    const last3 = history.slice(-3);
    const currentCandle = last3[2];
    const prevCandle = last3[1];

    const body = Math.abs(currentCandle.close - currentCandle.open);
    const candleRange = currentCandle.high - currentCandle.low;
    const bodyMax = Math.max(currentCandle.open, currentCandle.close);
    const bodyMin = Math.min(currentCandle.open, currentCandle.close);
    const upperWick = currentCandle.high - bodyMax;
    const lowerWick = bodyMin - currentCandle.low;
    const isBullish = currentCandle.close >= currentCandle.open;

    // Doji
    if (candleRange > 0 && body / candleRange < 0.1) {
      patterns.push('Doji');
      reasoning.push('A Doji candlestick has formed, signaling market indecision and a potential trend pivot.');
    }

    // Hammer
    if (body > 0 && lowerWick >= 2 * body && upperWick < 0.2 * body) {
      patterns.push('Hammer');
      reasoning.push('A Hammer candlestick has been detected near structural support, indicating bullish rejection of lower prices.');
    }

    // Shooting Star
    if (body > 0 && upperWick >= 2 * body && lowerWick < 0.2 * body) {
      patterns.push('Shooting Star');
      reasoning.push('A Shooting Star candlestick has formed near resistance, signaling bearish exhaustion.');
    }

    // Engulfing (current body completely engulfs previous body)
    const prevBody = Math.abs(prevCandle.close - prevCandle.open);
    const prevIsBullish = prevCandle.close >= prevCandle.open;
    const prevBodyMax = Math.max(prevCandle.open, prevCandle.close);
    const prevBodyMin = Math.min(prevCandle.open, prevCandle.close);

    if (body > prevBody && bodyMax > prevBodyMax && bodyMin < prevBodyMin) {
      if (isBullish && !prevIsBullish) {
        patterns.push('Bullish Engulfing');
        reasoning.push('A Bullish Engulfing pattern has formed, indicating strong buying momentum overcoming previous seller dominance.');
      } else if (!isBullish && prevIsBullish) {
        patterns.push('Bearish Engulfing');
        reasoning.push('A Bearish Engulfing pattern suggests active selling pressure and a short-term trend reversal.');
      }
    }

    if (patterns.length === 0) {
      reasoning.push('Price action shows standard candle consolidation within structural parameters.');
    }

    return {
      patterns,
      reasoning
    };
  }
}
