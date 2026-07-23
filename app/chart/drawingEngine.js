/**
 * DrawingEngine
 * 
 * Responsibility: Handle HTML5 canvas operations to draw overlays 
 * directly on top of the TradingView widget iframe.
 * Handles mapping coordinate systems (time/price to pixels) relative
 * to the historical price range.
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

  priceToCoordinate(price) {
    if (!this.canvas || !window.chartStateManager || !window.chartStateManager.history || window.chartStateManager.history.length === 0) {
      return null;
    }
    const history = window.chartStateManager.history;
    
    // Find min and max price from history
    let maxPrice = -Infinity;
    let minPrice = Infinity;
    history.forEach(p => {
      if (p.high > maxPrice) maxPrice = p.high;
      if (p.low < minPrice) minPrice = p.low;
    });

    if (maxPrice === minPrice) return this.canvas.height / 2;

    // Add a 10% padding top and bottom to make the chart look nice
    const range = maxPrice - minPrice;
    const paddedMin = minPrice - range * 0.15;
    const paddedMax = maxPrice + range * 0.15;

    const dpr = window.devicePixelRatio || 1;
    const height = this.canvas.height / dpr;
    
    // Map price to height (Y=0 is top, Y=height is bottom)
    const y = height * (1 - (price - paddedMin) / (paddedMax - paddedMin));
    return y;
  }

  timeToCoordinate(timestamp) {
    if (!this.canvas || !window.chartStateManager || !window.chartStateManager.history || window.chartStateManager.history.length === 0) {
      return null;
    }
    const history = window.chartStateManager.history;
    const minTime = Math.floor(history[0].timestamp / 1000);
    const maxTime = Math.floor(history[history.length - 1].timestamp / 1000);

    if (maxTime === minTime) return this.canvas.width / 2;

    const dpr = window.devicePixelRatio || 1;
    const width = this.canvas.width / dpr;
    
    // Map time to width with 5% margin on the left/right
    const margin = width * 0.05;
    const innerWidth = width - 2 * margin;
    const x = margin + innerWidth * ((timestamp - minTime) / (maxTime - minTime));
    return x;
  }

  /**
   * Draw a shaded horizontal region representing supply/demand or liquidity zones.
   */
  drawPriceZone(chart, series, minPrice, maxPrice, color, labelText = '') {
    if (!this.ctx) return;

    // Get Y coordinates for the prices
    const yMin = this.priceToCoordinate(minPrice);
    const yMax = this.priceToCoordinate(maxPrice);

    if (yMin === null || yMax === null) return;

    const yTop = Math.min(yMin, yMax);
    const yBottom = Math.max(yMin, yMax);
    const height = yBottom - yTop;
    
    const dpr = window.devicePixelRatio || 1;
    const width = this.canvas.width / dpr;

    this.ctx.save();
    
    // Fill the zone
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, yTop, width, height);

    // Stroke the boundary lines
    this.ctx.strokeStyle = color.replace(/[\d.]+\)$/, '0.25)'); // boost opacity slightly for border
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.moveTo(0, yTop);
    this.ctx.lineTo(width, yTop);
    this.ctx.moveTo(0, yBottom);
    this.ctx.lineTo(width, yBottom);
    this.ctx.stroke();

    // Draw text flag
    if (labelText) {
      this.ctx.fillStyle = '#a5b4fc';
      this.ctx.font = 'bold 10px sans-serif';
      this.ctx.fillText(labelText.toUpperCase(), 16, yTop + 14);
    }

    this.ctx.restore();
  }

  /**
   * Draw trend lines or channel lines.
   */
  drawTrendLine(chart, series, timeA, priceA, timeB, priceB, color, isDashed = false) {
    if (!this.ctx) return;

    const xA = this.timeToCoordinate(timeA);
    const xB = this.timeToCoordinate(timeB);
    const yA = this.priceToCoordinate(priceA);
    const yB = this.priceToCoordinate(priceB);

    if (xA === null || xB === null || yA === null || yB === null) return;

    this.ctx.save();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 2;
    if (isDashed) {
      this.ctx.setLineDash([4, 4]);
    }

    this.ctx.beginPath();
    this.ctx.moveTo(xA, yA);
    this.ctx.lineTo(xB, yB);
    this.ctx.stroke();

    this.ctx.restore();
  }

  /**
   * Draw target price line (Entry, SL, TP)
   */
  drawPriceLine(price, color, labelText, isDashed = false) {
    if (!this.ctx) return;

    const y = this.priceToCoordinate(price);
    if (y === null) return;

    const dpr = window.devicePixelRatio || 1;
    const width = this.canvas.width / dpr;

    this.ctx.save();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 1.5;
    if (isDashed) {
      this.ctx.setLineDash([4, 4]);
    }

    // Draw line
    this.ctx.beginPath();
    this.ctx.moveTo(0, y);
    this.ctx.lineTo(width, y);
    this.ctx.stroke();

    // Draw text label on the left edge
    this.ctx.fillStyle = '#0c0f1d';
    this.ctx.fillRect(8, y - 9, this.ctx.measureText(labelText).width + 12, 18);
    this.ctx.strokeStyle = color;
    this.ctx.strokeRect(8, y - 9, this.ctx.measureText(labelText).width + 12, 18);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 9px sans-serif';
    this.ctx.fillText(labelText, 14, y + 3);

    this.ctx.restore();
  }
}

window.drawingEngine = new DrawingEngine();
