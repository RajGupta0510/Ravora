import { MarketDataProvider } from './providerInterface.js';
import { SUPPORTED_ASSETS, ASSETS_TO_TRACK, SYMBOL_TO_BINANCE_SYMBOL, BINANCE_SYMBOL_TO_SYMBOL } from '../../../config/marketConfig.js';

// Fetch with a 5-second timeout to prevent hanging on slow/unavailable APIs
const fetchWithTimeout = (url, timeoutMs = 5000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { signal: controller.signal })
    .finally(() => clearTimeout(timer));
};

export class BinanceProvider extends MarketDataProvider {
  async fetchTickers() {
    console.log('[BinanceProvider] Fetching prices from Binance 24h ticker API...');
    const symbolsParam = JSON.stringify(ASSETS_TO_TRACK.map(s => SYMBOL_TO_BINANCE_SYMBOL[s]));
    
    const response = await fetchWithTimeout(`https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(symbolsParam)}`);
    if (!response.ok) {
      throw new Error(`Binance ticker HTTP error! status: ${response.status}`);
    }
    const tickers = await response.json();
    
    const assetNames = SUPPORTED_ASSETS.reduce((acc, a) => {
      acc[a.symbol] = a.name;
      return acc;
    }, {});

    return tickers.map(t => {
      const symbol = BINANCE_SYMBOL_TO_SYMBOL[t.symbol];
      return {
        symbol,
        name: assetNames[symbol] || symbol,
        price: parseFloat(t.lastPrice) || 0.0,
        change24h: parseFloat(t.priceChangePercent) || 0.0,
        volume24h: parseFloat(t.quoteVolume) || 0.0,
        marketCap: 0.0,
        lastUpdated: Date.now()
      };
    });
  }

  async fetchHistory(symbol, interval = '1d', limit = 100) {
    const binanceSymbol = SYMBOL_TO_BINANCE_SYMBOL[symbol];
    if (!binanceSymbol) throw new Error(`Unsupported symbol for Binance: ${symbol}`);

    console.log(`[BinanceProvider] Fetching OHLCV klines for ${symbol} (${interval}) from Binance...`);
    const response = await fetchWithTimeout(`https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=${interval}&limit=${limit}`);
    if (!response.ok) {
      throw new Error(`Binance klines HTTP error! status: ${response.status}`);
    }
    const klines = await response.json();
    
    return klines.map(k => ({
      timestamp: parseInt(k[0]),
      open: parseFloat(k[1]),
      high: parseFloat(k[2]),
      low: parseFloat(k[3]),
      close: parseFloat(k[4]),
      volume: parseFloat(k[7])
    }));
  }
}
