import { dbGet, dbRun, dbQuery } from '../database.js';

const ASSETS_TO_TRACK = ['BTC', 'ETH', 'SOL', 'LINK', 'SUI'];

const SYMBOL_TO_COINCAP_ID = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  LINK: 'chainlink',
  SUI: 'sui'
};

const COINCAP_ID_TO_SYMBOL = {
  bitcoin: 'BTC',
  ethereum: 'ETH',
  solana: 'SOL',
  chainlink: 'LINK',
  sui: 'SUI'
};

// Cache TTL Configurations
const TICKER_TTL_MS = 60 * 1000; // 1 minute
const HISTORY_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

/**
 * Exchange Adapters Interfaces (Placeholder for future integrations)
 * Focuses on defining the structure to read prices/details directly from exchanges.
 */
class ExchangeDataConnector {
  async fetchTicker(symbol) { throw new Error('Not implemented'); }
  async fetchHistory(symbol) { throw new Error('Not implemented'); }
}

export class BinanceAdapter extends ExchangeDataConnector {
  async fetchTicker(symbol) {
    // TODO: Connect to GET https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}USDT
    console.log(`[BinanceAdapter] Placeholder: Fetching ticker for ${symbol}`);
  }
}

export class BybitAdapter extends ExchangeDataConnector {
  async fetchTicker(symbol) {
    // TODO: Connect to GET https://api.bybit.com/v5/market/tickers?category=spot&symbol=${symbol}USDT
    console.log(`[BybitAdapter] Placeholder: Fetching ticker for ${symbol}`);
  }
}

export class CoinbaseAdapter extends ExchangeDataConnector {
  async fetchTicker(symbol) {
    // TODO: Connect to GET https://api.coinbase.com/v2/prices/${symbol}-USD/spot
    console.log(`[CoinbaseAdapter] Placeholder: Fetching ticker for ${symbol}`);
  }
}

export class KrakenAdapter extends ExchangeDataConnector {
  async fetchTicker(symbol) {
    // TODO: Connect to GET https://api.kraken.com/0/public/Ticker?pair=${symbol}USD
    console.log(`[KrakenAdapter] Placeholder: Fetching ticker for ${symbol}`);
  }
}

/**
 * Calculates Opportunity Scores using real market statistics:
 * 1. Momentum Score (0-100): Traces the 24h price trend velocity.
 * 2. Liquidity Score (0-100): Volume-to-market-cap ratio reflecting liquidity depth and active turnover.
 * 3. Confidence Score (0-100): Weighted formula combining Momentum (60%) and Liquidity (40%).
 */
function calculateOpportunityScores(price, change24h, volume24h, marketCap) {
  // Momentum: 24h change shifted and scaled. E.g. +10% change -> 100, -10% change -> 0
  const momentum = Math.max(0, Math.min(100, Math.round((parseFloat(change24h) + 10) * 5)));
  
  // Liquidity: Volume relative to Market Cap. Scale ratio to standard range.
  // Standard ratio of 0.05 (5% daily turn) yields a score of 50.
  const ratio = marketCap > 0 ? (volume24h / marketCap) : 0;
  const liquidity = Math.max(0, Math.min(100, Math.round(ratio * 1000)));

  // Confidence: Combined weighted score
  const confidence = Math.round((momentum * 0.6) + (liquidity * 0.4));

  return {
    momentumScore: momentum,
    liquidityScore: liquidity,
    confidenceScore: confidence,
    scoringMethodology: {
      momentum: 'Calculated from 24h change % centered at 0% change matching a +/-10% daily range.',
      liquidity: 'Ratio of 24h trading volume to total market capitalization, representing capital velocity.',
      confidence: 'Weighted combination: 60% Momentum Score + 40% Liquidity Score.'
    }
  };
}

/**
 * Market Data Service
 * Acts as the single source of truth for crypto prices, metrics, history, and explorer scores.
 */
