import { dbGet, dbQuery } from '../database.js';

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

    const formattedHoldings = holdings.map(h => ({
      asset: assetNames[h.asset_symbol] || `${h.asset_symbol} Asset`,
      symbol: h.asset_symbol,
      allocationPct: h.allocation_pct,
      amount: h.balance_amount,
      entryPrice: h.average_entry_price,
      currentPrice: h.average_entry_price, // for MVP, current price is average entry
      change24h: h.asset_symbol === 'USDC' || h.asset_symbol === 'USDS' ? 0.00 : 1.25 // slight positive for realism
    }));

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

    const stanceData = baseDatasets[riskStance] || baseDatasets.balanced;
    const basePoints = stanceData[period] || stanceData['24h'];

    // Scale points to current balance
    const currentBalance = portfolio.current_balance || 132000;
    const lastBaseVal = basePoints[basePoints.length - 1];
    const scaleFactor = lastBaseVal > 0 ? currentBalance / lastBaseVal : 1;

    const scaledPoints = basePoints.map(val => Math.round(val * scaleFactor * 100) / 100);

    return res.json({
      period,
      points: scaledPoints
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
