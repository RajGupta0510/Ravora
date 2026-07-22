/**
 * Market Sync Worker — fetches live prices from market providers and updates cache.
 */

import { MarketProviderFactory } from '../../market/MarketProviderFactory.js';
import { MarketDataService } from '../../services/MarketDataService.js';
import { PriceChannel } from '../../websocket/channels/PriceChannel.js';
import { logger } from '../../utils/logger.js';

export async function marketSyncWorker() {
  try {
    const tickers = await MarketProviderFactory.fetchTickersWithFallback();

    if (tickers.length > 0) {
      // Persist to database
      await MarketDataService.persistTickers(tickers);

      // Broadcast to WebSocket subscribers
      PriceChannel.broadcast(tickers);

      // Process pending virtual paper orders with the new market prices
      const { PaperTradingService } = await import('../../services/PaperTradingService.js');
      await PaperTradingService.processPendingOrders().catch(() => null);
    }
  } catch (err) {
    logger.error('MarketSyncWorker', 'Failed to sync market data', { error: err.message });
  }
}
