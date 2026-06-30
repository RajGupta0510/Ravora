/**
 * ChartOverlayService
 * 
 * Responsibility: Render AI Trade Plan overlays (Entry, TP, SL, Support, Resistance,
 * Trend Lines, and Buy/Sell markers) directly on the TradingView Lightweight Chart.
 * Adapts drawings dynamically based on recommendation states (LONG, SHORT, HOLD, WAIT).
 */
class ChartOverlayService {
  constructor() {
    this.priceLines = [];
    this.trendLineSeries = null;
  }

  /**
   * Clear all active overlays from the chart and series.
   */
  clearOverlays(chart, candleSeries) {
    if (candleSeries) {
      this.priceLines.forEach(line => candleSeries.removePriceLine(line));
      candleSeries.setMarkers([]);
    }
    this.priceLines = [];

    if (this.trendLineSeries && chart) {
      try {
        chart.removeSeries(this.trendLineSeries);
      } catch (e) {
        console.warn('[ChartOverlayService] Error removing trend line series:', e);
      }
      this.trendLineSeries = null;
    }
  }

  /**
   * Apply AI overlays based on the current state.
   */
  applyOverlays(chart, candleSeries, state) {
    this.clearOverlays(chart, candleSeries);

    const { opp, history, toggles } = state;
    if (!opp || !history || history.length === 0 || !candleSeries || !chart) return;

    const rec = (opp.recommendation || 'HOLD').toUpperCase();

    // 1. Draw Support and Resistance Levels (Muted Blue / Muted Orange)
    // Displayed for all states if toggled on
    if (toggles.sr) {
      if (opp.nearestSupport > 0) {
        const line = candleSeries.createPriceLine({
          price: opp.nearestSupport,
          color: '#60a5fa', // Muted Blue
          lineWidth: 1.5,
          lineStyle: LightweightCharts.LineStyle.Dotted,
          axisLabelVisible: true,
          title: 'Support'
        });
        this.priceLines.push(line);
      }

      if (opp.nearestResistance > 0) {
        const line = candleSeries.createPriceLine({
          price: opp.nearestResistance,
          color: '#fb923c', // Muted Orange
          lineWidth: 1.5,
          lineStyle: LightweightCharts.LineStyle.Dotted,
          axisLabelVisible: true,
          title: 'Resistance'
        });
        this.priceLines.push(line);
      }
    }

    // 2. Draw Trend Line (Subtle White Line)
    // Displayed for all states if toggled on
    if (toggles.zones) {
      this.drawTrendLine(chart, history, opp.trendDirection);
    }

    // 3. Draw Trade Plan Overlays (LONG and SHORT)
    if (toggles.targets) {
      if (rec === 'LONG' || rec === 'SHORT') {
        // Entry Price: Blue
        if (opp.suggestedEntry > 0) {
          const line = candleSeries.createPriceLine({
            price: opp.suggestedEntry,
            color: '#2563eb', // Blue
            lineWidth: 2,
            lineStyle: LightweightCharts.LineStyle.Solid,
            axisLabelVisible: true,
            title: 'Entry Price'
          });
          this.priceLines.push(line);
        }

        // Stop Loss: Red
        if (opp.suggestedStopLoss > 0) {
          const line = candleSeries.createPriceLine({
            price: opp.suggestedStopLoss,
            color: '#ef4444', // Red
            lineWidth: 2,
            lineStyle: LightweightCharts.LineStyle.Solid,
            axisLabelVisible: true,
            title: 'Stop Loss'
          });
          this.priceLines.push(line);
        }

        // Take Profits: Green
        if (opp.suggestedTakeProfit1 > 0) {
          const line = candleSeries.createPriceLine({
            price: opp.suggestedTakeProfit1,
            color: '#10b981', // Green
            lineWidth: 1.5,
            lineStyle: LightweightCharts.LineStyle.Dashed,
            axisLabelVisible: true,
            title: 'Take Profit 1'
          });
          this.priceLines.push(line);
        }
        if (opp.suggestedTakeProfit2 > 0) {
          const line = candleSeries.createPriceLine({
            price: opp.suggestedTakeProfit2,
            color: '#10b981', // Green
            lineWidth: 1.5,
            lineStyle: LightweightCharts.LineStyle.Dashed,
            axisLabelVisible: true,
            title: 'Take Profit 2'
          });
          this.priceLines.push(line);
        }
        if (opp.suggestedTakeProfit3 > 0) {
          const line = candleSeries.createPriceLine({
            price: opp.suggestedTakeProfit3,
            color: '#10b981', // Green
            lineWidth: 1.5,
            lineStyle: LightweightCharts.LineStyle.Dashed,
            axisLabelVisible: true,
            title: 'Take Profit 3'
          });
          this.priceLines.push(line);
        }

        // 4. Place Buy/Sell Marker at the latest candle
        const lastCandle = history[history.length - 1];
        const lastTime = Math.floor(lastCandle.timestamp / 1000);
        
        const markers = [
          {
            time: lastTime,
            position: rec === 'LONG' ? 'belowBar' : 'aboveBar',
            color: rec === 'LONG' ? '#10b981' : '#ef4444',
            shape: rec === 'LONG' ? 'arrowUp' : 'arrowDown',
            text: rec === 'LONG' ? 'BUY / LONG' : 'SELL / SHORT',
            size: 1.5
          }
        ];
        candleSeries.setMarkers(markers);
      }

      // 5. WAIT State: Display Expected Trigger level (Entry rendered as Yellow/Orange Dashed)
      if (rec === 'WAIT' && opp.suggestedEntry > 0) {
        const line = candleSeries.createPriceLine({
          price: opp.suggestedEntry,
          color: '#f59e0b', // Yellow/Orange
          lineWidth: 2,
          lineStyle: LightweightCharts.LineStyle.Dashed,
          axisLabelVisible: true,
          title: 'Expected Trigger'
        });
        this.priceLines.push(line);
      }
    }
  }

