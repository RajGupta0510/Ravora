/**
 * Ravora Backend V1 — Paper Trading Controller
 * Aligned with the legacy controller logic to maintain frontend compatibility.
 */

import { PaperTradingService } from '../services/PaperTradingService.js';
import { MarketDataService } from '../services/MarketDataService.js';
import { getSupabaseAdmin } from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';

export const PaperTradingController = {
  async getAccount(req, res, next) {
    try {
      const account = await PaperTradingService.getAccount(req.user.id);
      return res.json({
        id: account.id,
        balance: parseFloat(account.balance),
        initialBalance: parseFloat(account.initial_balance),
        currency: account.currency
      });
    } catch (err) { next(err); }
  },

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
          positionSize: marginUsed, // Frontend uses margin as positionSize
          leverage,
          unrealizedPnL,
          percentageReturn,
          distanceToSL: pos.stop_loss ? Math.abs(currentPrice - parseFloat(pos.stop_loss)) : null,
          distanceToTP: pos.take_profit ? Math.abs(parseFloat(pos.take_profit) - currentPrice) : null,
          duration: durationStr,
          status: pos.status.toUpperCase()
        };
      }));

      return res.json(formatted);
    } catch (err) { next(err); }
  },

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
          notes: ''
        };
      });

      return res.json(formatted);
    } catch (err) { next(err); }
  },

  async openPosition(req, res, next) {
    try {
      const { opportunityId, amount, type, leverage = 1.0 } = req.body;

      if (!opportunityId || !amount) {
        throw ApiError.badRequest('Opportunity ID and amount are required.');
      }

      // Fetch opportunity from database
      const db = getSupabaseAdmin();
      const { data: opp, error } = await db
        .from('opportunities')
        .select('*')
        .eq('id', opportunityId)
        .maybeSingle();

      if (error || !opp) {
        throw ApiError.notFound('Opportunity');
      }

      // Determine target symbol
      let targetSymbol = 'ETH';
      if (opp.symbol.includes('BTC')) targetSymbol = 'BTC';
      else if (opp.symbol.includes('SOL')) targetSymbol = 'SOL';
      else if (opp.symbol.includes('BNB')) targetSymbol = 'BNB';
      else if (opp.symbol.includes('SUI')) targetSymbol = 'SUI';

      // Fetch live price
      const price = await MarketDataService.getCurrentPrice(targetSymbol);
      const entryPrice = price || parseFloat(opp.suggested_entry || 100.0);

      // positionSize is margin amount. We need to compute total quantity:
      // (amount * leverage) / entryPrice = quantity
      const quantity = (parseFloat(amount) * parseFloat(leverage)) / entryPrice;

      const position = await PaperTradingService.openPosition(req.user.id, {
        symbol: targetSymbol,
        side: (type || 'LONG').toLowerCase(),
        entryPrice,
        quantity,
        leverage: parseFloat(leverage),
        stopLoss: opp.suggested_stop_loss ? parseFloat(opp.suggested_stop_loss) : null,
        takeProfit: opp.suggested_take_profit ? parseFloat(opp.suggested_take_profit) : null,
      });

      return res.json({
        transactionId: position.id,
        clearedPrice: entryPrice,
        timestamp: position.created_at
      });
    } catch (err) { next(err); }
  },

  async closePosition(req, res, next) {
    try {
      const { id } = req.params;
      const position = await getSupabaseAdmin()
        .from('paper_positions')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (!position.data) throw ApiError.notFound('Paper position');

      const price = await MarketDataService.getCurrentPrice(position.data.symbol);
      const result = await PaperTradingService.closePosition(req.user.id, id, price);

      return res.json({
        status: 'success',
        exitPrice: price,
        pnl: result.pnl
      });
    } catch (err) { next(err); }
  },

  async closeAll(req, res, next) {
    try {
      const results = await PaperTradingService.closeAllPositions(
        req.user.id,
        (symbol) => MarketDataService.getCurrentPrice(symbol)
      );
      return res.json(results);
    } catch (err) { next(err); }
  },

  async resetAccount(req, res, next) {
    try {
      const account = await PaperTradingService.resetAccount(req.user.id);
      return res.json({
        status: 'success',
        balance: parseFloat(account.balance)
      });
    } catch (err) { next(err); }
  },
};
