/**
 * Ravora Backend V1 — Paper Trading Controller
 * Manages virtual portfolios, places limit/stop/market orders, and returns performance analytics.
 * Fully backwards-compatible with legacy opportunity-based triggers.
 */

import { PaperTradingService } from '../services/PaperTradingService.js';
import { MarketDataService } from '../services/MarketDataService.js';
import { getSupabaseAdmin } from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';

export const PaperTradingController = {
  /**
   * Retrieves cash balance, net equity, and buying power
   */
  async getAccount(req, res, next) {
    try {
      const account = await PaperTradingService.getAccount(req.user.id);
      const positions = await PaperTradingService.getOpenPositions(req.user.id);

      // Compute unrealized PnL across all open positions
      let unrealizedPnL = 0;
      for (const pos of positions) {
        const currentPrice = await MarketDataService.getCurrentPrice(pos.symbol);
        const entryPrice = parseFloat(pos.entry_price);
        const quantity = parseFloat(pos.quantity);
        const leverage = parseFloat(pos.leverage || 1.0);
        const multiplier = pos.side === 'long' ? 1 : -1;
        unrealizedPnL += (currentPrice - entryPrice) * quantity * multiplier * leverage;
      }

      const balance = parseFloat(account.balance);
      const equity = balance + unrealizedPnL;
      const buyingPower = equity * 10.0; // standard 10x margin buying power representation

      return res.json({
        id: account.id,
        balance,
        equity,
        buyingPower,
        initialBalance: parseFloat(account.initial_balance),
        currency: account.currency
      });
    } catch (err) { 
      next(err); 
    }
  },

  /**
   * Returns active open positions
   */
  async getPositions(req, res, next) {
    try {
      const positions = await PaperTradingService.getOpenPositions(req.user.id);
      
      const formatted = await Promise.all(positions.map(async (pos) => {
        const currentPrice = await MarketDataService.getCurrentPrice(pos.symbol);
        const entryPrice = parseFloat(pos.entry_price);
        const quantity = parseFloat(pos.quantity);
        const leverage = parseFloat(pos.leverage || 1.0);
        
        // Calculate P&L
        const multiplier = pos.side === 'long' ? 1 : -1;
        const unrealizedPnL = (currentPrice - entryPrice) * quantity * multiplier * leverage;
        const marginUsed = (entryPrice * quantity) / leverage;
        const percentageReturn = marginUsed > 0 ? (unrealizedPnL / marginUsed) * 100 : 0;

        // Calculate duration
        const openDate = new Date(pos.created_at);
        const durationMs = Date.now() - openDate.getTime();
        const minutes = Math.floor(durationMs / 60000);
        const hours = Math.floor(minutes / 60);
        let durationStr = `${minutes}m`;
        if (hours > 0) {
          durationStr = `${hours}h ${minutes % 60}m`;
        }

        return {
          id: pos.id,
          symbol: pos.symbol,
          direction: pos.side.toUpperCase(),
          entryPrice,
          currentPrice: currentPrice || entryPrice,
          positionSize: marginUsed, 
          leverage,
          unrealizedPnL,
          percentageReturn,
          distanceToSL: pos.stop_loss ? Math.abs(currentPrice - parseFloat(pos.stop_loss)) : null,
          distanceToTP: pos.take_profit ? Math.abs(parseFloat(pos.take_profit) - currentPrice) : null,
          duration: durationStr,
          status: pos.status.toUpperCase(),
          review: pos.review_json || null
        };
      }));

      return res.json(formatted);
    } catch (err) { 
      next(err); 
    }
  },

  /**
   * Returns closed position history
   */
  async getHistory(req, res, next) {
    try {
      const limit = parseInt(req.query.limit, 10) || 50;
      const history = await PaperTradingService.getTradeHistory(req.user.id, limit);
      
      const formatted = history.map(h => {
        const openDate = new Date(h.created_at);
        const closeDate = h.closed_at ? new Date(h.closed_at) : new Date();
        const durationMs = closeDate.getTime() - openDate.getTime();
        const minutes = Math.floor(durationMs / 60000);
        const hours = Math.floor(minutes / 60);
        let durationStr = `${minutes}m`;
        if (hours > 0) {
          durationStr = `${hours}h ${minutes % 60}m`;
        }

        const entryPrice = parseFloat(h.entry_price);
        const quantity = parseFloat(h.quantity);
        const leverage = parseFloat(h.leverage || 1.0);
        const marginUsed = (entryPrice * quantity) / leverage;

        return {
          id: h.id,
          symbol: h.symbol,
          direction: h.side.toUpperCase(),
          entryPrice,
          exitPrice: parseFloat(h.exit_price || 0),
          positionSize: marginUsed,
          leverage,
          profitLoss: parseFloat(h.pnl || 0),
          openTime: h.created_at,
          closeTime: h.closed_at,
          reasonClosed: 'MANUAL_CLOSE',
          winLoss: parseFloat(h.pnl || 0) >= 0 ? 'WIN' : 'LOSS',
          confidence: 90,
          opportunityScore: 85,
          duration: durationStr,
          review: h.review_json || null,
          notes: h.review_json ? 'Araiven review loaded' : ''
        };
      });

      return res.json(formatted);
    } catch (err) { 
      next(err); 
    }
  },

  /**
   * Places a paper order (handles both legacy and standard payloads)
   */
  async placeOrder(req, res, next) {
    try {
      let { symbol, type, side, quantity, price, leverage = 1.0, stopLoss = null, takeProfit = null } = req.body;
      const { opportunityId, amount } = req.body; // legacy options

      // Fallback for legacy Frontend Opportunity-based placement
      if (opportunityId && amount) {
        const db = getSupabaseAdmin();
        const { data: opp, error } = await db
          .from('opportunities')
          .select('*')
          .eq('id', opportunityId)
          .maybeSingle();

        if (error || !opp) {
          throw ApiError.notFound('Opportunity');
        }

        // Determine symbol
        let targetSymbol = 'ETH';
        if (opp.symbol.toUpperCase().includes('BTC')) targetSymbol = 'BTC';
        else if (opp.symbol.toUpperCase().includes('SOL')) targetSymbol = 'SOL';
        else if (opp.symbol.toUpperCase().includes('BNB')) targetSymbol = 'BNB';

        const currentPrice = await MarketDataService.getCurrentPrice(targetSymbol);
        const entryPrice = currentPrice || parseFloat(opp.suggested_entry || 100.0);

        symbol = targetSymbol;
        type = 'market';
        side = 'buy'; // default legacy action opens position
        quantity = (parseFloat(amount) * parseFloat(leverage)) / entryPrice;
        stopLoss = opp.suggested_stop_loss ? parseFloat(opp.suggested_stop_loss) : null;
        takeProfit = opp.suggested_take_profit ? parseFloat(opp.suggested_take_profit) : null;
      }

      const order = await PaperTradingService.placeOrder(req.user.id, {
        symbol,
        type: type || 'market',
        side: side || 'buy',
        quantity,
        price,
        leverage,
        stopLoss,
        takeProfit
      });

      return res.json({
        success: true,
        orderId: order.id,
        status: order.status,
        clearedPrice: order.filled_price || order.price,
        timestamp: order.created_at
      });
    } catch (err) { 
      next(err); 
    }
  },

  /**
   * Closes a position manually
   */
  async closePosition(req, res, next) {
    try {
      const { id } = req.params;
      const db = getSupabaseAdmin();
      const { data: position, error } = await db
        .from('paper_positions')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error || !position) throw ApiError.notFound('Paper position');

      const price = await MarketDataService.getCurrentPrice(position.symbol);
      const result = await PaperTradingService.closePosition(req.user.id, id, price);

      return res.json({
        status: 'success',
        exitPrice: price,
        pnl: result.pnl
      });
    } catch (err) { 
      next(err); 
    }
  },

  /**
   * Closes all active positions
   */
  async closeAll(req, res, next) {
    try {
      const results = await PaperTradingService.closeAllPositions(
        req.user.id,
        (symbol) => MarketDataService.getCurrentPrice(symbol)
      );
      return res.json(results);
    } catch (err) { 
      next(err); 
    }
  },

  /**
   * Cancels a pending order
   */
  async cancelOrder(req, res, next) {
    try {
      const { id } = req.params;
      const cancelled = await PaperTradingService.cancelOrder(req.user.id, id);
      return res.json({
        success: true,
        order: cancelled
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Resets account balance
   */
  async resetAccount(req, res, next) {
    try {
      const account = await PaperTradingService.resetAccount(req.user.id);
      return res.json({
        status: 'success',
        balance: parseFloat(account.balance)
      });
    } catch (err) { 
      next(err); 
    }
  },

  /**
   * Returns statistics math and streaks
   */
  async getStatistics(req, res, next) {
    try {
      const stats = await PaperTradingService.getStatistics(req.user.id);
      return res.json({
        success: true,
        data: stats
      });
    } catch (err) {
      next(err);
    }
  }
};
