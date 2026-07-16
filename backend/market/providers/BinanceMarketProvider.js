import { MarketProviderInterface } from '../MarketProviderInterface.js';

const SYMBOL_MAP = { BTC: 'BTCUSDT', ETH: 'ETHUSDT', SOL: 'SOLUSDT', XRP: 'XRPUSDT', ADA: 'ADAUSDT', DOGE: 'DOGEUSDT', AVAX: 'AVAXUSDT', DOT: 'DOTUSDT', LINK: 'LINKUSDT', MATIC: 'MATICUSDT' };
const NAME_MAP = { BTC: 'Bitcoin', ETH: 'Ethereum', SOL: 'Solana', XRP: 'XRP', ADA: 'Cardano', DOGE: 'Dogecoin', AVAX: 'Avalanche', DOT: 'Polkadot', LINK: 'Chainlink', MATIC: 'Polygon' };

export class BinanceMarketProvider extends MarketProviderInterface {
  constructor() {
    super('Binance');
    this.baseUrl = 'https://api.binance.com';
  }

  async fetchTickers(symbols = Object.keys(SYMBOL_MAP)) {
    const response = await fetch(`${this.baseUrl}/api/v3/ticker/24hr`);
    if (!response.ok) throw new Error(`Binance API error: ${response.status}`);
    const allTickers = await response.json();

    const binanceSymbols = symbols.map(s => SYMBOL_MAP[s] || `${s}USDT`);

    return allTickers
      .filter(t => binanceSymbols.includes(t.symbol))
      .map(t => {
        const baseSymbol = t.symbol.replace('USDT', '');
        return {
          symbol: baseSymbol,
          name: NAME_MAP[baseSymbol] || baseSymbol,
          price: parseFloat(t.lastPrice),
          change24h: parseFloat(t.priceChangePercent),
          volume24h: parseFloat(t.quoteVolume),
          marketCap: 0, // Binance doesn't provide market cap
        };
      });
  }

  async fetchHistory(symbol, days = 30) {
    const binanceSymbol = SYMBOL_MAP[symbol] || `${symbol}USDT`;
    const interval = '1d';
    const limit = days;
    const response = await fetch(`${this.baseUrl}/api/v3/klines?symbol=${binanceSymbol}&interval=${interval}&limit=${limit}`);
    if (!response.ok) throw new Error(`Binance history API error: ${response.status}`);
    const data = await response.json();

    return data.map(k => ({
      timestamp: k[0],
      open: parseFloat(k[1]),
      high: parseFloat(k[2]),
      low: parseFloat(k[3]),
      close: parseFloat(k[4]),
      volume: parseFloat(k[5]),
    }));
  }
}
