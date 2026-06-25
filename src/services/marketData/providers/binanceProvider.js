import { MarketDataProvider } from './providerInterface.js';
import { ASSETS_TO_TRACK, SYMBOL_TO_BINANCE_SYMBOL, BINANCE_SYMBOL_TO_SYMBOL } from '../../../config/marketConfig.js';

export class BinanceProvider extends MarketDataProvider {
  async fetchTickers() {
    console.log('[BinanceProvider] Fetching prices from Binance 24h ticker API...');
    const symbolsParam = JSON.stringify(ASSETS_TO_TRACK.map(s => SYMBOL_TO_BINANCE_SYMBOL[s]));
    
    // Fetch ticker updates for all target symbols in a single request
    const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(symbolsParam)}`);
    if (!response.ok) {
      throw new Error(`Binance ticker HTTP error! status: ${response.status}`);
    }
    const tickers = await response.json();
    
    const assetNames = {
      BTC: 'Bitcoin',
      ETH: 'Ethereum',
      SOL: 'Solana',
      BNB: 'Binance Coin',
      SUI: 'Sui'
    };

    return tickers.map(t => {
      const symbol = BINANCE_SYMBOL_TO_SYMBOL[t.symbol];
      return {
        symbol,
        name: assetNames[symbol] || symbol,
        price: parseFloat(t.lastPrice) || 0.0,
        change24h: parseFloat(t.priceChangePercent) || 0.0,
        volume24h: parseFloat(t.quoteVolume) || 0.0, // Volume in USDT
        marketCap: 0.0, // Binance does not track market capitalization
        lastUpdated: Date.now()
      };
    });
  }

  async fetchHistory(symbol) {
    const binanceSymbol = SYMBOL_TO_BINANCE_SYMBOL[symbol];
    if (!binanceSymbol) throw new Error(`Unsupported symbol for Binance: ${symbol}`);

    console.log(`[BinanceProvider] Fetching daily OHLCV klines for ${symbol} (${binanceSymbol}) from Binance...`);
    const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=1d&limit=30`);
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
      volume: parseFloat(k[7]) // Quote asset volume (USDT/USD)
    }));
  }
}
