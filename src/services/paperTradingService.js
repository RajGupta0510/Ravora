import crypto from 'crypto';
import { dbGet, dbQuery, dbRun } from '../database.js';
import { PositionManager } from './positionManager.js';
import { TradeHistoryService } from './tradeHistoryService.js';
import { PnLCalculator } from './pnlCalculator.js';
import { MarketDataService } from './marketDataService.js';

/**
 * PaperTradingService
 * 
 * Responsibility: Orchestrate paper trading execution, portfolio sync, and price tracking.
 */
export class PaperTradingService {
  /**
   * Open a new paper trade, deducting margin from the user's USDC balance.
   */
  static async openTrade(userId, tradeParams) {
    const {
      symbol,
      direction,
      entryPrice,
      positionSize, // Margin in USD/USDC
      leverage,
      stopLoss,
      takeProfit1,
      takeProfit2,
      takeProfit3,
      confidence,
      opportunityScore
    } = tradeParams;

    const normSymbol = symbol.toUpperCase().replace('/USD', '').trim();
    const parsedMargin = parseFloat(positionSize);
    const parsedLeverage = parseFloat(leverage || 1.0);

    if (isNaN(parsedMargin) || parsedMargin <= 0) {
      throw new Error('Invalid position size.');
    }

    // 1. Fetch user's portfolio and USDC holding
    const portfolio = await dbGet('SELECT * FROM portfolios WHERE user_id = ?', [userId]);
    if (!portfolio) {
      throw new Error('Portfolio not found.');
    }

    const usdcAsset = await dbGet(
      'SELECT * FROM portfolio_assets WHERE portfolio_id = ? AND asset_symbol = "USDC"',
      [portfolio.id]
    );

    if (!usdcAsset || usdcAsset.balance_amount < parsedMargin) {
      throw new Error('Insufficient USDC balance to cover position margin.');
    }

    // 2. Deduct margin from USDC balance
    const newUsdcBalance = usdcAsset.balance_amount - parsedMargin;
    if (newUsdcBalance <= 0) {
      await dbRun('DELETE FROM portfolio_assets WHERE id = ?', [usdcAsset.id]);
    } else {
      await dbRun(
        'UPDATE portfolio_assets SET balance_amount = ? WHERE id = ?',
        [newUsdcBalance, usdcAsset.id]
      );
    }

    // 3. Create active paper position
    const position = await PositionManager.openPosition(userId, {
      symbol: normSymbol,
      direction,
      entryPrice,
      positionSize: parsedMargin,
      leverage: parsedLeverage,
      stopLoss,
      takeProfit1,
      takeProfit2,
      takeProfit3,
      confidence,
      opportunityScore
    });

    // 4. Update portfolio balance and allocations
    await this.syncPortfolioBalance(userId);

    // 5. Send Notification
    await this.sendNotification(
      userId,
      'Trade Deployed',
      `Simulated ${direction.toUpperCase()} position opened for ${normSymbol} at $${entryPrice.toLocaleString()} with ${parsedLeverage}x leverage.`
    );

    return position;
  }

