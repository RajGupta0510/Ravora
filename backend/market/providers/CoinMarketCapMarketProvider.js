import { MarketProviderInterface } from '../MarketProviderInterface.js';

const CMC_SYMBOLS = { BTC: 1, ETH: 1027, SOL: 5426, XRP: 52, ADA: 2011, DOGE: 74, AVAX: 5805, DOT: 6636, LINK: 1975, MATIC: 3890 };

export class CoinMarketCapMarketProvider extends MarketProviderInterface {
  constructor() {
    super('CoinMarketCap');
    this.baseUrl = 'https://pro-api.coinmarketcap.com/v1';
    this.apiKey = process.env.COINMARKETCAP_API_KEY || '';
  }

  async fetchTickers(symbols = Object.keys(CMC_SYMBOLS)) {
    if (!this.apiKey) {
      // Mock/simulate CoinMarketCap data for local development if key is missing
      return symbols.map(s => ({
        symbol: s,
        name: s === 'BTC' ? 'Bitcoin' : (s === 'ETH' ? 'Ethereum' : (s === 'SOL' ? 'Solana' : s)),
        price: s === 'BTC' ? 63314.01 : (s === 'ETH' ? 3485.10 : (s === 'SOL' ? 134.20 : 1.0)),
        change24h: 1.5,
        volume24h: 12000000,
        marketCap: s === 'BTC' ? 1200000000000 : 400000000000
      }));
    }

    try {
      const response = await fetch(`${this.baseUrl}/cryptocurrency/quotes/latest?symbol=${symbols.join(',')}`, {
        headers: {
          'X-CMC_PRO_API_KEY': this.apiKey,
          'Accept': 'application/json'
        }
      });
      if (!response.ok) throw new Error(`CoinMarketCap API error: ${response.status}`);
      const res = await response.json();
      const data = res.data || {};

      return symbols.map(s => {
        const coin = data[s] || {};
        const quote = coin.quote?.USD || {};
        return {
          symbol: s,
          name: coin.name || s,
          price: parseFloat(quote.price || 0),
          change24h: parseFloat(quote.percent_change_24h || 0),
          volume24h: parseFloat(quote.volume_24h || 0),
          marketCap: parseFloat(quote.market_cap || 0),
        };
      });
    } catch (err) {
      throw new Error(`CoinMarketCap fetch failed: ${err.message}`);
    }
  }

  async fetchHistory(symbol, daysOrInterval = 30, limit = 100) {
    // CoinMarketCap historical candles are only available on paid API tiers.
    // Fallback to Binance (primary live history provider).
    try {
      const { BinanceMarketProvider } = await import('./BinanceMarketProvider.js');
      const binance = new BinanceMarketProvider();
      return await binance.fetchHistory(symbol, daysOrInterval, limit);
    } catch (err) {
      // If Binance fails, fallback to CoinGecko
      try {
        const { CoinGeckoMarketProvider } = await import('./CoinGeckoMarketProvider.js');
        const gecko = new CoinGeckoMarketProvider();
        const days = typeof daysOrInterval === 'number' ? daysOrInterval : 30;
        return await gecko.fetchHistory(symbol, days);
      } catch (geckoErr) {
        throw new Error(`Failed to fetch history from fallbacks (Binance & CoinGecko): ${geckoErr.message}`);
      }
    }
  }
}
