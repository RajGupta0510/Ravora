import crypto from 'crypto';
import { dbGet, dbRun, dbQuery } from '../database.js';
import { MarketDataService } from '../services/marketDataService.js';
import { ASSETS_TO_TRACK } from '../config/marketConfig.js';
import { RecommendationEngine } from '../services/recommendations/recommendationEngine.js';

export const getOpportunities = async (req, res) => {
  try {
    const opps = await dbQuery('SELECT * FROM opportunities');
    const formatted = opps.map(o => ({
      opportunityId: o.id,
      type: o.opportunity_type,
      name: o.name,
      symbol: o.symbol,
      icon: o.icon_symbol,
      opportunityScore: o.opportunity_score,
      confidenceScore: o.confidence_score,
      riskScore: o.risk_score,
      riskLevel: o.risk_level,
      expectedReturn: o.expected_return,
      reasoningText: o.reasoning_text,
      suggestedEntry: o.suggested_entry,
      suggestedStopLoss: o.suggested_stop_loss,
      suggestedTakeProfit: o.suggested_take_profit,
      expectedDuration: o.expected_duration,
      riskRewardRatio: o.risk_reward_ratio,
      trendDirection: o.trend_direction,
      supportLevels: o.support_levels ? JSON.parse(o.support_levels) : [],
      resistanceLevels: o.resistance_levels ? JSON.parse(o.resistance_levels) : []
    }));
    return res.json(formatted);
  } catch (err) {
    console.error('Error fetching opportunities:', err);
    return res.status(500).json({ error: 'Internal server error fetching opportunities.' });
  }
};

export const getRecommendations = async (req, res) => {
  const userId = req.user.id;

  try {
    const recs = await dbQuery(
      `SELECT r.id as recommendationId, r.suggested_allocation_pct as suggestedAllocationPct, r.status,
              o.id as opportunityId, o.name, o.symbol, o.icon_symbol as icon, o.opportunity_score as opportunityScore,
              o.confidence_score as confidenceScore, o.risk_score as riskScore, o.expected_return as expectedReturn,
              o.risk_level as riskLevel, o.reasoning_text as reasoningText, o.suggested_entry, o.suggested_stop_loss,
              o.suggested_take_profit, o.expected_duration, o.risk_reward_ratio, o.trend_direction, o.support_levels, o.resistance_levels
       FROM araiven_recommendations r
       JOIN opportunities o ON r.opportunity_id = o.id
       WHERE r.user_id = ? AND r.status = 'pending'`,
      [userId]
    );

    return res.json(recs.map(r => ({
      recommendationId: r.recommendationId,
      opportunity: {
        opportunityId: r.opportunityId,
        name: r.name,
        symbol: r.symbol,
        icon: r.icon,
        opportunityScore: r.opportunityScore,
        confidenceScore: r.confidenceScore,
        riskScore: r.riskScore,
        expectedReturn: r.expectedReturn,
        riskLevel: r.riskLevel,
        suggestedEntry: r.suggested_entry,
        suggestedStopLoss: r.suggested_stop_loss,
        suggestedTakeProfit: r.suggested_take_profit,
        expectedDuration: r.expected_duration,
        riskRewardRatio: r.risk_reward_ratio,
        trendDirection: r.trend_direction,
        supportLevels: r.support_levels ? JSON.parse(r.support_levels) : [],
        resistanceLevels: r.resistance_levels ? JSON.parse(r.resistance_levels) : []
      },
      suggestedAllocationPct: r.suggestedAllocationPct,
      reasoningText: r.reasoningText,
      status: r.status
    })));
  } catch (err) {
    console.error('Error fetching recommendations:', err);
    return res.status(500).json({ error: 'Internal server error fetching recommendations.' });
  }
};

