import crypto from 'crypto';
import { dbGet, dbQuery, dbRun } from '../database.js';
import { MarketDataService } from '../services/marketDataService.js';

export const getPortfolio = async (req, res) => {
  const userId = req.user.id;

  try {
    const portfolio = await dbGet('SELECT * FROM portfolios WHERE user_id = ?', [userId]);
    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found.' });
    }

    const holdings = await dbQuery('SELECT * FROM portfolio_assets WHERE portfolio_id = ?', [portfolio.id]);
    const risk = await dbGet('SELECT risk_stance FROM risk_profiles WHERE user_id = ?', [userId]);
    const riskStance = risk ? risk.risk_stance : 'balanced';

    // Map APY based on risk stance
    const apys = {
      conservative: '7.18%',
      balanced: '12.42%',
      aggressive: '26.74%'
    };
    const annualizedYield = apys[riskStance] || '12.42%';

    const assetNames = {
      ETH: 'Ethereum Staking Alpha',
      BTC: 'Bitcoin ETF Momentum',
      SOL: 'Solana Liquidity Staking',
      USDC: 'USDC Stablecoin',
      USDS: 'USDS Stable Basket'
    };

    // Fetch live market data to get real currentPrice and change24h
    const overview = await MarketDataService.getOverview();

    const formattedHoldings = holdings.map(h => {
      const liveAsset = overview.find(o => o.symbol === h.asset_symbol);
      const currentPrice = liveAsset ? liveAsset.price : h.average_entry_price;
      const change24h = liveAsset ? liveAsset.change24h : 0.00;

      return {
        asset: assetNames[h.asset_symbol] || `${h.asset_symbol} Asset`,
        symbol: h.asset_symbol,
        allocationPct: h.allocation_pct,
        amount: h.balance_amount,
        entryPrice: h.average_entry_price,
        currentPrice: currentPrice,
        change24h: change24h,
        positionType: h.position_type || 'Long',
        leverage: h.leverage || 1.0
      };
    });

    return res.json({
      currentBalance: portfolio.current_balance,
      currency: portfolio.currency || 'USD',
      safetyScore: portfolio.safety_score,
      annualizedYield,
      holdings: formattedHoldings
    });
  } catch (err) {
    console.error('Error fetching portfolio:', err);
    return res.status(500).json({ error: 'Internal server error fetching portfolio.' });
  }
};