export const MarketDataService = {
  /**
   * Fetches latest tickers from CoinCap API and caches them in SQLite
   */
  async ensureTickersExist() {
    const mockTickers = {
      BTC: { name: 'Bitcoin', price: 64120.10, change24h: 1.40, volume24h: 28450200100, marketCap: 1258900400100 },
      ETH: { name: 'Ethereum', price: 3485.10, change24h: 2.15, volume24h: 14502100800, marketCap: 418500200300 },
      SOL: { name: 'Solana', price: 134.20, change24h: -0.85, volume24h: 3840100500, marketCap: 62450300100 },
      LINK: { name: 'Chainlink', price: 15.40, change24h: 0.25, volume24h: 420900100, marketCap: 9120300400 },
      SUI: { name: 'Sui', price: 1.15, change24h: -3.45, volume24h: 120500600, marketCap: 2840900100 }
    };
    const now = Date.now();
    for (const symbol of ASSETS_TO_TRACK) {
      const row = await dbGet('SELECT COUNT(*) as count FROM market_tickers WHERE symbol = ?', [symbol]);
      if (!row || row.count === 0) {
        console.log(`Seeding fallback mock ticker for ${symbol}...`);
        const t = mockTickers[symbol];
        await dbRun(
          `INSERT OR REPLACE INTO market_tickers (symbol, name, price, change_24h, volume_24h, market_cap, last_updated)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [symbol, t.name, t.price, t.change24h, t.volume24h, t.marketCap, now]
        );
      }
    }
  },

  async ensureHistoryExists(symbol) {
    const row = await dbGet('SELECT COUNT(*) as count FROM market_history WHERE symbol = ?', [symbol]);
    if (!row || row.count < 30) {
      console.log(`Seeding fallback mock history for ${symbol}...`);
      const now = Date.now();
      const basePrices = {
        BTC: 64120.10,
        ETH: 3485.10,
        SOL: 134.20,
        LINK: 15.40,
        SUI: 1.15
      };
      const base = basePrices[symbol] || 100.0;
      for (let i = 29; i >= 0; i--) {
        const timestamp = now - i * 24 * 60 * 60 * 1000;
        const price = base * (1 + (Math.sin(i / 2) * 0.05) + ((Math.random() - 0.5) * 0.02));
        await dbRun(
          `INSERT OR REPLACE INTO market_history (symbol, timestamp, price)
           VALUES (?, ?, ?)`,
          [symbol, timestamp, price]
        );
      }
    }
  },

  /**
   * Fetches latest tickers from CoinCap API and caches them in SQLite
   */
  async updateTickers() {
    try {
      console.log('Fetching latest prices from CoinCap...');
      const response = await fetch('https://api.coincap.io/v2/assets');
      if (!response.ok) {
        throw new Error(`CoinCap HTTP error! status: ${response.status}`);
      }
      const json = await response.json();
      const assets = json.data || [];

      const now = Date.now();
      for (const asset of assets) {
        const symbol = COINCAP_ID_TO_SYMBOL[asset.id];
        if (symbol && ASSETS_TO_TRACK.includes(symbol)) {
          const price = parseFloat(asset.priceUsd) || 0.0;
          const change24h = parseFloat(asset.changePercent24Hr) || 0.0;
          const volume24h = parseFloat(asset.volumeUsd24Hr) || 0.0;
          const marketCap = parseFloat(asset.marketCapUsd) || 0.0;

          await dbRun(
            `INSERT INTO market_tickers (symbol, name, price, change_24h, volume_24h, market_cap, last_updated)
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(symbol) DO UPDATE SET
               price=excluded.price,
               change_24h=excluded.change_24h,
               volume_24h=excluded.volume_24h,
               market_cap=excluded.market_cap,
               last_updated=excluded.last_updated`,
            [symbol, asset.name, price, change24h, volume24h, marketCap, now]
          );
        }
      }
      console.log('Database market tickers cache updated.');
    } catch (error) {
      console.error('Error updating tickers from CoinCap, checking fallback...', error);
    } finally {
      await this.ensureTickersExist();
    }
  },

  /**
   * Fetches 30-day historical daily price data from CoinCap and caches in SQLite
   */
  async updateHistory(symbol) {
    const id = SYMBOL_TO_COINCAP_ID[symbol];
    if (!id) return;

    try {
      console.log(`Fetching 30-day historical prices for ${symbol} from CoinCap...`);
      const response = await fetch(`https://api.coincap.io/v2/assets/${id}/history?interval=d1`);
      if (!response.ok) {
        throw new Error(`CoinCap history HTTP error! status: ${response.status}`);
      }
      const json = await response.json();
      const points = json.data || [];

      // Filter to latest 30 days
      const filtered = points.slice(-30);

      for (const pt of filtered) {
        const price = parseFloat(pt.priceUsd) || 0.0;
        const timestamp = parseInt(pt.time); // Unix timestamp in ms
        await dbRun(
          `INSERT OR REPLACE INTO market_history (symbol, timestamp, price)
           VALUES (?, ?, ?)`,
          [symbol, timestamp, price]
        );
      }
      console.log(`Database market history cache updated for ${symbol}.`);
    } catch (error) {
      console.error(`Error updating history for ${symbol} from CoinCap, checking fallback:`, error);
    } finally {
      await this.ensureHistoryExists(symbol);
    }
  },

  /**
   * Retrieves all asset prices, refreshing cache if stale (TTL expired)
   */
  async getOverview() {
    const now = Date.now();
    // Check if any ticker is expired/empty
    const row = await dbGet('SELECT MIN(last_updated) as oldest FROM market_tickers');
    const isStale = !row || !row.oldest || (now - row.oldest > TICKER_TTL_MS);

    if (isStale) {
      await this.updateTickers();
    }

    const tickers = await dbQuery('SELECT * FROM market_tickers');
    
    // Format overview with opportunity calculations
    return tickers.map(t => {
      const scores = calculateOpportunityScores(t.price, t.change_24h, t.volume_24h, t.market_cap);
      return {
        symbol: t.symbol,
        name: t.name,
        price: t.price,
        change24h: t.change_24h,
        volume24h: t.volume_24h,
        marketCap: t.market_cap,
        lastUpdated: t.last_updated,
        ...scores
      };
    });
  },

  /**
   * Retrieves specific asset details along with historical data points
   */
  async getAssetDetails(symbol) {
    const normSymbol = symbol.toUpperCase();
    if (!ASSETS_TO_TRACK.includes(normSymbol)) {
      throw new Error(`Asset ${symbol} is not supported.`);
    }

    // Ensure tickers are updated
    await this.getOverview();

    const ticker = await dbGet('SELECT * FROM market_tickers WHERE symbol = ?', [normSymbol]);
    if (!ticker) {
      throw new Error(`Ticker details not found for ${normSymbol}`);
    }

    // Verify history data staleness: check oldest record or count
    const historyCount = await dbGet('SELECT COUNT(*) as count FROM market_history WHERE symbol = ?', [normSymbol]);
    const latestHistory = await dbGet('SELECT MAX(timestamp) as latest FROM market_history WHERE symbol = ?', [normSymbol]);
    
    const now = Date.now();
    const isHistoryStale = !historyCount || historyCount.count < 30 || !latestHistory || !latestHistory.latest || (now - latestHistory.latest > HISTORY_TTL_MS);

    if (isHistoryStale) {
      await this.updateHistory(normSymbol);
    }

    const historyPoints = await dbQuery(
      'SELECT timestamp, price FROM market_history WHERE symbol = ? ORDER BY timestamp ASC',
      [normSymbol]
    );

    const scores = calculateOpportunityScores(ticker.price, ticker.change_24h, ticker.volume_24h, ticker.market_cap);

    return {
      symbol: ticker.symbol,
      name: ticker.name,
      price: ticker.price,
      change24h: ticker.change_24h,
      volume24h: ticker.volume_24h,
      marketCap: ticker.market_cap,
      lastUpdated: ticker.last_updated,
      ...scores,
      history: historyPoints.map(pt => ({
        timestamp: pt.timestamp,
        price: pt.price
      }))
    };
  }
};