export const executeRecommendation = async (req, res) => {
  const userId = req.user.id;
  const recommendationId = req.params.id;

  try {
    // 1. Retrieve recommendation
    const rec = await dbGet(
      `SELECT r.*, o.name as opp_name, o.symbol as opp_symbol, o.icon_symbol as opp_icon, o.opportunity_type
       FROM araiven_recommendations r
       JOIN opportunities o ON r.opportunity_id = o.id
       WHERE r.id = ? AND r.user_id = ?`,
      [recommendationId, userId]
    );

    if (!rec) {
      return res.status(404).json({ error: 'Recommendation not found.' });
    }

    if (rec.status !== 'pending') {
      return res.status(400).json({ error: 'Recommendation has already been processed.' });
    }

    // 2. Fetch portfolio
    const portfolio = await dbGet('SELECT * FROM portfolios WHERE user_id = ?', [userId]);
    if (!portfolio) {
      return res.status(404).json({ error: 'User portfolio not found.' });
    }

    // 3. Compute values
    const currentBalance = portfolio.current_balance;
    const allocationPct = rec.suggested_allocation_pct; // e.g. 8.00
    const swapValueUSD = currentBalance * (allocationPct / 100);

    // Fetch live asset prices from cache/providers
    const overview = await MarketDataService.getOverview();
    const prices = { USDC: 1.00, USDS: 1.00, USDT: 1.00 };
    overview.forEach(o => {
      prices[o.symbol] = o.price;
    });

    // Determine target symbol based on opportunity
    let targetSymbol = 'ETH';
    if (rec.opp_symbol.includes('BTC')) targetSymbol = 'BTC';
    else if (rec.opp_symbol.includes('SOL')) targetSymbol = 'SOL';
    else if (rec.opp_symbol.includes('BNB')) targetSymbol = 'BNB';
    else if (rec.opp_symbol.includes('SUI')) targetSymbol = 'SUI';
    else if (rec.opp_symbol.includes('USDC')) targetSymbol = 'USDC';

    const targetPrice = prices[targetSymbol] || 100.00;

    // Fetch user holdings
    const holdings = await dbQuery('SELECT * FROM portfolio_assets WHERE portfolio_id = ?', [portfolio.id]);

    // Find source asset to deduct funds from (usually USDC, otherwise the one with the highest balance)
    let sourceAsset = holdings.find(h => h.asset_symbol === 'USDC');
    if (!sourceAsset || sourceAsset.balance_amount * sourceAsset.average_entry_price < swapValueUSD) {
      // Find largest holding
      let maxVal = 0;
      holdings.forEach(h => {
        const val = h.balance_amount * h.average_entry_price;
        if (val > maxVal) {
          maxVal = val;
          sourceAsset = h;
        }
      });
    }

    if (!sourceAsset || (sourceAsset.balance_amount * sourceAsset.average_entry_price) < swapValueUSD) {
      return res.status(422).json({ error: 'Insufficient funds in portfolio holdings to perform this rebalance.' });
    }

    // 4. Update source asset
    const sourcePrice = sourceAsset.average_entry_price;
    const sourceDeductAmount = swapValueUSD / sourcePrice;
    const newSourceBalance = sourceAsset.balance_amount - sourceDeductAmount;
    const newSourceAllocation = ((newSourceBalance * sourcePrice) / currentBalance) * 100;

    if (newSourceBalance <= 0) {
      await dbRun('DELETE FROM portfolio_assets WHERE id = ?', [sourceAsset.id]);
    } else {
      await dbRun(
        'UPDATE portfolio_assets SET balance_amount = ?, allocation_pct = ? WHERE id = ?',
        [newSourceBalance, newSourceAllocation, sourceAsset.id]
      );
    }

    // 5. Update or insert target asset
    const targetAsset = holdings.find(h => h.asset_symbol === targetSymbol);
    const targetAddAmount = swapValueUSD / targetPrice;

    if (targetAsset) {
      const newTargetBalance = targetAsset.balance_amount + targetAddAmount;
      const newTargetAllocation = ((newTargetBalance * targetPrice) / currentBalance) * 100;
      await dbRun(
        'UPDATE portfolio_assets SET balance_amount = ?, allocation_pct = ? WHERE id = ?',
        [newTargetBalance, newTargetAllocation, targetAsset.id]
      );
    } else {
      const targetAllocation = (swapValueUSD / currentBalance) * 100;
      await dbRun(
        'INSERT INTO portfolio_assets (id, portfolio_id, asset_symbol, allocation_pct, balance_amount, average_entry_price, position_type, leverage) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [crypto.randomUUID(), portfolio.id, targetSymbol, targetAllocation, targetAddAmount, targetPrice, 'Long', 1.0]
      );
    }

    // 6. Log transaction
    const txId = 'tx-' + crypto.randomUUID().substring(0, 8);
    const fee = swapValueUSD * 0.001; // 0.1% fee
    const assetPair = `${sourceAsset.asset_symbol} / ${targetSymbol}`;
    const amountStr = `${targetAddAmount.toFixed(4)} ${targetSymbol}`;

    await dbRun(
      `INSERT INTO transactions (id, user_id, transaction_type, asset_pair, amount, cleared_price, execution_fee, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [crypto.randomUUID(), userId, 'staking_deposit', assetPair, amountStr, targetPrice, fee, 'completed']
    );

    // 7. Update recommendation status
    await dbRun('UPDATE araiven_recommendations SET status = "approved" WHERE id = ?', [recommendationId]);

    // 8. Add notification about successful rebalance
    await dbRun(
      'INSERT INTO notifications (id, user_id, channel, priority, title, body, is_read) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        crypto.randomUUID(),
        userId,
        'portfolio',
        'medium',
        'Rebalance Directive Executed',
        `Successfully swapped ${swapValueUSD.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} into ${rec.opp_name}.`,
        0
      ]
    );

    return res.json({
      status: 'cleared',
      transactionId: txId,
      clearedPrice: targetPrice,
      executionFee: fee,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error executing recommendation:', err);
    return res.status(500).json({ error: 'Internal server error executing recommendation.' });
  }
};

export const deployOpportunity = async (req, res) => {
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

    const portfolio = await dbGet('SELECT * FROM portfolios WHERE user_id = ?', [userId]);
    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found.' });
    }

    const currentBalance = portfolio.current_balance;
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: 'Invalid investment amount.' });
    }

    if (parsedAmount > currentBalance) {
      return res.status(422).json({ error: 'Investment amount exceeds total portfolio balance.' });
    }

    // Fetch live asset prices from cache/providers
    const overview = await MarketDataService.getOverview();
    const prices = { USDC: 1.00, USDS: 1.00, USDT: 1.00 };
    overview.forEach(o => {
      prices[o.symbol] = o.price;
    });

    let targetSymbol = 'ETH';
    if (opp.symbol.includes('BTC')) targetSymbol = 'BTC';
    else if (opp.symbol.includes('SOL')) targetSymbol = 'SOL';
    else if (opp.symbol.includes('BNB')) targetSymbol = 'BNB';
    else if (opp.symbol.includes('SUI')) targetSymbol = 'SUI';
    else if (opp.symbol.includes('USDC')) targetSymbol = 'USDC';

    const targetPrice = prices[targetSymbol] || 100.00;
    const holdings = await dbQuery('SELECT * FROM portfolio_assets WHERE portfolio_id = ?', [portfolio.id]);

    let sourceAsset = holdings.find(h => h.asset_symbol === 'USDC');
    if (!sourceAsset || sourceAsset.balance_amount * sourceAsset.average_entry_price < parsedAmount) {
      let maxVal = 0;
      holdings.forEach(h => {
        const val = h.balance_amount * h.average_entry_price;
        if (val > maxVal) {
          maxVal = val;
          sourceAsset = h;
        }
      });
    }

    if (!sourceAsset || (sourceAsset.balance_amount * sourceAsset.average_entry_price) < parsedAmount) {
      return res.status(422).json({ error: 'Insufficient funds in holdings to deploy this opportunity.' });
    }

    // Deduct source
    const sourceDeductAmount = parsedAmount / sourceAsset.average_entry_price;
    const newSourceBalance = sourceAsset.balance_amount - sourceDeductAmount;
    const newSourceAllocation = ((newSourceBalance * sourceAsset.average_entry_price) / currentBalance) * 100;

    if (newSourceBalance <= 0) {
      await dbRun('DELETE FROM portfolio_assets WHERE id = ?', [sourceAsset.id]);
    } else {
      await dbRun(
        'UPDATE portfolio_assets SET balance_amount = ?, allocation_pct = ? WHERE id = ?',
        [newSourceBalance, newSourceAllocation, sourceAsset.id]
      );
    }

    // Add target
    const targetAsset = holdings.find(h => h.asset_symbol === targetSymbol);
    const targetAddAmount = parsedAmount / targetPrice;

    if (targetAsset) {
      const newTargetBalance = targetAsset.balance_amount + targetAddAmount;
      const newTargetAllocation = ((newTargetBalance * targetPrice) / currentBalance) * 100;
      await dbRun(
        'UPDATE portfolio_assets SET balance_amount = ?, allocation_pct = ? WHERE id = ?',
        [newTargetBalance, newTargetAllocation, targetAsset.id]
      );
    } else {
      const targetAllocation = (parsedAmount / currentBalance) * 100;
      await dbRun(
        'INSERT INTO portfolio_assets (id, portfolio_id, asset_symbol, allocation_pct, balance_amount, average_entry_price, position_type, leverage) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [crypto.randomUUID(), portfolio.id, targetSymbol, targetAllocation, targetAddAmount, targetPrice, type || 'Long', leverage || 1.0]
      );
    }

    // Tx log
    const txId = 'tx-' + crypto.randomUUID().substring(0, 8);
    const fee = parsedAmount * 0.001;
    const assetPair = `${sourceAsset.asset_symbol} / ${targetSymbol}`;
    const amountStr = `${targetAddAmount.toFixed(4)} ${targetSymbol}`;

    await dbRun(
      `INSERT INTO transactions (id, user_id, transaction_type, asset_pair, amount, cleared_price, execution_fee, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [crypto.randomUUID(), userId, 'swap', assetPair, amountStr, targetPrice, fee, 'completed']
    );

    // Notify
    await dbRun(
      'INSERT INTO notifications (id, user_id, channel, priority, title, body, is_read) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        crypto.randomUUID(),
        userId,
        'opportunities',
        'medium',
        'Opportunity Capital Deployed',
        `Deployed ${parsedAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} into ${opp.name}.`,
        0
      ]
    );

    return res.json({
      status: 'cleared',
      transactionId: txId,
      clearedPrice: targetPrice,
      executionFee: fee,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error deploying opportunity:', err);
    return res.status(500).json({ error: 'Internal server error deploying opportunity.' });
  }
};

export const scanMarkets = async (req, res) => {
  const userId = req.user.id;
  try {
    console.log(`[Market Scanner] Manual scan triggered by user ${userId}`);

    // Step 1: Immediately run scoring engine on existing cached data
    // This makes the API respond fast (< 1 second) regardless of external API speed
    await RecommendationEngine.generateRecommendations(userId);

    // Step 2: Respond to the client immediately so the UI can update
    res.json({ success: true, message: 'Araiven quantitative analysis completed. Refreshing market data in background.' });

    // Step 3: Refresh external market data in the BACKGROUND (non-blocking)
    // If Binance/CoinCap are slow/down, the UI is not affected
    setImmediate(async () => {
      try {
        console.log('[Market Scanner] Background: Refreshing tickers from external APIs...');
        await MarketDataService.updateTickers();

        console.log('[Market Scanner] Background: Refreshing price history...');
        for (const symbol of ASSETS_TO_TRACK) {
          await MarketDataService.updateHistory(symbol);
        }

        // Run a second scoring pass now with fresh real-world data
        await RecommendationEngine.generateRecommendations(userId);
        console.log('[Market Scanner] Background refresh complete with fresh market data.');
      } catch (bgErr) {
        console.error('[Market Scanner] Background refresh error (non-critical):', bgErr.message);
      }
    });

  } catch (err) {
    console.error('Error during market scan:', err);
    return res.status(500).json({ error: 'Failed to run market scanner engine: ' + err.message });
  }
};
