/**
 * ChartStateManager
 * 
 * Responsibility: Manage the active state of the Chart Intelligence Engine.
 * Houses timeframe selection, toggle states for various overlays, and references
 * to the active asset and its quantitative parameters.
 */
class ChartStateManager {
  constructor() {
    this.timeframe = '1D';
    this.activeAsset = null;
    this.history = [];
    this.opp = null;
    this.toggles = {
      targets: true,
      sr: true,
      zones: true,
      patterns: true
    };
    this.chartInstance = null;
    this.candlestickSeries = null;
    this.volumeSeries = null;
    this.priceLines = []; // Active price lines (Entry, TP, SL)
    this.subscribers = new Set();
  }

  setState(newState) {
    Object.assign(this, newState);
    this.notify();
  }

  toggleOverlay(name) {
    if (name in this.toggles) {
      this.toggles[name] = !this.toggles[name];
      this.notify();
    }
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notify() {
    for (const callback of this.subscribers) {
      callback(this);
    }
  }
}

// Make it globally accessible
window.chartStateManager = new ChartStateManager();
