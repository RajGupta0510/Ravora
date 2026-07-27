/**
 * ChartComponent
 * 
 * Responsibility: Initialize, configure, and manage the TradingView 
 * Technical Analysis Widget container. Handles symbol/timeframe changes
 * and coordinates overlays canvas rendering.
 */
class ChartComponent {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.widget = null;
    this.overlayCanvas = null;
    this.resizeObserver = null;
    this.unsubscribeState = null;
    this.unsubscribeTick = null;
    this.currentSymbol = null;
    this.currentTimeframe = null;
    
    if (this.container) {
      this.init();
    }
  }

  init() {
    this.container.innerHTML = '';
    this.container.style.position = 'relative';

    // 1. Create chart container div for TradingView widget
    const chartDiv = document.createElement('div');
    chartDiv.id = 'tv-widget-container';
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

    // 3. Sync canvas dimensions
    this.syncCanvasSize();

    // 4. Handle container resizing
    this.resizeObserver = new ResizeObserver(() => {
      this.resizeChart();
    });
    this.resizeObserver.observe(this.container);

    // 5. Subscribe to state changes (toolbar toggles, new asset selection)
    this.unsubscribeState = window.chartStateManager.subscribe((state) => {
      this.handleStateUpdate(state);
    });

    // 6. Subscribe to realtime price ticks
    this.unsubscribeTick = window.realtimeDataService.subscribe((tick) => {
      this.handleRealtimeTick(tick);
    });

    // Setup Toolbar bindings
    this.setupToolbar();
    this.setupInteractivity();
  }

  mapInterval(tf) {
    const mappings = {
      '1m': '1',
      '5m': '5',
      '15m': '15',
      '30m': '30',
      '1h': '60',
      '1H': '60',
      '4h': '240',
      '4H': '240',
      '1d': 'D',
      '1D': 'D',
      '1w': 'W',
      '1W': 'W',
      '1M': 'M'
    };
    return mappings[tf] || 'D';
  }

  loadTradingViewWidget(symbol, timeframe) {
    const container = document.getElementById('tv-widget-container');
    if (!container) return;
    container.innerHTML = '';

    const interval = this.mapInterval(timeframe);

    if (typeof TradingView !== 'undefined' && TradingView.widget) {
      this.widget = new TradingView.widget({
        "autosize": true,
        "symbol": "BINANCE:" + symbol + "USDT",
        "interval": interval,
        "timezone": "Etc/UTC",
        "theme": "dark",
        "style": "1", // Candlesticks
        "locale": "en",
        "enable_publishing": false,
        "hide_side_toolbar": false,
        "allow_symbol_change": true,
        "container_id": "tv-widget-container",
        "studies": [
          "RSI@tv-basicstudies",
          "MASimple@tv-basicstudies"
        ],
        "loading_screen": {
          "backgroundColor": "#0c0f1d"
        },
        "overrides": {
          "paneProperties.background": "#0c0f1d",
          "paneProperties.backgroundType": "solid"
        }
      });
    } else {
      console.warn('TradingView library is not loaded yet.');
      container.innerHTML = `<div style="display:flex; justify-content:center; align-items:center; height:100%; color:var(--text-secondary); font-size:0.85rem;">Loading TradingView Chart...</div>`;
    }
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
    this.syncCanvasSize();
    this.drawOverlays();
  }

  updateData(details, opp) {
    if (!details) return;

    window.chartStateManager.setState({
      activeAsset: details.symbol,
      history: details.history || [],
      opp: opp
    });
  }

  handleStateUpdate(state) {
    if (state.activeAsset && (state.activeAsset !== this.currentSymbol || state.timeframe !== this.currentTimeframe)) {
      this.currentSymbol = state.activeAsset;
      this.currentTimeframe = state.timeframe;
      this.loadTradingViewWidget(this.currentSymbol, this.currentTimeframe);
    }

    if (state.history.length === 0) return;

    // Update AI overlays (Entry, SL, TP, Support, Resistance, Trend)
    if (window.chartOverlayService) {
      window.chartOverlayService.applyOverlays(null, null, state);
    }

    // Redraw Canvas overlays
    setTimeout(() => {
      this.drawOverlays();
      this.updateExplainersList(state);
    }, 100);
  }

  handleRealtimeTick(tick) {
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
    window.overlayManager.drawOverlays(null, null, window.chartStateManager);
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
        this.drawOverlays();
        this.updateExplainersList(window.chartStateManager);
      });
    }

    // 2. Reset View
    const resetBtn = document.getElementById('btn-reset-chart');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (this.currentSymbol && this.currentTimeframe) {
          this.loadTradingViewWidget(this.currentSymbol, this.currentTimeframe);
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

  setupInteractivity() {
    if (!this.overlayCanvas) return;

    this.isDragging = false;
    this.draggedLine = null; // 'entry' | 'stopLoss' | 'tp1' | 'tp2' | 'tp3'

    const container = this.container;
    const canvas = this.overlayCanvas;

    const checkHover = (e) => {
      if (this.isDragging) return;

      const rect = canvas.getBoundingClientRect();
      const mouseY = e.clientY - rect.top;

      const opp = window.chartStateManager.opp;
      if (!opp || !opp.tradePlan) return;

      const lastClose = window.chartStateManager.history[window.chartStateManager.history.length - 1]?.close || 65000;
      
      const entryVal = opp.tradePlan.optimalEntry ? parseFloat(opp.tradePlan.optimalEntry.replace('$', '')) : lastClose;
      const slVal = opp.tradePlan.stopLoss ? parseFloat(opp.tradePlan.stopLoss.replace('$', '')) : lastClose * 0.95;
      
      const tps = opp.tradePlan.takeProfitTargets || [];
      const tp1Val = tps[0] ? parseFloat(tps[0].replace('$', '')) : lastClose * 1.04;
      const tp2Val = tps[1] ? parseFloat(tps[1].replace('$', '')) : lastClose * 1.08;
      const tp3Val = tps[2] ? parseFloat(tps[2].replace('$', '')) : lastClose * 1.12;

      const levels = [
        { name: 'entry', price: entryVal },
        { name: 'stopLoss', price: slVal },
        { name: 'tp1', price: tp1Val },
        { name: 'tp2', price: tp2Val },
        { name: 'tp3', price: tp3Val }
      ];

      let found = null;
      for (const lvl of levels) {
        const y = window.drawingEngine.priceToCoordinate(lvl.price);
        if (y !== null && Math.abs(mouseY - y) < 8) {
          found = lvl.name;
          break;
        }
      }

      if (found) {
        canvas.style.pointerEvents = 'auto';
        container.style.cursor = 'ns-resize';
        this.draggedLine = found;
      } else {
        canvas.style.pointerEvents = 'none';
        container.style.cursor = 'default';
        this.draggedLine = null;
      }
    };

    container.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        const rect = canvas.getBoundingClientRect();
        const mouseY = e.clientY - rect.top;
        const newPrice = window.drawingEngine.coordinateToPrice(mouseY);
        
        if (newPrice !== null && window.chartStateManager.opp && window.chartStateManager.opp.tradePlan) {
          const opp = window.chartStateManager.opp;
          
          if (this.draggedLine === 'entry') {
            opp.tradePlan.optimalEntry = `$${newPrice.toFixed(2)}`;
          } else if (this.draggedLine === 'stopLoss') {
            opp.tradePlan.stopLoss = `$${newPrice.toFixed(2)}`;
          } else if (this.draggedLine === 'tp1') {
            opp.tradePlan.takeProfitTargets[0] = `$${newPrice.toFixed(2)}`;
          } else if (this.draggedLine === 'tp2') {
            opp.tradePlan.takeProfitTargets[1] = `$${newPrice.toFixed(2)}`;
          } else if (this.draggedLine === 'tp3') {
            opp.tradePlan.takeProfitTargets[2] = `$${newPrice.toFixed(2)}`;
          }
          
          this.drawOverlays();
        }
      } else {
        checkHover(e);
      }
    });

    canvas.addEventListener('mousedown', (e) => {
      if (this.draggedLine) {
        this.isDragging = true;
        canvas.style.pointerEvents = 'auto';
      }
    });

    window.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false;
        canvas.style.pointerEvents = 'none';
        container.style.cursor = 'default';
      }
    });
  }

  takeScreenshot() {
    if (!this.overlayCanvas) return;
    const url = this.overlayCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `ravora-chart-${window.chartStateManager.activeAsset || 'analysis'}.png`;
    link.href = url;
    link.click();
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
    this.widget = null;
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
