import { MarketDataProvider } from './providerInterface.js';
import { ASSETS_TO_TRACK, COINCAP_ID_TO_SYMBOL, SYMBOL_TO_COINCAP_ID } from '../../../config/marketConfig.js';

export class CoinCapProvider extends MarketDataProvider {
  async fetchTickers() {
    console.log('[CoinCapProvider] Fetching prices from CoinCap assets API...');
    const response = await fetch('https://api.coincap.io/v2/assets');
    if (!response.ok) {
      throw new Error(`CoinCap HTTP error! status: ${response.status}`);
    }
    const json = await response.json();
    const assets = json.data || [];
    
    const results = [];
    for (const asset of assets) {
      const symbol = COINCAP_ID_TO_SYMBOL[asset.id];
      if (symbol && ASSETS_TO_TRACK.includes(symbol)) {
        results.push({
          symbol,
          name: asset.name,
          price: parseFloat(asset.priceUsd) || 0.0,
          change24h: parseFloat(asset.changePercent24Hr) || 0.0,
          volume24h: parseFloat(asset.volumeUsd24Hr) || 0.0,
          marketCap: parseFloat(asset.marketCapUsd) || 0.0,
          lastUpdated: Date.now()
        });
      }
    }
    return results;
  }

  async fetchHistory(symbol) {
    const id = SYMBOL_TO_COINCAP_ID[symbol];
    if (!id) throw new Error(`Unsupported symbol for CoinCap: ${symbol}`);

    console.log(`[CoinCapProvider] Fetching price history for ${symbol} (${id}) from CoinCap...`);
    const response = await fetch(`https://api.coincap.io/v2/assets/${id}/history?interval=d1`);
    if (!response.ok) {
      throw new Error(`CoinCap history HTTP error! status: ${response.status}`);
    }
    const json = await response.json();
    const points = json.data || [];
    
    // Filter to last 30 daily data points
    const filtered = points.slice(-30);
    
    return filtered.map(pt => {
      const price = parseFloat(pt.priceUsd) || 0.0;
      return {
        timestamp: parseInt(pt.time),
        open: price,
        high: price,
        low: price,
        close: price,
        volume: 0.0 // CoinCap history does not provide volume in /history endpoint
      };
    });
  }
}