export const getPortfolioHistory = async (req, res) => {
  const userId = req.user.id;
  const period = req.query.period || '24h';

  try {
    const portfolio = await dbGet('SELECT * FROM portfolios WHERE user_id = ?', [userId]);
    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found.' });
    }

    const risk = await dbGet('SELECT risk_stance FROM risk_profiles WHERE user_id = ?', [userId]);
    const riskStance = risk ? risk.risk_stance : 'balanced';

    // Base datasets from dashboard.js
    const baseDatasets = {
      conservative: {
        '24h': [123500, 123800, 123900, 124200, 124100, 124300, 124582],
        '7d': [121000, 121800, 122400, 122900, 123600, 124000, 124582],
        '30d': [118000, 119500, 120200, 121900, 122800, 123400, 124582],
        '1y': [105000, 108000, 111000, 113000, 117000, 120000, 124582]
      },
      balanced: {
        '24h': [128000, 127200, 129500, 128400, 130800, 131500, 132194],
        '7d': [122000, 124500, 126000, 125100, 129000, 130200, 132194],
        '30d': [115000, 118000, 122000, 121500, 127000, 129000, 132194],
        '1y': [98000, 104000, 109000, 112000, 122000, 127000, 132194]
      },
      aggressive: {
        '24h': [141000, 138000, 146000, 142000, 148500, 145000, 149425],
        '7d': [130000, 138000, 134000, 142000, 145000, 141000, 149425],
        '30d': [120000, 132000, 127000, 139000, 142000, 136000, 149425],
        '1y': [88000, 102000, 95000, 118000, 134000, 126000, 149425]
      }
    };

    // 1. Fetch user's holdings
    const holdings = await dbQuery('SELECT * FROM portfolio_assets WHERE portfolio_id = ?', [portfolio.id]);
    
    // Split into stablecoins and cryptos
    let stableValue = 0;
    const cryptoHoldings = [];
    holdings.forEach(h => {
      if (h.asset_symbol === 'USDC' || h.asset_symbol === 'USDS' || h.asset_symbol === 'USDT') {
        stableValue += h.balance_amount * 1.00;
      } else {
        cryptoHoldings.push(h);
      }
    });

    let points = [];
    const limit = period === '24h' || period === '7d' ? 7 : 30;

    // Fetch daily history points for each crypto holding
    let hasRealHistory = false;
    const cryptoHistories = {};
    for (const ch of cryptoHoldings) {
      const hist = await dbQuery(
        'SELECT timestamp, close FROM market_history WHERE symbol = ? ORDER BY timestamp DESC LIMIT ?',
        [ch.asset_symbol, limit]
      );
      if (hist && hist.length > 0) {
        cryptoHistories[ch.asset_symbol] = hist.reverse(); // Order from oldest to newest
        hasRealHistory = true;
      }
    }

    if (hasRealHistory) {
      // Find the max length of fetched history points
      const maxLen = Math.max(...Object.values(cryptoHistories).map(h => h.length));
      
      for (let i = 0; i < maxLen; i++) {
        let dayValue = stableValue;
        for (const ch of cryptoHoldings) {
          const hist = cryptoHistories[ch.asset_symbol];
          if (hist) {
            const pt = hist[i] || hist[hist.length - 1]; // fallback to last known if shorter
            if (pt) {
              dayValue += ch.balance_amount * pt.close;
            }
          }
        }
        points.push(dayValue);
      }
    }

    // Fallback to scaled static datasets if no real history is available
    if (points.length === 0) {
      const stanceData = baseDatasets[riskStance] || baseDatasets.balanced;
      const basePoints = stanceData[period] || stanceData['24h'];
      const currentBalance = portfolio.current_balance || 132000;
      const lastBaseVal = basePoints[basePoints.length - 1];
      const scaleFactor = lastBaseVal > 0 ? currentBalance / lastBaseVal : 1;
      points = basePoints.map(val => Math.round(val * scaleFactor * 100) / 100);
    }

    return res.json({
      period,
      points
    });
  } catch (err) {
    console.error('Error fetching portfolio history:', err);
    return res.status(500).json({ error: 'Internal server error fetching history.' });
  }
};