  /**
   * Close an active paper trade, returning margin + P&L to the user's USDC balance.
   */
  static async closeTrade(userId, positionId, reason = 'MANUAL_CLOSE', exitPrice = null) {
    const position = await PositionManager.getPosition(positionId);
    if (!position) {
      throw new Error('Position not found.');
    }

    if (position.user_id !== userId) {
      throw new Error('Unauthorized to close this position.');
    }

    // Determine exit price if not provided
    if (!exitPrice) {
      const overview = await MarketDataService.getOverview();
      const liveAsset = overview.find(o => o.symbol === position.asset_symbol);
      exitPrice = liveAsset ? liveAsset.price : position.entry_price;
    }

    // 1. Calculate P&L
    const pnlData = PnLCalculator.calculatePnL(position, exitPrice);
    const profitLoss = pnlData.unrealizedPnL;
    const returnedAmount = Math.max(0, position.position_size + profitLoss);

    // 2. Return capital to USDC balance
    const portfolio = await dbGet('SELECT * FROM portfolios WHERE user_id = ?', [userId]);
    if (portfolio) {
      const usdcAsset = await dbGet(
        'SELECT * FROM portfolio_assets WHERE portfolio_id = ? AND asset_symbol = "USDC"',
        [portfolio.id]
      );

      if (usdcAsset) {
        const newUsdcBalance = usdcAsset.balance_amount + returnedAmount;
        await dbRun(
          'UPDATE portfolio_assets SET balance_amount = ? WHERE id = ?',
          [newUsdcBalance, usdcAsset.id]
        );
      } else {
        await dbRun(
          'INSERT INTO portfolio_assets (id, portfolio_id, asset_symbol, allocation_pct, balance_amount, average_entry_price, position_type, leverage) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [crypto.randomUUID(), portfolio.id, 'USDC', 0.0, returnedAmount, 1.0, 'Long', 1.0]
        );
      }
    }

    // 3. Log into trade history
    await TradeHistoryService.logTrade(userId, {
      id: position.id,
      assetSymbol: position.asset_symbol,
      direction: position.direction,
      entryPrice: position.entry_price,
      exitPrice,
      positionSize: position.position_size,
      leverage: position.leverage,
      profitLoss,
      openTime: position.open_time,
      reasonClosed: reason,
      winLoss: profitLoss >= 0 ? 'WIN' : 'LOSS',
      confidence: position.recommendation_confidence,
      opportunityScore: position.opportunity_score
    });

    // 4. Delete active position
    await PositionManager.deletePosition(positionId);

    // 5. Update portfolio balance and allocations
    await this.syncPortfolioBalance(userId);

    // 6. Send Notification
    const pnlSign = profitLoss >= 0 ? '+' : '';
    await this.sendNotification(
      userId,
      'Position Closed',
      `Closed ${position.direction} ${position.asset_symbol} position (${reason}). PnL: ${pnlSign}${profitLoss.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}.`
    );

    return {
      profitLoss,
      returnedAmount,
      exitPrice
    };
  }

  /**
   * Close all active paper trades for a user.
   */
  static async closeAllTrades(userId) {
    const activePositions = await PositionManager.getActivePositions(userId);
    const closedResults = [];
    
    for (const pos of activePositions) {
      const res = await this.closeTrade(userId, pos.id, 'MANUAL_CLOSE');
      closedResults.push({ symbol: pos.asset_symbol, ...res });
    }

    return closedResults;
  }

  /**
   * Helper to recalculate the total portfolio balance based on active positions and stablecoins.
   */
  static async syncPortfolioBalance(userId) {
    const portfolio = await dbGet('SELECT * FROM portfolios WHERE user_id = ?', [userId]);
    if (!portfolio) return;

    const holdings = await dbQuery('SELECT * FROM portfolio_assets WHERE portfolio_id = ?', [portfolio.id]);
    const activePositions = await PositionManager.getActivePositions(userId);
    
    const overview = await MarketDataService.getOverview();
    const prices = { USDC: 1.00, USDS: 1.00, USDT: 1.00 };
    overview.forEach(o => {
      prices[o.symbol] = o.price;
    });

    let newTotalBalance = 0;

    // 1. Add value of holdings (stablecoins)
    holdings.forEach(h => {
      if (h.asset_symbol === 'USDC' || h.asset_symbol === 'USDS' || h.asset_symbol === 'USDT') {
        newTotalBalance += h.balance_amount;
      }
    });

    // 2. Add value of active paper positions (margin + unrealized P&L)
    activePositions.forEach(pos => {
      const curPrice = prices[pos.asset_symbol] || pos.entry_price;
      const pnlData = PnLCalculator.calculatePnL(pos, curPrice);
      const val = Math.max(0, pos.position_size + pnlData.unrealizedPnL);
      newTotalBalance += val;
    });

    // 3. Update portfolios table
    await dbRun(
      'UPDATE portfolios SET current_balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newTotalBalance, portfolio.id]
    );

    // 4. Update asset allocation percentages
    const allItems = [];
    holdings.forEach(h => {
      if (h.asset_symbol === 'USDC' || h.asset_symbol === 'USDS' || h.asset_symbol === 'USDT') {
        allItems.push({ id: h.id, type: 'holding', symbol: h.asset_symbol, value: h.balance_amount });
      }
    });

    activePositions.forEach(pos => {
      const curPrice = prices[pos.asset_symbol] || pos.entry_price;
      const pnlData = PnLCalculator.calculatePnL(pos, curPrice);
      const val = Math.max(0, pos.position_size + pnlData.unrealizedPnL);
      allItems.push({ id: pos.id, type: 'position', symbol: pos.asset_symbol, value: val });
    });

    for (const item of allItems) {
      const alloc = newTotalBalance > 0 ? (item.value / newTotalBalance) * 100 : 0;
      if (item.type === 'holding') {
        await dbRun('UPDATE portfolio_assets SET allocation_pct = ? WHERE id = ?', [alloc, item.id]);
      }
    }
  }

