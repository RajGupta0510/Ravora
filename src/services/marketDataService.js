import { dbGet, dbRun, dbQuery } from '../database.js';
import { SUPPORTED_ASSETS, ASSETS_TO_TRACK, TICKER_TTL_MS, HISTORY_TTL_MS } from '../config/marketConfig.js';
import { CoinCapProvider } from './marketData/providers/coinCapProvider.js';
import { BinanceProvider } from './marketData/providers/binanceProvider.js';

const coinCapProvider = new CoinCapProvider();
const binanceProvider = new BinanceProvider();

export const MarketDataService = {
  /**
   * Fetches latest tickers from CoinCap and Binance and coordinates them
   */
  async updateTickers() {
    try {
      console.log('Fetching live tickers from providers...');
      let binanceTickers = [];
      let coinCapTickers = [];

      // 1. Try fetching from Binance
      try {
        binanceTickers = await binanceProvider.fetchTickers();
      } catch (err) {
        console.error('Binance ticker fetch failed, falling back to CoinCap:', err.message);
      }

      // 2. Try fetching from CoinCap (needed for Market Cap and as fallback)
      try {
        coinCapTickers = await coinCapProvider.fetchTickers();
      } catch (err) {
        console.error('CoinCap ticker fetch failed:', err.message);
      }

      const now = Date.now();

      // 3. Coordinate and merge results
      for (const symbol of ASSETS_TO_TRACK) {
        const binanceT = binanceTickers.find(t => t.symbol === symbol);
        const coinCapT = coinCapTickers.find(t => t.symbol === symbol);

        if (binanceT || coinCapT) {
          const name = binanceT?.name || coinCapT?.name || symbol;
          const price = binanceT?.price || coinCapT?.price || 0.0;
          const change24h = binanceT !== undefined ? binanceT.change24h : (coinCapT !== undefined ? coinCapT.change24h : 0.0);
          const volume24h = binanceT?.volume24h || coinCapT?.volume24h || 0.0;
          // Market Cap comes from CoinCap; estimate if down
          const marketCap = coinCapT?.marketCap || (price > 0 ? price * 1e8 : 0.0);

          await dbRun(
            `INSERT INTO market_tickers (symbol, name, price, change_24h, volume_24h, market_cap, last_updated)
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(symbol) DO UPDATE SET
               price=excluded.price,
               change_24h=excluded.change_24h,
               volume_24h=excluded.volume_24h,
               market_cap=excluded.market_cap,
               last_updated=excluded.last_updated`,
            [symbol, name, price, change24h, volume24h, marketCap, now]
          );
        }
      }
      console.log('Database market tickers cache updated successfully.');
    } catch (error) {
      console.error('Critical error updating tickers:', error);
    } finally {
      // Double check all assets have at least a fallback record in case everything is down
      await this.ensureTickersExist();
    }
  },

  async ensureTickersExist() {
    const mockTickers = SUPPORTED_ASSETS.reduce((acc, a) => {
      acc[a.symbol] = {
        name: a.name,
        price: a.fallbackPrice,
        change24h: 1.25,
        volume24h: a.fallbackVolume,
        marketCap: a.fallbackMarketCap
      };
      return acc;
    }, {});
    const now = Date.now();
    for (const symbol of ASSETS_TO_TRACK) {
      const row = await dbGet('SELECT COUNT(*) as count FROM market_tickers WHERE symbol = ?', [symbol]);
      if (!row || row.count === 0) {
        console.log(`[MarketDataService] Seeding fallback mock ticker for ${symbol}...`);
        const t = mockTickers[symbol];
        await dbRun(
          `INSERT OR REPLACE INTO market_tickers (symbol, name, price, change_24h, volume_24h, market_cap, last_updated)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [symbol, t.name, t.price, t.change24h, t.volume24h, t.marketCap, now]
        );
      }
    }
  },

  /**
   * Fetches history points (OHLCV) from Binance with CoinCap as fallback
   */
  async updateHistory(symbol) {
    try {
      console.log(`Updating history cache for ${symbol}...`);
      let points = [];

      // 1. Try Binance (true OHLCV)
      try {
        points = await binanceProvider.fetchHistory(symbol);
      } catch (err) {
        console.error(`Binance history fetch failed for ${symbol}, trying CoinCap:`, err.message);
        // 2. Try CoinCap (price only)
        try {
          points = await coinCapProvider.fetchHistory(symbol);
        } catch (ccErr) {
          console.error(`CoinCap history fetch failed for ${symbol}:`, ccErr.message);
        }
      }

      // 3. Cache normalized points in DB
      if (points && points.length > 0) {
        for (const pt of points) {
          await dbRun(
            `INSERT OR REPLACE INTO market_history (symbol, timestamp, open, high, low, close, volume)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [symbol, pt.timestamp, pt.open, pt.high, pt.low, pt.close, pt.volume]
          );
        }
        console.log(`Database market history cache updated for ${symbol}.`);
      }
    } catch (error) {
      console.error(`Critical error updating history for ${symbol}:`, error);
    } finally {
      await this.ensureHistoryExists(symbol);
    }
  },

  async ensureHistoryExists(symbol) {
    const row = await dbGet('SELECT COUNT(*) as count FROM market_history WHERE symbol = ?', [symbol]);
    if (!row || row.count < 30) {
      console.log(`[MarketDataService] Seeding fallback mock history for ${symbol}...`);
      const now = Date.now();
      const asset = SUPPORTED_ASSETS.find(a => a.symbol === symbol);
      const base = asset ? asset.fallbackPrice : 100.0;
      for (let i = 29; i >= 0; i--) {
        const timestamp = now - i * 24 * 60 * 60 * 1000;
        const open = base * (1 + (Math.sin(i / 2) * 0.05) + ((Math.random() - 0.5) * 0.02));
        const close = open * (1 + ((Math.random() - 0.5) * 0.015));
        const high = Math.max(open, close) * (1 + Math.random() * 0.01);
        const low = Math.min(open, close) * (1 - Math.random() * 0.01);
        const volume = (base * 1000) * (1 + Math.random() * 0.5);

        await dbRun(
          `INSERT OR REPLACE INTO market_history (symbol, timestamp, open, high, low, close, volume)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [symbol, timestamp, open, high, low, close, volume]
        );
      }
    }
  },

  /**
   * Retrieves all asset prices, refreshing cache if stale
   */
  async getOverview() {
    const now = Date.now();
    const row = await dbGet('SELECT MIN(last_updated) as oldest FROM market_tickers');
    const isStale = !row || !row.oldest || (now - row.oldest > TICKER_TTL_MS);

    if (isStale) {
      await this.updateTickers();
    }

    const tickers = await dbQuery('SELECT * FROM market_tickers');
    return tickers.map(t => ({
      symbol: t.symbol,
      name: t.name,
      price: t.price,
      change24h: t.change_24h,
      volume24h: t.volume_24h,
      marketCap: t.market_cap,
      lastUpdated: t.last_updated
    }));
  },

  /**
   * Retrieves specific asset details along with historical data points
   */
  async getAssetDetails(symbol) {
    const normSymbol = symbol.toUpperCase();
    if (!ASSETS_TO_TRACK.includes(normSymbol)) {
      throw new Error(`Asset ${symbol} is not supported.`);
    }

    // Update tickers if stale
    await this.getOverview();

    const ticker = await dbGet('SELECT * FROM market_tickers WHERE symbol = ?', [normSymbol]);
    if (!ticker) {
      throw new Error(`Ticker details not found for ${normSymbol}`);
    }

    // Verify history data staleness
    const historyCount = await dbGet('SELECT COUNT(*) as count FROM market_history WHERE symbol = ?', [normSymbol]);
    const latestHistory = await dbGet('SELECT MAX(timestamp) as latest FROM market_history WHERE symbol = ?', [normSymbol]);
    
    const now = Date.now();
    const isHistoryStale = !historyCount || historyCount.count < 30 || !latestHistory || !latestHistory.latest || (now - latestHistory.latest > HISTORY_TTL_MS);

    if (isHistoryStale) {
      await this.updateHistory(normSymbol);
    }

    const historyPoints = await dbQuery(
      'SELECT timestamp, open, high, low, close, volume FROM market_history WHERE symbol = ? ORDER BY timestamp ASC',
      [normSymbol]
    );

    return {
      symbol: ticker.symbol,
      name: ticker.name,
      price: ticker.price,
      change24h: ticker.change_24h,
      volume24h: ticker.volume_24h,
      marketCap: ticker.market_cap,
      lastUpdated: ticker.last_updated,
      history: historyPoints.map(pt => ({
        timestamp: pt.timestamp,
        open: pt.open,
        high: pt.high,
        low: pt.low,
        close: pt.close,
        volume: pt.volume
      }))
    };
  }
};
