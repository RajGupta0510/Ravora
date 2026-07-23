/**
 * ChartOverlayService
 * 
 * Responsibility: Render AI Trade Plan overlays (Entry, TP, SL, Support, Resistance,
 * and Buy/Sell markers) directly on the transparent canvas overlay on top of TradingView.
 */
class ChartOverlayService {
  constructor() {
    this.priceLines = [];
  }

  clearOverlays() {
    this.priceLines = [];
    if (window.drawingEngine) {
      window.drawingEngine.clear();
    }
  }

  applyOverlays(chart, candleSeries, state) {
    this.clearOverlays();

    const { opp, history, toggles } = state;
    if (!opp || !history || history.length === 0) return;

    const rec = (opp.recommendation || 'HOLD').toUpperCase();

    // 1. Draw Support and Resistance Levels
    if (toggles.sr) {
      if (opp.nearestSupport > 0) {
        window.drawingEngine.drawPriceLine(opp.nearestSupport, '#3b82f6', `Support: $${opp.nearestSupport.toLocaleString()}`, false);
      }
      if (opp.nearestResistance > 0) {
        window.drawingEngine.drawPriceLine(opp.nearestResistance, '#f97316', `Resistance: $${opp.nearestResistance.toLocaleString()}`, false);
      }
    }

    // 2. Draw Trade Plan Overlays
    if (toggles.targets) {
      if (rec === 'LONG' || rec === 'SHORT') {
        // Entry Price
        if (opp.suggestedEntry > 0) {
          window.drawingEngine.drawPriceLine(opp.suggestedEntry, '#2563eb', `Entry: $${opp.suggestedEntry.toLocaleString()}`, false);
        }

        // Stop Loss
        if (opp.suggestedStopLoss > 0) {
          window.drawingEngine.drawPriceLine(opp.suggestedStopLoss, '#ef4444', `Stop Loss: $${opp.suggestedStopLoss.toLocaleString()}`, true);
        }

        // Take Profits
        if (opp.suggestedTakeProfit1 > 0) {
          window.drawingEngine.drawPriceLine(opp.suggestedTakeProfit1, '#10b981', `TP 1: $${opp.suggestedTakeProfit1.toLocaleString()}`, true);
        }
        if (opp.suggestedTakeProfit2 > 0) {
          window.drawingEngine.drawPriceLine(opp.suggestedTakeProfit2, '#10b981', `TP 2: $${opp.suggestedTakeProfit2.toLocaleString()}`, true);
        }
        if (opp.suggestedTakeProfit3 > 0) {
          window.drawingEngine.drawPriceLine(opp.suggestedTakeProfit3, '#10b981', `TP 3: $${opp.suggestedTakeProfit3.toLocaleString()}`, true);
        }

        // 3. Draw BUY/SELL signal markers on the right edge or latest candle
        this.drawTradeSignalMarker(rec, history);
      }

      // WAIT State
      if (rec === 'WAIT' && opp.suggestedEntry > 0) {
        window.drawingEngine.drawPriceLine(opp.suggestedEntry, '#f59e0b', `Expected Trigger: $${opp.suggestedEntry.toLocaleString()}`, true);
      }
    }
  }

  drawTradeSignalMarker(rec, history) {
    if (!window.drawingEngine || !window.drawingEngine.ctx || !window.drawingEngine.canvas) return;

    const ctx = window.drawingEngine.ctx;
    const canvas = window.drawingEngine.canvas;
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    const lastCandle = history[history.length - 1];
    const y = window.drawingEngine.priceToCoordinate(lastCandle.close);
    const x = window.drawingEngine.timeToCoordinate(Math.floor(lastCandle.timestamp / 1000));

    if (x === null || y === null) return;

    ctx.save();
    
    // Draw signal badge on top of the latest price position
    const text = rec === 'LONG' ? 'RAVORA AI BUY' : 'RAVORA AI SELL';
    const color = rec === 'LONG' ? '#2563eb' : '#ef4444';
    
    ctx.font = 'bold 9px sans-serif';
    const textWidth = ctx.measureText(text).width;
    
    ctx.fillStyle = color;
    // Draw bubble
    ctx.beginPath();
    ctx.roundRect(x - (textWidth + 16) / 2, y - 30, textWidth + 16, 18, 4);
    ctx.fill();

    // Draw little arrow pointing down to price
    ctx.beginPath();
    ctx.moveTo(x, y - 12);
    ctx.lineTo(x - 4, y - 8);
    ctx.lineTo(x + 4, y - 8);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, x - textWidth / 2, y - 18);

    ctx.restore();
  }
}

window.chartOverlayService = new ChartOverlayService();