  /**
   * Helper to write a notification.
   */
  static async sendNotification(userId, title, body) {
    await dbRun(
      'INSERT INTO notifications (id, user_id, channel, priority, title, body, is_read) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [crypto.randomUUID(), userId, 'portfolio', 'medium', title, body, 0]
    );
  }

  /**
   * Monitor all active positions and trigger Stop Loss or Take Profit closures.
   */
  static async monitorPositions() {
    try {
      const activePositions = await PositionManager.getAllActivePositions();
      if (activePositions.length === 0) return;

      const overview = await MarketDataService.getOverview();
      const prices = {};
      overview.forEach(o => {
        prices[o.symbol] = o.price;
      });

      for (const pos of activePositions) {
        const currentPrice = prices[pos.asset_symbol];
        if (!currentPrice) continue;

        // 1. Check Stop Loss
        let isSLHit = false;
        if (pos.stop_loss > 0) {
          if (pos.direction.toUpperCase() === 'LONG' && currentPrice <= pos.stop_loss) {
            isSLHit = true;
          } else if (pos.direction.toUpperCase() === 'SHORT' && currentPrice >= pos.stop_loss) {
            isSLHit = true;
          }
        }

        if (isSLHit) {
          console.log(`[PaperTradingService] Stop Loss hit for position ${pos.id} (${pos.asset_symbol} @ $${currentPrice}). Closing...`);
          await this.closeTrade(pos.user_id, pos.id, 'STOP_LOSS_HIT', currentPrice);
          continue;
        }

        // 2. Check Take Profits
        const status = (pos.status || 'OPEN').toUpperCase();
        let isTP1Hit = status === 'OPEN' && pos.take_profit_1 > 0 &&
          ((pos.direction.toUpperCase() === 'LONG' && currentPrice >= pos.take_profit_1) ||
           (pos.direction.toUpperCase() === 'SHORT' && currentPrice <= pos.take_profit_1));

        let isTP2Hit = (status === 'OPEN' || status === 'TP1 HIT') && pos.take_profit_2 > 0 &&
          ((pos.direction.toUpperCase() === 'LONG' && currentPrice >= pos.take_profit_2) ||
           (pos.direction.toUpperCase() === 'SHORT' && currentPrice <= pos.take_profit_2));

        let isTP3Hit = (status === 'OPEN' || status === 'TP1 HIT' || status === 'TP2 HIT') && pos.take_profit_3 > 0 &&
          ((pos.direction.toUpperCase() === 'LONG' && currentPrice >= pos.take_profit_3) ||
           (pos.direction.toUpperCase() === 'SHORT' && currentPrice <= pos.take_profit_3));

        if (isTP3Hit) {
          console.log(`[PaperTradingService] TP3 hit for position ${pos.id} (${pos.asset_symbol} @ $${currentPrice}). Closing...`);
          await this.closeTrade(pos.user_id, pos.id, 'TP3_HIT', currentPrice);
        } else if (isTP2Hit && status !== 'TP2 HIT') {
          console.log(`[PaperTradingService] TP2 hit for position ${pos.id} (${pos.asset_symbol} @ $${currentPrice}). Updating status...`);
          await PositionManager.updatePositionStatus(pos.id, 'TP2 HIT');
          await this.sendNotification(pos.user_id, 'Take Profit 2 Hit', `${pos.asset_symbol} reached TP2 at $${currentPrice.toLocaleString()}.`);
        } else if (isTP1Hit && status !== 'TP1 HIT') {
          console.log(`[PaperTradingService] TP1 hit for position ${pos.id} (${pos.asset_symbol} @ $${currentPrice}). Updating status...`);
          await PositionManager.updatePositionStatus(pos.id, 'TP1 HIT');
          await this.sendNotification(pos.user_id, 'Take Profit 1 Hit', `${pos.asset_symbol} reached TP1 at $${currentPrice.toLocaleString()}.`);
        }
      }
    } catch (err) {
      console.error('[PaperTradingService] Error monitoring active positions:', err);
    }
  }

  /**
   * Start the background position monitoring loop.
   */
  static startMonitoringLoop(intervalMs = 5000) {
    console.log(`[PaperTradingService] Starting active positions monitoring loop (every ${intervalMs}ms)...`);
    setInterval(() => {
      this.monitorPositions();
    }, intervalMs);
  }
}
