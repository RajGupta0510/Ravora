/**
 * DrawingEngine
 * 
 * Responsibility: Handle HTML5 canvas operations to draw overlays 
 * directly on top of the TradingView Lightweight Chart canvas.
 * Handles mapping coordinate systems (time/price to pixels).
 */
class DrawingEngine {
  constructor() {
    this.canvas = null;
    this.ctx = null;
  }

  setCanvas(canvas) {
    this.canvas = canvas;
    this.ctx = canvas ? canvas.getContext('2d') : null;
  }

  clear() {
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  /**
   * Draw a shaded horizontal region representing supply/demand or liquidity zones.
   */
  drawPriceZone(chart, series, minPrice, maxPrice, color, labelText = '') {
    if (!this.ctx || !chart || !series) return;

    // Get Y coordinates for the prices
    const yMin = series.priceToCoordinate(minPrice);
    const yMax = series.priceToCoordinate(maxPrice);

    if (yMin === null || yMax === null) return;

    const yTop = Math.min(yMin, yMax);
    const yBottom = Math.max(yMin, yMax);
    const height = yBottom - yTop;
    const width = this.canvas.width;

    this.ctx.save();
    
    // Fill the zone
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, yTop, width, height);

    // Stroke the boundary lines
    this.ctx.strokeStyle = color.replace(/[\d.]+\)$/, '0.25)'); // boost opacity slightly for border
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(0, yTop);
    this.ctx.lineTo(width, yTop);
    this.ctx.moveTo(0, yBottom);
    this.ctx.lineTo(width, yBottom);
    this.ctx.stroke();

    // Draw text flag
    if (labelText) {
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      this.ctx.font = 'bold 9px sans-serif';
      this.ctx.fillText(labelText.toUpperCase(), 12, yTop + 12);
    }

    this.ctx.restore();
  }

  /**
   * Draw trend lines or channel lines.
   */
  drawTrendLine(chart, series, timeA, priceA, timeB, priceB, color, isDashed = false) {
    if (!this.ctx || !chart || !series) return;

    const xA = chart.timeScale().timeToCoordinate(timeA);
    const xB = chart.timeScale().timeToCoordinate(timeB);
    const yA = series.priceToCoordinate(priceA);
    const yB = series.priceToCoordinate(priceB);

    if (xA === null || xB === null || yA === null || yB === null) return;

    this.ctx.save();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 1.5;
    if (isDashed) {
      this.ctx.setLineDash([4, 4]);
    }

    this.ctx.beginPath();
    this.ctx.moveTo(xA, yA);
    this.ctx.lineTo(xB, yB);
    this.ctx.stroke();

    this.ctx.restore();
  }
}

window.drawingEngine = new DrawingEngine();
