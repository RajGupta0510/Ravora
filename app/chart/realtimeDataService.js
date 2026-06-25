/**
 * RealtimeDataService
 * 
 * Responsibility: Provide live price ticks for the active asset.
 * Tries to connect to the Binance WebSocket feed for real-time klines,
 * and falls back to a smooth randomized-walk simulator if offline or connection fails.
 */
class RealtimeDataService {
  constructor() {
    this.socket = null;
    this.simInterval = null;
    this.callbacks = new Set();
    this.activeSymbol = null;
    this.lastTick = null;
  }

  subscribe(callback) {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  setActiveAsset(symbol) {
    this.activeSymbol = symbol;
    this.disconnect();
    this.connectWebSocket(symbol);
  }

  connectWebSocket(symbol) {
    const binanceSymbols = {
      BTC: 'btcusdt',
      ETH: 'ethusdt',
      SOL: 'solusdt',
      BNB: 'bnbusdt',
      SUI: 'suiusdt'
    };

    const streamName = binanceSymbols[symbol];
    if (!streamName) {
      this.startSimulation(symbol);
      return;
    }

    try {
      console.log(`[RealtimeDataService] Connecting to Binance WebSocket for ${symbol}...`);
      this.socket = new WebSocket(`wss://stream.binance.com:9443/ws/${streamName}@kline_1d`);

      this.socket.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        if (msg.e === 'kline') {
          const k = msg.k;
          const tick = {
            time: Math.floor(k.t / 1000), // start time of candle in seconds
            open: parseFloat(k.o),
            high: parseFloat(k.h),
            low: parseFloat(k.l),
            close: parseFloat(k.c),
            volume: parseFloat(k.v),
            isRealtime: true
          };
          this.lastTick = tick;
          this.emit(tick);
        }
      };

      this.socket.onerror = (err) => {
        console.warn(`[RealtimeDataService] WebSocket error for ${symbol}, switching to simulation...`);
        this.startSimulation(symbol);
      };

      this.socket.onclose = () => {
        console.log(`[RealtimeDataService] WebSocket closed for ${symbol}.`);
      };
    } catch (err) {
      console.warn(`[RealtimeDataService] Failed to initialize WebSocket:`, err.message);
      this.startSimulation(symbol);
    }
  }

  startSimulation(symbol) {
    this.disconnect();
    console.log(`[RealtimeDataService] Starting live price simulation for ${symbol}...`);

    // Get current state to start simulation from active price
    let basePrice = 100;
    if (window.chartStateManager.history.length > 0) {
      const lastCandle = window.chartStateManager.history[window.chartStateManager.history.length - 1];
      basePrice = lastCandle.close;
    }

    let open = basePrice;
    let high = basePrice;
    let low = basePrice;
    let close = basePrice;
    let volume = 1000;
    const time = Math.floor(Date.now() / 1000);

    this.simInterval = setInterval(() => {
      // Simulate high-frequency price movement (Brownian motion)
      const changePct = (Math.random() - 0.5) * 0.002; // max 0.1% change per tick
      close = close * (1 + changePct);
      high = Math.max(high, close);
      low = Math.min(low, close);
      volume += Math.random() * 50;

      const tick = {
        time: time,
        open,
        high,
        low,
        close,
        volume,
        isRealtime: true
      };
      this.lastTick = tick;
      this.emit(tick);
    }, 1000); // Tick every second
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    if (this.simInterval) {
      clearInterval(this.simInterval);
      this.simInterval = null;
    }
  }

  emit(tick) {
    for (const cb of this.callbacks) {
      cb(tick);
    }
  }
}

window.realtimeDataService = new RealtimeDataService();
