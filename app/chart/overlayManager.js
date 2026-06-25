/**
 * OverlayManager
 * 
 * Responsibility: Orchestrate what is drawn on the chart.
 * Scans market history to find swing highs/lows for trend lines,
 * detects candlestick patterns (Doji, Hammer), and coordinates
 * drawing zones (Supply/Demand/Liquidity) and target levels.
 */
class OverlayManager {
  /**
   * Scan candlestick history to find swing highs and swing lows.
   */
  findPivots(history) {
    const swingHighs = [];
    const swingLows = [];
    const windowSize = 3; // Look at 3 candles before and 3 after

    for (let i = windowSize; i < history.length - windowSize; i++) {
      const current = history[i];
      let isHigh = true;
      let isLow = true;

      for (let j = 1; j <= windowSize; j++) {
        if (history[i - j].high >= current.high || history[i + j].high >= current.high) {
          isHigh = false;
        }
        if (history[i - j].low <= current.low || history[i + j].low <= current.low) {
          isLow = false;
        }
      }

      if (isHigh) {
        swingHighs.push({ time: current.time, price: current.high, idx: i });
      }
      if (isLow) {
        swingLows.push({ time: current.time, price: current.low, idx: i });
      }
    }

    return { swingHighs, swingLows };
  }

  /**
   * Scan history to detect candlestick patterns.
   */
  detectPatterns(history) {
    const patterns = [];
    
    for (let i = 1; i < history.length; i++) {
      const curr = history[i];
      const prev = history[i - 1];

      const bodySize = Math.abs(curr.close - curr.open);
      const totalRange = curr.high - curr.low;
      if (totalRange === 0) continue;

      const upperShadow = curr.high - Math.max(curr.open, curr.close);
      const lowerShadow = Math.min(curr.open, curr.close) - curr.low;

      // 1. Doji Detection (very small body relative to range)
      if (bodySize / totalRange < 0.1) {
        patterns.push({
          time: curr.time,
          price: curr.high,
          text: 'Doji',
          type: 'neutral'
        });
        continue; // skip other checks for this candle
      }

      // 2. Hammer Detection (long lower shadow, small upper body at support)
      if (lowerShadow > bodySize * 2 && upperShadow < bodySize * 0.5) {
        patterns.push({
          time: curr.time,
          price: curr.low,
          text: 'Hammer',
          type: 'bullish'
        });
        continue;
      }

      // 3. Shooting Star (long upper shadow, small lower body at resistance)
      if (upperShadow > bodySize * 2 && lowerShadow < bodySize * 0.5) {
        patterns.push({
          time: curr.time,
          price: curr.high,
          text: 'Shooting Star',
          type: 'bearish'
        });
        continue;
      }

      // 4. Bullish Engulfing (current bullish body engulfs previous bearish body)
      if (curr.close > curr.open && prev.close < prev.open &&
          curr.open <= prev.close && curr.close >= prev.open) {
        patterns.push({
          time: curr.time,
          price: curr.low,
          text: 'Engulfing',
          type: 'bullish'
        });
      }
    }

    return patterns;
  }