export const getTransactions = async (req, res) => {
  const userId = req.user.id;

  try {
    const txs = await dbQuery('SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    // Format response matching front end schema
    const formatted = txs.map(t => ({
      id: t.id,
      timestamp: t.created_at,
      type: t.transaction_type,
      asset: t.asset_pair,
      amount: t.amount,
      price: `$${t.cleared_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`,
      fee: `$${t.execution_fee.toFixed(2)}`,
      status: t.status
    }));

    return res.json(formatted);
  } catch (err) {
    console.error('Error fetching transactions:', err);
    return res.status(500).json({ error: 'Internal server error fetching transactions.' });
  }
};

export const closePosition = async (req, res) => {
  const userId = req.user.id;
  const { symbol } = req.params;

  try {
    const portfolio = await dbGet('SELECT * FROM portfolios WHERE user_id = ?', [userId]);
    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found.' });
    }

    const position = await dbGet(
      'SELECT * FROM portfolio_assets WHERE portfolio_id = ? AND asset_symbol = ?',
      [portfolio.id, symbol.toUpperCase()]
    );

    if (!position) {
      return res.status(404).json({ error: `Active position for ${symbol} not found.` });
    }

    if (symbol.toUpperCase() === 'USDC' || symbol.toUpperCase() === 'USDS' || symbol.toUpperCase() === 'USDT') {
      return res.status(400).json({ error: 'Cannot close cash stablecoin assets.' });
    }

    // Fetch live market overview to get current asset price
    const overview = await MarketDataService.getOverview();
    const liveAsset = overview.find(o => o.symbol === symbol.toUpperCase());
    const livePrice = liveAsset ? liveAsset.price : position.average_entry_price;

    const marginUSD = position.balance_amount * position.average_entry_price;
    const leverage = position.leverage || 1.0;
    const positionType = position.position_type || 'Long';

    const priceRatio = livePrice / position.average_entry_price;
    let profitLoss = 0;
    if (positionType.toLowerCase() === 'short') {
      profitLoss = marginUSD * leverage * (1 - priceRatio);
    } else {
      profitLoss = marginUSD * leverage * (priceRatio - 1);
    }

    const usdcReturn = Math.max(0, marginUSD + profitLoss);

    // 1. Update USDC holding
    const usdcAsset = await dbGet(
      'SELECT * FROM portfolio_assets WHERE portfolio_id = ? AND asset_symbol = "USDC"',
      [portfolio.id]
    );

    if (usdcAsset) {
      const newUsdcBalance = usdcAsset.balance_amount + usdcReturn;
      await dbRun(
        'UPDATE portfolio_assets SET balance_amount = ? WHERE id = ?',
        [newUsdcBalance, usdcAsset.id]
      );
    } else {
      await dbRun(
        'INSERT INTO portfolio_assets (id, portfolio_id, asset_symbol, allocation_pct, balance_amount, average_entry_price, position_type, leverage) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [crypto.randomUUID(), portfolio.id, 'USDC', 0.0, usdcReturn, 1.0, 'Long', 1.0]
      );
    }

    // 2. Delete closed position
    await dbRun('DELETE FROM portfolio_assets WHERE id = ?', [position.id]);

    // 3. Recalculate portfolio total balance and asset allocations
    const remainingHoldings = await dbQuery('SELECT * FROM portfolio_assets WHERE portfolio_id = ?', [portfolio.id]);
    
    // Map current prices
    const prices = { USDC: 1.00, USDS: 1.00, USDT: 1.00 };
    overview.forEach(o => {
      prices[o.symbol] = o.price;
    });

    let newTotalBalance = 0;
    const holdingValues = [];

    remainingHoldings.forEach(h => {
      const isStable = h.asset_symbol === 'USDC' || h.asset_symbol === 'USDS' || h.asset_symbol === 'USDT';
      const curPrice = isStable ? 1.00 : (prices[h.asset_symbol] || h.average_entry_price);
      
      let val = 0;
      if (isStable) {
        val = h.balance_amount;
      } else {
        const mUSD = h.balance_amount * h.average_entry_price;
        const pRatio = curPrice / h.average_entry_price;
        const lev = h.leverage || 1.0;
        const pnl = h.position_type.toLowerCase() === 'short'
          ? mUSD * lev * (1 - pRatio)
          : mUSD * lev * (pRatio - 1);
        val = Math.max(0, mUSD + pnl);
      }
      newTotalBalance += val;
      holdingValues.push({ id: h.id, val });
    });

    // Update allocations
    for (const hv of holdingValues) {
      const alloc = newTotalBalance > 0 ? (hv.val / newTotalBalance) * 100 : 0;
      await dbRun('UPDATE portfolio_assets SET allocation_pct = ? WHERE id = ?', [alloc, hv.id]);
    }

    // Update portfolio balance
    await dbRun(
      'UPDATE portfolios SET current_balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newTotalBalance, portfolio.id]
    );

    // 4. Log transaction
    const txId = 'tx-' + crypto.randomUUID().substring(0, 8);
    const fee = usdcReturn * 0.001; // 0.1% fee
    const assetPair = `${symbol.toUpperCase()} / USDC`;
    const amountStr = `${position.balance_amount.toFixed(4)} ${symbol.toUpperCase()}`;

    await dbRun(
      `INSERT INTO transactions (id, user_id, transaction_type, asset_pair, amount, cleared_price, execution_fee, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [crypto.randomUUID(), userId, 'close_position', assetPair, amountStr, livePrice, fee, 'completed']
    );

    // 5. Add notification
    const pnlSign = profitLoss >= 0 ? '+' : '';
    await dbRun(
      'INSERT INTO notifications (id, user_id, channel, priority, title, body, is_read) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        crypto.randomUUID(),
        userId,
        'portfolio',
        'medium',
        'Position Closed',
        `Closed ${positionType} ${symbol.toUpperCase()} position. PnL: ${pnlSign}${profitLoss.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}. Returned ${usdcReturn.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}.`,
        0
      ]
    );

    return res.json({
      status: 'cleared',
      transactionId: txId,
      clearedPrice: livePrice,
      profitLoss: profitLoss,
      returnedAmount: usdcReturn,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error('Error closing position:', err);
    return res.status(500).json({ error: 'Internal server error closing position.' });
  }
};