  /**
   * Draw a subtle white trend line connecting swing highs or swing lows.
   */
  drawTrendLine(chart, history, trendDirection) {
    if (history.length < 10) return;

    // Connect swing highs for bearish trend, swing lows for bullish trend
    const swingPoints = [];
    const windowSize = 5;

    for (let i = windowSize; i < history.length - windowSize; i++) {
      const current = history[i];
      let isExtremum = true;

      if (trendDirection === 'Bearish') {
        // Swing Highs
        for (let j = 1; j <= windowSize; j++) {
          if (history[i - j].high >= current.high || history[i + j].high >= current.high) {
            isExtremum = false;
            break;
          }
        }
        if (isExtremum) {
          swingPoints.push({ time: Math.floor(current.timestamp / 1000), price: current.high });
        }
      } else {
        // Swing Lows
        for (let j = 1; j <= windowSize; j++) {
          if (history[i - j].low <= current.low || history[i + j].low <= current.low) {
            isExtremum = false;
            break;
          }
        }
        if (isExtremum) {
          swingPoints.push({ time: Math.floor(current.timestamp / 1000), price: current.low });
        }
      }
    }

    if (swingPoints.length >= 2) {
      // Connect the last two swing points
      const p1 = swingPoints[swingPoints.length - 2];
      const p2 = swingPoints[swingPoints.length - 1];

      this.trendLineSeries = chart.addLineSeries({
        color: 'rgba(255, 255, 255, 0.4)', // Subtle white
        lineWidth: 1.5,
        lineStyle: LightweightCharts.LineStyle.Solid,
        priceLineVisible: false,
        lastPriceAnimationMode: 0
      });

      this.trendLineSeries.setData([
        { time: p1.time, value: p1.price },
        { time: p2.time, value: p2.price }
      ]);
    }
  }
}

// Instantiate globally
window.chartOverlayService = new ChartOverlayService();
