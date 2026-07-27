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

  coordinateToPrice(y) {
    if (!this.canvas || !window.chartStateManager || !window.chartStateManager.history || window.chartStateManager.history.length === 0) {
      return null;
    }
    const history = window.chartStateManager.history;
    
    let maxPrice = -Infinity;
    let minPrice = Infinity;
    history.forEach(p => {
      if (p.high > maxPrice) maxPrice = p.high;
      if (p.low < minPrice) minPrice = p.low;
    });

    if (maxPrice === minPrice) return maxPrice;

    const range = maxPrice - minPrice;
    const paddedMin = minPrice - range * 0.15;
    const paddedMax = maxPrice + range * 0.15;

    const dpr = window.devicePixelRatio || 1;
    const height = this.canvas.height / dpr;

    const price = paddedMin + (1 - y / height) * (paddedMax - paddedMin);
    return price;
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
    
    // TradingView Price scale sidebar is 72px wide on the right
    const chartBodyWidth = width - 72;
    // Map oldest candle to 3% and latest candle to 83% of the chart body width
    const startX = chartBodyWidth * 0.03;
    const endX = chartBodyWidth * 0.83;
    
    const ratio = (timestamp - minTime) / (maxTime - minTime);
    const x = startX + ratio * (endX - startX);
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
    const chartBodyWidth = width - 72; // Stop before price scale sidebar!

    this.ctx.save();
    
    // Fill the zone
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, yTop, chartBodyWidth, height);

    // Stroke the boundary lines
    this.ctx.strokeStyle = color.replace(/[\d.]+\)$/, '0.25)'); // boost opacity slightly for border
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.moveTo(0, yTop);
    this.ctx.lineTo(chartBodyWidth, yTop);
    this.ctx.moveTo(0, yBottom);
    this.ctx.lineTo(chartBodyWidth, yBottom);
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
    const chartBodyWidth = width - 72; // Stop before price scale sidebar!

    this.ctx.save();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 1.5;
    if (isDashed) {
      this.ctx.setLineDash([4, 4]);
    }

    // Draw line
    this.ctx.beginPath();
    this.ctx.moveTo(0, y);
    this.ctx.lineTo(chartBodyWidth, y);
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

  /**
   * Draw a dashed projection path ending with an arrow.
   */
  drawProjectedPath(points, color) {
    if (!this.ctx || !points || points.length < 2) return;
    
    this.ctx.save();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 1.5;
    this.ctx.setLineDash([4, 4]);
    
    this.ctx.beginPath();
    
    let first = true;
    for (const p of points) {
      const x = this.timeToCoordinate(p.time);
      const y = this.priceToCoordinate(p.price);
      if (x === null || y === null) continue;
      
      if (first) {
        this.ctx.moveTo(x, y);
        first = false;
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    this.ctx.stroke();
    
    // Draw an arrow head at the last point
    const last = points[points.length - 1];
    const secondLast = points[points.length - 2];
    const x1 = this.timeToCoordinate(secondLast.time);
    const y1 = this.priceToCoordinate(secondLast.price);
    const x2 = this.timeToCoordinate(last.time);
    const y2 = this.priceToCoordinate(last.price);
    
    if (x1 !== null && y1 !== null && x2 !== null && y2 !== null) {
      const angle = Math.atan2(y2 - y1, x2 - x1);
      this.ctx.beginPath();
      this.ctx.moveTo(x2, y2);
      this.ctx.lineTo(x2 - 8 * Math.cos(angle - Math.PI / 6), y2 - 8 * Math.sin(angle - Math.PI / 6));
      this.ctx.moveTo(x2, y2);
      this.ctx.lineTo(x2 - 8 * Math.cos(angle + Math.PI / 6), y2 - 8 * Math.sin(angle + Math.PI / 6));
      this.ctx.stroke();
    }
    
    this.ctx.restore();
  }
}

window.drawingEngine = new DrawingEngine();
