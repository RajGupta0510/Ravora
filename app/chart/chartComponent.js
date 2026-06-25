/**
 * ChartComponent
 * 
 * Responsibility: Initialize, configure, and manage the TradingView 
 * Lightweight Charts container. Renders candles, volume histogram, 
 * overlays canvas, and handles toolbar interactions.
 */
class ChartComponent {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.chart = null;
    this.candleSeries = null;
    this.volumeSeries = null;
    this.overlayCanvas = null;
    this.resizeObserver = null;
    this.unsubscribeState = null;
    this.unsubscribeTick = null;
    
    if (this.container) {
      this.init();
    }
  }

  init() {
    this.container.innerHTML = '';
    this.container.style.position = 'relative';

    // 1. Create chart container div
    const chartDiv = document.createElement('div');
    chartDiv.className = 'tv-chart-inner';
    chartDiv.style.width = '100%';
    chartDiv.style.height = '100%';
    this.container.appendChild(chartDiv);

    // 2. Create overlay canvas
    this.overlayCanvas = document.createElement('canvas');
    this.overlayCanvas.className = 'tv-chart-overlay-canvas';
    this.overlayCanvas.style.position = 'absolute';
    this.overlayCanvas.style.top = '0';
    this.overlayCanvas.style.left = '0';
    this.overlayCanvas.style.width = '100%';
    this.overlayCanvas.style.height = '100%';
    this.overlayCanvas.style.pointerEvents = 'none';
    this.overlayCanvas.style.zIndex = '5';
    this.container.appendChild(this.overlayCanvas);

    window.drawingEngine.setCanvas(this.overlayCanvas);

    // 3. Initialize TradingView Lightweight Chart
    this.chart = LightweightCharts.createChart(chartDiv, {
      width: this.container.clientWidth || 800,
      height: this.container.clientHeight || 320,
      layout: {
        background: { type: 'solid', color: 'transparent' },
        textColor: '#a5b4fc',
        fontFamily: "'Outfit', sans-serif"
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.02)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.02)' }
      },
      crosshair: {
        mode: LightweightCharts.CrosshairMode.Normal,
        vertLine: {
          color: 'rgba(165, 180, 252, 0.4)',
          width: 1,
          style: LightweightCharts.LineStyle.Dashed,
          labelBackgroundColor: '#4f46e5'
        },
        horzLine: {
          color: 'rgba(165, 180, 252, 0.4)',
          width: 1,
          style: LightweightCharts.LineStyle.Dashed,
          labelBackgroundColor: '#4f46e5'
        }
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.08)',
        timeVisible: true,
        secondsVisible: false
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.08)',
        autoScale: true
      }
    });

    window.chartStateManager.chartInstance = this.chart;

    // 4. Add Candlestick Series
    this.candleSeries = this.chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#f87171',
      borderUpColor: '#10b981',
      borderDownColor: '#f87171',
      wickUpColor: '#10b981',
      wickDownColor: '#f87171'
    });

    window.chartStateManager.candlestickSeries = this.candleSeries;

    // 5. Add Volume Series
    this.volumeSeries = this.chart.addHistogramSeries({
      priceFormat: { type: 'volume' },
      priceScaleId: '' // overlay on main panel
    });

    this.volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8, // volume occupies bottom 20%
        bottom: 0
      }
    });

    window.chartStateManager.volumeSeries = this.volumeSeries;

    // 6. Sync canvas dimensions
    this.syncCanvasSize();

    // 7. Subscribe to visible time range changes to redraw overlays
    this.chart.timeScale().subscribeVisibleTimeRangeChange(() => {
      this.drawOverlays();
    });

    // 8. Handle container resizing
    this.resizeObserver = new ResizeObserver(() => {
      this.resizeChart();
    });
    this.resizeObserver.observe(this.container);

    // 9. Subscribe to state changes (toolbar toggles, new asset selection)
    this.unsubscribeState = window.chartStateManager.subscribe((state) => {
      this.handleStateUpdate(state);
    });

    // 10. Subscribe to realtime price ticks
    this.unsubscribeTick = window.realtimeDataService.subscribe((tick) => {
      this.handleRealtimeTick(tick);
    });

    // Setup Toolbar bindings
    this.setupToolbar();
  }

  syncCanvasSize() {
    if (this.overlayCanvas) {
      const rect = this.container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      this.overlayCanvas.width = rect.width * dpr;
      this.overlayCanvas.height = rect.height * dpr;
      
      const ctx = this.overlayCanvas.getContext('2d');
      ctx.scale(dpr, dpr);
    }
  }

  resizeChart() {
    if (this.chart && this.container) {
      this.chart.resize(this.container.clientWidth, this.container.clientHeight);
      this.syncCanvasSize();
      this.drawOverlays();
    }
  }

  updateData(details, opp) {
    if (!this.chart || !details) return;

    window.chartStateManager.setState({
      activeAsset: details.symbol,
      history: details.history || [],
      opp: opp
    });
  }

  handleStateUpdate(state) {
    if (state.history.length === 0) return;

    // Update candlesticks
    const candles = state.history.map(pt => ({
      time: Math.floor(pt.timestamp / 1000),
      open: pt.open,
      high: pt.high,
      low: pt.low,
      close: pt.close
    }));
    this.candleSeries.setData(candles);

    // Update volume histogram
    const volumes = state.history.map(pt => ({
      time: Math.floor(pt.timestamp / 1000),
      value: pt.volume,
      color: pt.close >= pt.open ? 'rgba(16, 185, 129, 0.2)' : 'rgba(248, 113, 113, 0.2)'
    }));
    this.volumeSeries.setData(volumes);

    // Update horizontal price lines (TP, SL, Entry)
    this.updatePriceLines(state);

    // Redraw Canvas overlays
    setTimeout(() => {
      this.chart.timeScale().fitContent();
      this.drawOverlays();
      this.updateExplainersList(state);
    }, 50);
  }

  updatePriceLines(state) {
    // Clear old lines
    this.priceLines.forEach(line => this.candleSeries.removePriceLine(line));
    this.priceLines = [];

    if (!state.toggles.targets || !state.opp) return;

    const { suggestedEntry, suggestedTakeProfit, suggestedStopLoss } = state.opp;

    if (suggestedEntry > 0) {
      const line = this.candleSeries.createPriceLine({
        price: suggestedEntry,
        color: '#3b82f6',
        lineWidth: 1.5,
        lineStyle: LightweightCharts.LineStyle.Dashed,
        axisLabelVisible: true,
        title: 'Entry Target'
      });
      this.priceLines.push(line);
    }

    if (suggestedTakeProfit > 0) {
      const line = this.candleSeries.createPriceLine({
        price: suggestedTakeProfit,
        color: '#10b981',
        lineWidth: 1.5,
        lineStyle: LightweightCharts.LineStyle.Dashed,
        axisLabelVisible: true,
        title: 'Take Profit'
      });
      this.priceLines.push(line);
    }

    if (suggestedStopLoss > 0) {
      const line = this.candleSeries.createPriceLine({
        price: suggestedStopLoss,
        color: '#ef4444',
        lineWidth: 1.5,
        lineStyle: LightweightCharts.LineStyle.Dashed,
        axisLabelVisible: true,
        title: 'Stop Loss'
      });
      this.priceLines.push(line);
    }
  }

  handleRealtimeTick(tick) {
    if (!this.candleSeries || !this.volumeSeries) return;

    // Update the last candle
    this.candleSeries.update(tick);
    
    // Update the volume tick
    this.volumeSeries.update({
      time: tick.time,
      value: tick.volume,
      color: tick.close >= tick.open ? 'rgba(16, 185, 129, 0.2)' : 'rgba(248, 113, 113, 0.2)'
    });

    // Update DOM price display
    const priceDisplay = document.getElementById('terminal-chart-price');
    const changeDisplay = document.getElementById('terminal-chart-change');
    
    if (priceDisplay && window.chartStateManager.opp) {
      const opp = window.chartStateManager.opp;
      const fmtPrice = tick.close >= 100 
        ? `$${tick.close.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : `$${tick.close.toFixed(4)}`;
      priceDisplay.textContent = fmtPrice;

      // Calculate 24h change dynamically
      let change24h = 0;
      if (window.chartStateManager.history.length > 1) {
        const prevClose = window.chartStateManager.history[window.chartStateManager.history.length - 2].close;
        change24h = ((tick.close - prevClose) / prevClose) * 100;
      }
      
      if (changeDisplay) {
        changeDisplay.textContent = `${change24h >= 0 ? '+' : ''}${change24h.toFixed(2)}%`;
        changeDisplay.className = change24h >= 0 ? 'text-green' : 'text-error';
      }
    }

    // Animate drawing updates
    this.drawOverlays();
  }

  drawOverlays() {
    window.overlayManager.drawOverlays(this.chart, this.candleSeries, window.chartStateManager);
  }

  updateExplainersList(state) {
    const listContainer = document.getElementById('terminal-explainers-list');
    if (!listContainer) return;

    const explainers = window.overlayManager.generateChartExplanations(state);
    
    listContainer.innerHTML = '';
    
    if (explainers.length === 0) {
      listContainer.innerHTML = `<div class="explainer-item empty">Toggle overlays to show AI explanations.</div>`;
      return;
    }

    explainers.forEach(exp => {
      const div = document.createElement('div');
      div.className = 'explainer-item';
      div.innerHTML = `
        <span class="explainer-bullet"></span>
        <p>${exp}</p>
      `;
      listContainer.appendChild(div);
    });
  }

  setupToolbar() {
    // 1. Overlay Toggles
    const overlayToggles = document.getElementById('overlay-toggles');
    if (overlayToggles) {
      overlayToggles.addEventListener('click', (e) => {
        const btn = e.target.closest('.toolbar-toggle-btn');
        if (!btn) return;
        
        const overlayName = btn.dataset.overlay;
        window.chartStateManager.toggleOverlay(overlayName);
        
        btn.classList.toggle('active', window.chartStateManager.toggles[overlayName]);
      });
    }

    // 2. Reset View
    const resetBtn = document.getElementById('btn-reset-chart');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (this.chart) {
          this.chart.timeScale().fitContent();
        }
      });
    }

    // 3. Screenshot
    const screenshotBtn = document.getElementById('btn-screenshot-chart');
    if (screenshotBtn) {
      screenshotBtn.addEventListener('click', () => {
        this.takeScreenshot();
      });
    }
  }

  takeScreenshot() {
    if (!this.chart || !this.overlayCanvas) return;
    
    // We combine the TradingView chart image with our Canvas overlay image
    this.chart.takeScreenshot().then(chartCanvas => {
      const mergedCanvas = document.createElement('canvas');
      mergedCanvas.width = chartCanvas.width;
      mergedCanvas.height = chartCanvas.height;
      
      const ctx = mergedCanvas.getContext('2d');
      ctx.drawImage(chartCanvas, 0, 0);
      ctx.drawImage(this.overlayCanvas, 0, 0, chartCanvas.width, chartCanvas.height);
      
      const url = mergedCanvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `ravora-chart-${window.chartStateManager.activeAsset || 'analysis'}.png`;
      link.href = url;
      link.click();
    });
  }

  destroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.unsubscribeState) {
      this.unsubscribeState();
    }
    if (this.unsubscribeTick) {
      this.unsubscribeTick();
    }
    if (this.chart) {
      this.chart.remove();
      this.chart = null;
    }
    window.realtimeDataService.disconnect();
  }
}

// Global initialization hook
window.initChartIntelligence = (containerId) => {
  if (window.activeChartComponent) {
    window.activeChartComponent.destroy();
  }
  window.activeChartComponent = new ChartComponent(containerId);
  return window.activeChartComponent;
};
