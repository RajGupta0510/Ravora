import { MarketProviderInterface } from '../MarketProviderInterface.js';

const COINGECKO_IDS = { BTC: 'bitcoin', ETH: 'ethereum', SOL: 'solana', XRP: 'ripple', ADA: 'cardano', DOGE: 'dogecoin', AVAX: 'avalanche-2', DOT: 'polkadot', LINK: 'chainlink', MATIC: 'matic-network' };
const REVERSE_MAP = Object.fromEntries(Object.entries(COINGECKO_IDS).map(([k, v]) => [v, k]));

export class CoinGeckoMarketProvider extends MarketProviderInterface {
  constructor() {
    super('CoinGecko');
    this.baseUrl = 'https://api.coingecko.com/api/v3';
  }

  async fetchTickers(symbols = Object.keys(COINGECKO_IDS)) {
    const ids = symbols.map(s => COINGECKO_IDS[s]).filter(Boolean).join(',');
    if (!ids) return [];

    const response = await fetch(`${this.baseUrl}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=false`);
    if (!response.ok) throw new Error(`CoinGecko API error: ${response.status}`);
    const data = await response.json();

    return data.map(coin => ({
      symbol: REVERSE_MAP[coin.id] || coin.symbol.toUpperCase(),
      name: coin.name,
      price: coin.current_price,
      change24h: coin.price_change_percentage_24h || 0,
      volume24h: coin.total_volume || 0,
      marketCap: coin.market_cap || 0,
    }));
  }

  async fetchHistory(symbol, days = 30) {
    const geckoId = COINGECKO_IDS[symbol];
    if (!geckoId) throw new Error(`Symbol ${symbol} not mapped to CoinGecko`);

    const response = await fetch(`${this.baseUrl}/coins/${geckoId}/ohlc?vs_currency=usd&days=${days}`);
    if (!response.ok) throw new Error(`CoinGecko history API error: ${response.status}`);
    const data = await response.json();

    return data.map(([timestamp, open, high, low, close]) => ({
      timestamp, open, high, low, close, volume: 0,
    }));
  }
}
