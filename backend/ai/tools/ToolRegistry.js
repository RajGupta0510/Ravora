import { PortfolioIntelligenceService } from '../../services/PortfolioIntelligenceService.js';
import { MarketDataService } from '../../services/MarketDataService.js';
import { WatchlistService } from '../../services/WatchlistService.js';
import { getSupabaseAdmin } from '../../config/database.js';
import { OrderRepository } from '../../repositories/OrderRepository.js';
import { ExecutionRepository } from '../../repositories/ExecutionRepository.js';
import { logger } from '../../utils/logger.js';

const orderRepo = new OrderRepository();
const execRepo = new ExecutionRepository();

export const ToolRegistry = {
  /**
   * Securely gathers the portfolio balance, equity, and asset splits.
   */
  async getPortfolioContext(userId) {
    try {
      const summary = await PortfolioIntelligenceService.calculatePerformanceSummary(userId);
      const allocations = await PortfolioIntelligenceService.calculateAllocationAnalysis(userId);
      const raw = await PortfolioIntelligenceService.getRawPortfolioData(userId);
      
      return {
        valuation: summary,
        allocations: allocations,
        riskStance: raw.profile?.risk_stance || 'balanced',
        maxDrawdownCap: raw.profile?.max_drawdown_cap || 3.5,
        assets: raw.assets.map(a => ({
          symbol: a.asset_symbol,
          balance: parseFloat(a.balance_amount || 0),
          entryPrice: parseFloat(a.average_entry_price || 0),
          positionType: a.position_type || 'long',
          leverage: parseFloat(a.leverage || 1.0)
        }))
      };
    } catch (err) {
      logger.error('ToolRegistry', 'Error fetching portfolio context', { error: err.message });
      return { error: 'Portfolio data unavailable.' };
    }
  },

  /**
   * Gathers live market prices, sentiment trends, and tickers.
   */
  async getMarketContext() {
    try {
      const overview = await MarketDataService.getOverview();
      const gainers = await MarketDataService.getTopGainers();
      const losers = await MarketDataService.getTopLosers();
      const trending = await MarketDataService.getTrendingMarkets();
      
      return {
        overview: overview.map(o => ({
          symbol: o.symbol,
          price: o.price,
          change24h: o.change24h,
          volume24h: o.volume24h
        })),
        gainers,
        losers,
        trending
      };
    } catch (err) {
      logger.error('ToolRegistry', 'Error fetching market context', { error: err.message });
      return { error: 'Market data unavailable.' };
    }
  },

  /**
   * Retrieves connection statuses for linked exchange APIs.
   */
  async getExchangeContext(userId) {
    try {
      const db = getSupabaseAdmin();
      const { data: accounts } = await db
        .from('connected_exchanges')
        .select('id, exchange_name, status, created_at')
        .eq('user_id', userId);

      return accounts || [];
    } catch (err) {
      logger.error('ToolRegistry', 'Error fetching exchange context', { error: err.message });
      return [];
    }
  },

  /**
   * Calculates comprehensive risk vectors including HHI concentration index, leverage ratios, and drawdowns.
   */
  async getRiskContext(userId) {
    try {
      const metrics = await PortfolioIntelligenceService.calculateRiskMetrics(userId);
      return metrics;
    } catch (err) {
      logger.error('ToolRegistry', 'Error fetching risk context', { error: err.message });
      return { error: 'Risk metrics calculation failed.' };
    }
  },

  /**
   * Retrieves user's watchlist symbol tokens.
   */
  async getWatchlistContext(userId) {
    try {
      const db = getSupabaseAdmin();
      const { data } = await db
        .from('watchlists')
        .select('symbol')
        .eq('user_id', userId);
        
      return (data || []).map(w => w.symbol);
    } catch (err) {
      logger.error('ToolRegistry', 'Error fetching watchlist context', { error: err.message });
      return [];
    }
  },

  /**
   * Extracts historical order logs and fill executions.
   */
  async getTradeHistoryContext(userId) {
    try {
      const { data: orders } = await orderRepo.findByUserId(userId, { limit: 10 });
      const { data: executions } = await execRepo.findByUserId(userId, { limit: 10 });
      
      return {
        recentOrders: orders || [],
        recentExecutions: executions || []
      };
    } catch (err) {
      logger.error('ToolRegistry', 'Error fetching trade history context', { error: err.message });
      return { recentOrders: [], recentExecutions: [] };
    }
  },

  /**
   * Gathers notification counts.
   */
  async getNotificationContext(userId) {
    try {
      const db = getSupabaseAdmin();
      const { count } = await db
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);
        
      return { unreadNotificationsCount: count || 0 };
    } catch (err) {
      logger.error('ToolRegistry', 'Error fetching notification context', { error: err.message });
      return { unreadNotificationsCount: 0 };
    }
  }
};