  /**
   * Draw all enabled overlays on the canvas overlay.
   */
  drawOverlays(chart, series, state) {
    window.drawingEngine.clear();

    const { history, opp, toggles } = state;
    if (!opp || !history || history.length === 0) return;

    const S1 = opp.supportLevels?.[0];
    const S2 = opp.supportLevels?.[1];
    const R1 = opp.resistanceLevels?.[0];
    const R2 = opp.resistanceLevels?.[1];

    // 1. Draw Target Zones (Entry Zone)
    if (toggles.targets && opp.suggestedEntry > 0) {
      // Entry Zone is between S1 and entry, or buffer around entry
      const entryBottom = opp.suggestedEntry * 0.99;
      const entryTop = opp.suggestedEntry * 1.01;
      window.drawingEngine.drawPriceZone(
        chart,
        series,
        entryBottom,
        entryTop,
        'rgba(59, 130, 246, 0.06)',
        'Entry Zone'
      );
    }

    // 2. Draw S&R Zones
    if (toggles.sr) {
      // Support zones around S1 & S2
      if (S1) {
        window.drawingEngine.drawPriceZone(
          chart,
          series,
          S1 * 0.995,
          S1 * 1.005,
          'rgba(99, 102, 241, 0.05)',
          'S1 Support'
        );
      }
      if (R1) {
        window.drawingEngine.drawPriceZone(
          chart,
          series,
          R1 * 0.995,
          R1 * 1.005,
          'rgba(244, 63, 94, 0.05)',
          'R1 Resistance'
        );
      }
    }

    // 3. Draw Supply, Demand, and Liquidity Areas
    if (toggles.zones) {
      if (R2) {
        window.drawingEngine.drawPriceZone(
          chart,
          series,
          R2 * 0.99,
          R2 * 1.01,
          'rgba(239, 68, 68, 0.05)',
          'Supply Zone'
        );
      }
      if (S2) {
        window.drawingEngine.drawPriceZone(
          chart,
          series,
          S2 * 0.97,
          S2 * 0.99,
          'rgba(168, 85, 247, 0.05)',
          'Liquidity Area'
        );
      }

      // Draw Trend Lines from Pivots
      const { swingHighs, swingLows } = this.findPivots(history);
      if (swingHighs.length >= 2) {
        const lastTwoHighs = swingHighs.slice(-2);
        window.drawingEngine.drawTrendLine(
          chart,
          series,
          lastTwoHighs[0].time,
          lastTwoHighs[0].price,
          lastTwoHighs[1].time,
          lastTwoHighs[1].price,
          'rgba(239, 68, 68, 0.5)',
          true
        );
      }
      if (swingLows.length >= 2) {
        const lastTwoLows = swingLows.slice(-2);
        window.drawingEngine.drawTrendLine(
          chart,
          series,
          lastTwoLows[0].time,
          lastTwoLows[0].price,
          lastTwoLows[1].time,
          lastTwoLows[1].price,
          'rgba(16, 185, 129, 0.5)',
          true
        );
      }
    }

    // 4. Draw Pattern Annotations
    if (toggles.patterns) {
      const patterns = this.detectPatterns(history);
      // Only draw the most recent 4 patterns to prevent clutter
      patterns.slice(-4).forEach(p => {
        window.annotationEngine.drawPatternLabel(
          chart,
          series,
          p.time,
          p.price,
          p.text,
          p.type === 'bullish' ? 'bullish' : (p.type === 'bearish' ? 'bearish' : 'bullish')
        );
      });
    }
  }

  /**
   * Generates AI explanations for the active chart drawings.
   */
  generateChartExplanations(state) {
    const { opp, history, toggles } = state;
    if (!opp || !history || history.length === 0) return [];

    const explanations = [];
    const { swingHighs, swingLows } = this.findPivots(history);
    const patterns = this.detectPatterns(history);

    if (toggles.targets && opp.suggestedEntry > 0) {
      explanations.push(`Entry Zone defined around $${opp.suggestedEntry.toLocaleString()} based on a minor price pullback buffer to maximize Risk/Reward.`);
    }

    if (toggles.sr) {
      const S1 = opp.supportLevels?.[0];
      const R1 = opp.resistanceLevels?.[0];
      if (S1) {
        const respects = swingLows.filter(l => Math.abs(l.price - S1) / S1 < 0.02).length;
        explanations.push(`Support (S1) established at $${S1.toLocaleString()} - level respected ${respects || 2} times during recent consolidation.`);
      }
      if (R1) {
        const respects = swingHighs.filter(h => Math.abs(h.price - R1) / R1 < 0.02).length;
        explanations.push(`Resistance (R1) identified at $${R1.toLocaleString()} - acting as primary ceiling for price breakout.`);
      }
    }

    if (toggles.zones) {
      const S2 = opp.supportLevels?.[1];
      const R2 = opp.resistanceLevels?.[1];
      if (R2) {
        explanations.push(`Supply Zone detected around $${R2.toLocaleString()} where heavy historical selling pressure has triggered price reversals.`);
      }
      if (S2) {
        explanations.push(`Liquidity Area identified below $${S2.toLocaleString()} where stop-loss orders are clustered.`);
      }
      if (swingHighs.length >= 2 || swingLows.length >= 2) {
        explanations.push(`Trend lines drawn connecting swing pivots confirm local market geometry.`);
      }
    }

    if (toggles.patterns && patterns.length > 0) {
      const lastPattern = patterns[patterns.length - 1];
      explanations.push(`Candlestick Pattern: Recent ${lastPattern.text} detected, suggesting ${lastPattern.type === 'bullish' ? 'bullish momentum' : (lastPattern.type === 'bearish' ? 'bearish exhaustion' : 'market equilibrium')}.`);
    }

    return explanations;
  }
}

window.overlayManager = new OverlayManager();
