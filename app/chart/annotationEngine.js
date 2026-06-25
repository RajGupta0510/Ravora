/**
 * AnnotationEngine
 * 
 * Responsibility: Draw custom text callouts and pattern flags 
 * on specific historical candles (e.g. Doji, Hammer, Breakout, Demand Rebound).
 */
class AnnotationEngine {
  /**
   * Draws a beautiful rounded callout tag with a vertical connector line.
   */
  drawPatternLabel(chart, series, time, price, text, type = 'bullish') {
    const ctx = window.drawingEngine.ctx;
    if (!ctx || !chart || !series) return;

    const x = chart.timeScale().timeToCoordinate(time);
    const y = series.priceToCoordinate(price);

    if (x === null || y === null) return;

    ctx.save();
    
    // Choose theme colors
    const isBullish = type === 'bullish';
    const bgColor = isBullish ? 'rgba(16, 185, 129, 0.85)' : 'rgba(244, 63, 94, 0.85)';
    const borderColor = isBullish ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)';
    const textColor = '#ffffff';

    ctx.font = 'bold 9px sans-serif';
    const textWidth = ctx.measureText(text).width;
    const paddingX = 6;
    const paddingY = 4;
    const boxWidth = textWidth + paddingX * 2;
    const boxHeight = 12 + paddingY * 2;
    
    const boxX = x - boxWidth / 2;
    const boxY = isBullish ? y + 24 : y - boxHeight - 24;

    // Draw vertical connector line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, isBullish ? boxY : boxY + boxHeight);
    ctx.stroke();

    // Draw bubble
    ctx.fillStyle = bgColor;
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 4);
    } else {
      ctx.rect(boxX, boxY, boxWidth, boxHeight);
    }
    ctx.fill();
    ctx.stroke();

    // Draw text
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, boxY + boxHeight / 2 + 0.5);

    ctx.restore();
  }
}

window.annotationEngine = new AnnotationEngine();
