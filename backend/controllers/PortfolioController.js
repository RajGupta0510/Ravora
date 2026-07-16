/**
 * Ravora Backend V1 — Portfolio Controller
 */

import { PortfolioService } from '../services/PortfolioService.js';
import { MarketDataService } from '../services/MarketDataService.js';
import { getSupabaseAdmin } from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';
import crypto from 'crypto';

export const PortfolioController = {
  async getPortfolio(req, res, next) {
    try {
      const userId = req.user.id;
      const db = getSupabaseAdmin();

      // Fetch portfolio
      const portfolio = await db
        .from('portfolios')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!portfolio.data) {
        throw ApiError.notFound('Portfolio');
      }

      // Fetch assets
      const { data: assets, error: assetsErr } = await db
        .from('portfolio_assets')
        .select('*')
        .eq('portfolio_id', portfolio.data.id);

      if (assetsErr) throw assetsErr;

      // Fetch user profile to check risk stance
      const { data: profile } = await db
        .from('profiles')
        .select('risk_stance')
        .eq('id', userId)
        .maybeSingle();

      const riskStance = profile?.risk_stance || 'balanced';
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

      // Get live prices to map
      const overview = await MarketDataService.getOverview();
      const prices = { USDC: 1.00, USDS: 1.00, USDT: 1.00 };
      overview.forEach(o => {
        prices[o.symbol] = o.price;
      });

      const formattedHoldings = (assets || []).map(h => {
        const currentPrice = prices[h.asset_symbol] || parseFloat(h.average_entry_price);
        const change24h = overview.find(o => o.symbol === h.asset_symbol)?.change24h || 0.00;

        return {
          asset: assetNames[h.asset_symbol] || `${h.asset_symbol} Asset`,
          symbol: h.asset_symbol,
          allocationPct: parseFloat(h.allocation_pct),
          amount: parseFloat(h.balance_amount),
          entryPrice: parseFloat(h.average_entry_price),
          currentPrice,
          change24h,
          positionType: h.position_type || 'Long',
          leverage: parseFloat(h.leverage || 1.0)
        };
      });

      return res.json({
        currentBalance: parseFloat(portfolio.data.current_balance),
        currency: portfolio.data.currency || 'USD',
        safetyScore: parseInt(portfolio.data.safety_score || 100, 10),
        annualizedYield,
        holdings: formattedHoldings
      });
    } catch (err) { next(err); }
  },

  async getHistory(req, res, next) {
    try {
      const userId = req.user.id;
      const period = req.query.period || '24h';
      const db = getSupabaseAdmin();

      const portfolio = await db
        .from('portfolios')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!portfolio.data) throw ApiError.notFound('Portfolio');

      const { data: profile } = await db
        .from('profiles')
        .select('risk_stance')
        .eq('id', userId)
        .maybeSingle();

      const riskStance = profile?.risk_stance || 'balanced';

      // Base static datasets matching legacy dashboard.js
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
      const currentBalance = parseFloat(portfolio.data.current_balance || 100000);
      const lastBaseVal = basePoints[basePoints.length - 1];
      const scaleFactor = lastBaseVal > 0 ? currentBalance / lastBaseVal : 1;
      const points = basePoints.map(val => Math.round(val * scaleFactor * 100) / 100);

      return res.json({
        period,
        points
      });
    } catch (err) { next(err); }
  },

  async getTransactions(req, res, next) {
    try {
      const userId = req.user.id;
      const db = getSupabaseAdmin();

      const { data: txs, error } = await db
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formatted = (txs || []).map(t => ({
        id: t.id,
        timestamp: t.created_at,
        type: t.transaction_type,
        asset: t.asset_pair,
        amount: t.amount,
        price: `$${parseFloat(t.cleared_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`,
        fee: `$${parseFloat(t.execution_fee || 0).toFixed(2)}`,
        status: t.status
      }));

      return res.json(formatted);
    } catch (err) { next(err); }
  },

  async closePosition(req, res, next) {
    try {
      const userId = req.user.id;
      const { symbol } = req.params;
      const db = getSupabaseAdmin();

      const portfolio = await db
        .from('portfolios')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!portfolio.data) throw ApiError.notFound('Portfolio');

      const position = await db
        .from('portfolio_assets')
        .select('*')
        .eq('portfolio_id', portfolio.data.id)
        .eq('asset_symbol', symbol.toUpperCase())
        .maybeSingle();

      if (!position.data) {
        throw ApiError.notFound(`Active position for ${symbol}`);
      }

      if (['USDC', 'USDS', 'USDT'].includes(symbol.toUpperCase())) {
        throw ApiError.badRequest('Cannot close cash stablecoin assets.');
      }

      const overview = await MarketDataService.getOverview();
      const liveAsset = overview.find(o => o.symbol === symbol.toUpperCase());
      const livePrice = liveAsset ? liveAsset.price : parseFloat(position.data.average_entry_price);

      const marginUSD = parseFloat(position.data.balance_amount) * parseFloat(position.data.average_entry_price);
      const leverage = parseFloat(position.data.leverage || 1.0);
      const positionType = position.data.position_type || 'Long';

      const priceRatio = livePrice / parseFloat(position.data.average_entry_price);
      let profitLoss = 0;
      if (positionType.toLowerCase() === 'short') {
        profitLoss = marginUSD * leverage * (1 - priceRatio);
      } else {
        profitLoss = marginUSD * leverage * (priceRatio - 1);
      }

      const usdcReturn = Math.max(0, marginUSD + profitLoss);

      // Fetch or insert USDC holding
      const usdcAsset = await db
        .from('portfolio_assets')
        .select('*')
        .eq('portfolio_id', portfolio.data.id)
        .eq('asset_symbol', 'USDC')
        .maybeSingle();

      if (usdcAsset.data) {
        await db
          .from('portfolio_assets')
          .update({ balance_amount: parseFloat(usdcAsset.data.balance_amount) + usdcReturn })
          .eq('id', usdcAsset.data.id);
      } else {
        await db.from('portfolio_assets').insert({
          portfolio_id: portfolio.data.id,
          asset_symbol: 'USDC',
          allocation_pct: 0.0,
          balance_amount: usdcReturn,
          average_entry_price: 1.0,
          position_type: 'long',
          leverage: 1.0
        });
      }

      // Delete closed position
      await db.from('portfolio_assets').delete().eq('id', position.data.id);

      // Recalculate portfolio balance and allocations
      const remaining = await db
        .from('portfolio_assets')
        .select('*')
        .eq('portfolio_id', portfolio.data.id);

      const prices = { USDC: 1.00, USDS: 1.00, USDT: 1.00 };
      overview.forEach(o => {
        prices[o.symbol] = o.price;
      });

      let newTotalBalance = 0;
      const holdingValues = [];

      (remaining.data || []).forEach(h => {
        const isStable = ['USDC', 'USDS', 'USDT'].includes(h.asset_symbol);
        const curPrice = isStable ? 1.00 : (prices[h.asset_symbol] || parseFloat(h.average_entry_price));

        let val = 0;
        if (isStable) {
          val = parseFloat(h.balance_amount);
        } else {
          const mUSD = parseFloat(h.balance_amount) * parseFloat(h.average_entry_price);
          const pRatio = curPrice / parseFloat(h.average_entry_price);
          const lev = parseFloat(h.leverage || 1.0);
          const pnl = h.position_type.toLowerCase() === 'short'
            ? mUSD * lev * (1 - pRatio)
            : mUSD * lev * (pRatio - 1);
          val = Math.max(0, mUSD + pnl);
        }
        newTotalBalance += val;
        holdingValues.push({ id: h.id, val });
      });

      // Update allocations & portfolio balance
      for (const hv of holdingValues) {
        const alloc = newTotalBalance > 0 ? (hv.val / newTotalBalance) * 100 : 0;
        await db.from('portfolio_assets').update({ allocation_pct: alloc }).eq('id', hv.id);
      }

      await db.from('portfolios').update({ current_balance: newTotalBalance }).eq('id', portfolio.data.id);

      return res.json({
        status: 'closed',
        exitPrice: livePrice,
        pnl: profitLoss,
        timestamp: new Date().toISOString()
      });
    } catch (err) { next(err); }
  },

  async addAsset(req, res, next) {
    try {
      const asset = await PortfolioService.addAsset(req.user.id, req.body);
      return res.status(201).json(asset);
    } catch (err) { next(err); }
  },
};
