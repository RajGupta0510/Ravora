import { dbGet } from '../database.js';
import { PaperTradingService } from '../services/paperTradingService.js';
import { PositionManager } from '../services/positionManager.js';
import { TradeHistoryService } from '../services/tradeHistoryService.js';
import { PnLCalculator } from '../services/pnlCalculator.js';
import { MarketDataService } from '../services/marketDataService.js';

/**
 * Open a new paper trade.
 */
export const openPaperPosition = async (req, res) => {
  const userId = req.user.id;
  const { opportunityId, amount, type, leverage } = req.body;

  if (!opportunityId || !amount) {
    return res.status(400).json({ error: 'Opportunity ID and amount are required.' });
  }

  try {
    const opp = await dbGet('SELECT * FROM opportunities WHERE id = ?', [opportunityId]);
    if (!opp) {
      return res.status(404).json({ error: 'Opportunity not found.' });
    }

    // Determine target symbol
    let targetSymbol = 'ETH';
    if (opp.symbol.includes('BTC')) targetSymbol = 'BTC';
    else if (opp.symbol.includes('SOL')) targetSymbol = 'SOL';
    else if (opp.symbol.includes('BNB')) targetSymbol = 'BNB';
    else if (opp.symbol.includes('SUI')) targetSymbol = 'SUI';

    // Fetch current price
    const overview = await MarketDataService.getOverview();
    const liveAsset = overview.find(o => o.symbol === targetSymbol);
    const entryPrice = liveAsset ? liveAsset.price : (opp.suggested_entry || 100.0);

    // Call PaperTradingService to execute
    const position = await PaperTradingService.openTrade(userId, {
      symbol: targetSymbol,
      direction: type || 'LONG',
      entryPrice,
      positionSize: parseFloat(amount),
      leverage: parseFloat(leverage || 1.0),
      stopLoss: opp.suggested_stop_loss,
      takeProfit1: opp.suggested_take_profit_1,
      takeProfit2: opp.suggested_take_profit_2,
      takeProfit3: opp.suggested_take_profit_3,
      confidence: opp.confidence_score,
      opportunityScore: opp.opportunity_score
    });

    return res.json({
      transactionId: position.id,
      clearedPrice: position.entry_price,
      timestamp: position.open_time
    });
  } catch (err) {
    console.error('[PaperTradingController] Error opening position:', err);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * Get active paper positions with live P&L and duration.
 */
export const getActivePaperPositions = async (req, res) => {
  const userId = req.user.id;

  try {
    const positions = await PositionManager.getActivePositions(userId);
    const overview = await MarketDataService.getOverview();
    
    const prices = {};
    overview.forEach(o => {
      prices[o.symbol] = o.price;
    });

    const formatted = positions.map(pos => {
      const currentPrice = prices[pos.asset_symbol] || pos.entry_price;
      const pnlData = PnLCalculator.calculatePnL(pos, currentPrice);

      // Calculate duration in human-readable format
      const openDate = new Date(pos.open_time + ' UTC'); // Parse as UTC
      const durationMs = Date.now() - openDate.getTime();
      const minutes = Math.floor(durationMs / 60000);
      const hours = Math.floor(minutes / 60);
      let durationStr = `${minutes}m`;
      if (hours > 0) {
        durationStr = `${hours}h ${minutes % 60}m`;
      }

      return {
        id: pos.id,
        symbol: pos.asset_symbol,
        direction: pos.direction,
        entryPrice: pos.entry_price,
        currentPrice,
        positionSize: pos.position_size,
        leverage: pos.leverage,
        unrealizedPnL: pnlData.unrealizedPnL,
        percentageReturn: pnlData.percentageReturn,
        distanceToSL: pnlData.distanceToSL,
        distanceToTP: pnlData.distanceToTP,
        duration: durationStr,
        status: pos.status
      };
    });

    return res.json(formatted);
  } catch (err) {
    console.error('[PaperTradingController] Error fetching active positions:', err);
    return res.status(500).json({ error: 'Failed to fetch active positions.' });
  }
};

/**
 * Close a specific paper position.
 */
export const closePaperPosition = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const result = await PaperTradingService.closeTrade(userId, id, 'MANUAL_CLOSE');
    return res.json(result);
  } catch (err) {
    console.error('[PaperTradingController] Error closing position:', err);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * Close all active paper positions.
 */
export const closeAllPaperPositions = async (req, res) => {
  const userId = req.user.id;

  try {
    const results = await PaperTradingService.closeAllTrades(userId);
    return res.json(results);
  } catch (err) {
    console.error('[PaperTradingController] Error closing all positions:', err);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * Get closed trade history.
 */
export const getPaperTradeHistory = async (req, res) => {
  const userId = req.user.id;

  try {
    const history = await TradeHistoryService.getHistory(userId);
    
    const formatted = history.map(h => {
      const openDate = new Date(h.open_time + ' UTC');
      const closeDate = new Date(h.close_time + ' UTC');
      const durationMs = closeDate.getTime() - openDate.getTime();
      const minutes = Math.floor(durationMs / 60000);
      const hours = Math.floor(minutes / 60);
      let durationStr = `${minutes}m`;
      if (hours > 0) {
        durationStr = `${hours}h ${minutes % 60}m`;
      }

      return {
        id: h.id,
        symbol: h.asset_symbol,
        direction: h.direction,
        entryPrice: h.entry_price,
        exitPrice: h.exit_price,
        positionSize: h.position_size,
        leverage: h.leverage,
        profitLoss: h.profit_loss,
        openTime: h.open_time,
        closeTime: h.close_time,
        reasonClosed: h.reason_closed,
        winLoss: h.win_loss,
        confidence: h.recommendation_confidence,
        opportunityScore: h.opportunity_score,
        duration: durationStr,
        notes: h.notes || ''
      };
    });

    return res.json(formatted);
  } catch (err) {
    console.error('[PaperTradingController] Error fetching trade history:', err);
    return res.status(500).json({ error: 'Failed to fetch trade history.' });
  }
};

/**
 * Update trade notes.
 */
export const updatePaperTradeNotes = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { notes } = req.body;

  try {
    await TradeHistoryService.updateNotes(userId, id, notes);
    return res.json({ success: true, message: 'Trade notes updated successfully.' });
  } catch (err) {
    console.error('[PaperTradingController] Error updating trade notes:', err);
    return res.status(500).json({ error: 'Failed to update trade notes.' });
  }
};
