import { getSupabaseAdmin } from '../config/database.js';
import { TradingAssetRepository } from '../repositories/TradingAssetRepository.js';
import { MarketProviderFactory } from '../market/MarketProviderFactory.js';
import { NotificationService } from './NotificationService.js';
import { AiServiceFactory } from './AiServiceFactory.js';
import { logger } from '../utils/logger.js';
import { ApiError } from '../utils/ApiError.js';

const assetRepo = new TradingAssetRepository();

// Global in-memory cache for scanned opportunities
const cachedOpportunities = new Map();
// Global in-memory watchlist and alerts fallback store
const watchlistStore = new Map();
const alertsStore = new Map();

export const WorkspaceService = {
  /**
   * Automatically import every actively tradable Binance Spot and Futures symbol
   */
  async syncBinanceAssets() {
    try {
      logger.info('WorkspaceService', 'Synchronizing Binance actively tradable Spot and Futures assets...');
      
      const spotRes = await fetch('https://api.binance.com/api/v3/exchangeInfo');
      if (!spotRes.ok) throw new Error(`Binance Spot Exchange Info returned ${spotRes.status}`);
      const spotData = await spotRes.json();

      const spotAssets = (spotData.symbols || [])
        .filter(s => s.status === 'TRADING' && s.quoteAsset === 'USDT')
        .map(s => ({
          symbol: s.symbol,
          base_asset: s.baseAsset,
          quote_asset: s.quoteAsset,
          name: s.baseAsset === 'BTC' ? 'Bitcoin' : (s.baseAsset === 'ETH' ? 'Ethereum' : `${s.baseAsset} Token`),
          precision: s.baseAssetPrecision,
          tick_size: s.filters.find(f => f.filterType === 'PRICE_FILTER')?.tickSize || '0.01',
          lot_size: s.filters.find(f => f.filterType === 'LOT_SIZE')?.stepSize || '0.0001',
          exchange_status: s.status,
          market_type: 'spot',
          logo_url: `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${s.baseAsset.toLowerCase()}.png`
        }));

      let futuresAssets = [];
      try {
        const futuresRes = await fetch('https://fapi.binance.com/fapi/v1/exchangeInfo');
        if (futuresRes.ok) {
          const futuresData = await futuresRes.json();
          futuresAssets = (futuresData.symbols || [])
            .filter(s => s.status === 'TRADING' && s.quoteAsset === 'USDT')
            .map(s => ({
              symbol: s.symbol,
              base_asset: s.baseAsset,
              quote_asset: s.quoteAsset,
              name: `${s.baseAsset} Perpetual Futures`,
              precision: s.quantityPrecision,
              tick_size: s.filters.find(f => f.filterType === 'PRICE_FILTER')?.tickSize || '0.01',
              lot_size: s.filters.find(f => f.filterType === 'LOT_SIZE')?.stepSize || '0.0001',
              exchange_status: s.status,
              market_type: 'futures',
              logo_url: `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${s.baseAsset.toLowerCase()}.png`
            }));
        }
      } catch (futErr) {
        logger.warn('WorkspaceService', 'Binance Futures sync failed/unavailable. Continuing with Spot symbols only.', futErr);
      }

      const combined = [...spotAssets, ...futuresAssets];
      await assetRepo.syncAssets(combined);

      logger.info('WorkspaceService', `✓ Synchronized ${combined.length} assets successfully.`);
      return combined;
    } catch (err) {
      logger.error('WorkspaceService', 'Failed to sync Binance exchange assets', err);
      throw err;
    }
  },

  /**
   * Retrieves all synced assets
   */
  async getTradingAssets() {
    let assets = await assetRepo.getAllAssets();
    if (assets.length === 0) {
      assets = await this.syncBinanceAssets();
    }
    return assets;
  },

  /**
   * Calculates advanced technical indicators on a specific timeframe
   */
  async calculateIndicatorsForAsset(symbol, timeframe = '1d') {
    try {
      const provider = MarketProviderFactory.create('binance');
      const baseAsset = symbol.replace('USDT', '').split('/')[0];
      
      const history = await provider.fetchHistory(baseAsset, timeframe, 30);
      if (!history || history.length < 15) {
        throw new Error(`Insufficient candle logs for ${symbol} on ${timeframe}`);
      }

      const closes = history.map(h => h.close);
      const volumes = history.map(h => h.volume);
      const latestClose = closes[closes.length - 1];
      const latestVolume = volumes[volumes.length - 1];

      // SMA & EMA
      const calculateSMA = (data, p) => data.slice(-p).reduce((a, b) => a + b, 0) / p;
      const calculateEMA = (data, p) => {
        let ema = data[0];
        const k = 2 / (p + 1);
        for (let i = 1; i < data.length; i++) {
          ema = data[i] * k + ema * (1 - k);
        }
        return ema;
      };
      
      const sma5 = calculateSMA(closes, 5);
      const sma14 = calculateSMA(closes, 14);
      const ema9 = calculateEMA(closes, 9);
      const ema20 = calculateEMA(closes, 20);

      // RSI
      let gains = 0, losses = 0;
      for (let i = 1; i <= 14; i++) {
        const diff = closes[i] - closes[i - 1];
        if (diff > 0) gains += diff;
        else losses -= diff;
      }
      let avgGain = gains / 14;
      let avgLoss = losses / 14;
      for (let i = 15; i < closes.length; i++) {
        const diff = closes[i] - closes[i - 1];
        avgGain = (avgGain * 13 + (diff > 0 ? diff : 0)) / 14;
        avgLoss = (avgLoss * 13 + (diff < 0 ? -diff : 0)) / 14;
      }
      const rsi = avgLoss === 0 ? 100 : 100 - (100 / (1 + avgGain / avgLoss));

      // Volatility (ATR-like Standard Dev)
      const returns = [];
      for (let i = closes.length - 10; i < closes.length; i++) {
        returns.push((closes[i] - closes[i - 1]) / closes[i - 1]);
      }
      const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
      const vol = Math.sqrt(returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length);

      // Breakouts
      const past14 = closes.slice(-15, -1);
      const high14 = Math.max(...past14);
      const low14 = Math.min(...past14);

      // Volume ratio
      const pastVol = volumes.slice(-11, -1);
      const avgVol = pastVol.reduce((a, b) => a + b, 0) / pastVol.length;
      const volumeRatio = latestVolume / (avgVol || latestVolume);

      return {
        price: latestClose,
        sma5,
        sma14,
        ema9,
        ema20,
        rsi,
        volatility: vol,
        support: low14,
        resistance: high14,
        volumeRatio,
        momentum: ((latestClose - closes[closes.length - 6]) / closes[closes.length - 6]) * 100
      };
    } catch (err) {
      logger.warn('WorkspaceService', `Failed to compute indicators for ${symbol} on ${timeframe}`, err);
      throw err;
    }
  },

  /**
   * Rule-based scanner loops over assets & timeframes, ranking setups
   */
  async scanOpportunities(userId, queryParams = {}) {
    const db = getSupabaseAdmin();
    const assets = await this.getTradingAssets();
    const targetAssets = assets.slice(0, 6); // Scan top 6 assets (BTC, ETH, SOL, LINK, etc.) for performance
    const timeframes = ['5m', '15m', '1h', '4h', '1d'];

    // Load watchlists & portfolio context for personalization
    const { data: watchItems } = await db.from('watchlists').select('asset_symbol').eq('user_id', userId);
    const watchlistSymbols = (watchItems || []).map(w => w.asset_symbol.toUpperCase());

    const { data: portfolio } = await db.from('portfolios').select('id').eq('user_id', userId).maybeSingle();
    let holdingsSymbols = [];
    if (portfolio) {
      const { data: assets } = await db.from('portfolio_assets').select('asset_symbol').eq('portfolio_id', portfolio.id);
      holdingsSymbols = (assets || []).map(a => a.asset_symbol.toUpperCase());
    }

    const scanResults = [];

    for (const asset of targetAssets) {
      for (const tf of timeframes) {
        try {
          const ind = await this.calculateIndicatorsForAsset(asset.symbol, tf);
          
          let action = null;
          let style = 'Scalp';
          let score = 50;
          let entryMin = 0;
          let entryMax = 0;
          let target1 = 0;
          let target2 = 0;
          let stopLoss = 0;
          let description = '';

          const crossoverBull = ind.ema9 > ind.ema20;
          const oversold = ind.rsi < 35;
          const overbought = ins => ind.rsi > 65;

          if (crossoverBull && ind.volumeRatio > 1.2) {
            action = 'LONG';
            style = tf === '1d' ? 'Position' : (tf === '4h' || tf === '1h' ? 'Swing' : 'Intraday');
            score = Math.min(98, 70 + Math.round(ind.rsi * 0.2 + (ind.volumeRatio * 3)));
            entryMin = ind.price * 0.99;
            entryMax = ind.price * 1.01;
            target1 = ind.price * 1.04;
            target2 = ind.price * 1.08;
            stopLoss = ind.price * 0.96;
            description = `Potential Long Opportunity detected on ${tf} timeframe as EMA golden cross is confirmed by positive volume ratios.`;
          } else if (oversold) {
            action = 'LONG';
            style = 'Mean Reversion';
            score = Math.min(95, 75 + Math.round((35 - ind.rsi) * 2));
            entryMin = ind.price * 0.985;
            entryMax = ind.price * 1.005;
            target1 = ind.price * 1.03;
            target2 = ind.price * 1.06;
            stopLoss = ind.price * 0.95;
            description = `Potential Long Opportunity on oversold RSI condition (${Math.round(ind.rsi)}). Support bounce expected.`;
          } else if (!crossoverBull && ind.volumeRatio > 1.3 && ind.rsi > 55) {
            action = 'SHORT';
            style = tf === '1d' ? 'Position' : (tf === '4h' || tf === '1h' ? 'Swing' : 'Intraday');
            score = Math.min(96, 65 + Math.round((ind.rsi - 50) * 0.2 + (ind.volumeRatio * 3)));
            entryMin = ind.price * 0.99;
            entryMax = ind.price * 1.01;
            target1 = ind.price * 0.96;
            target2 = ind.price * 0.92;
            stopLoss = ind.price * 1.04;
            description = `Potential Short Opportunity on bearish crossover confirmed by seller volume expansion.`;
          }

          if (action) {
            const oppId = `workspace-${asset.symbol.toLowerCase()}-${tf}-${action.toLowerCase()}`;
            
            // Personalization boost
            let personalizedScore = score;
            const assetBase = asset.base_asset.toUpperCase();
            if (watchlistSymbols.includes(assetBase)) personalizedScore += 20;
            if (holdingsSymbols.includes(assetBase)) personalizedScore += 15;
            
            const oppObject = {
              id: oppId,
              symbol: asset.symbol,
              baseAsset: asset.base_asset,
              logoUrl: asset.logo_url,
              timeframe: tf,
              direction: action === 'LONG' ? 'Long' : 'Short',
              style,
              opportunityScore: Math.min(100, personalizedScore),
              confidence: score > 85 ? 'High' : (score > 65 ? 'Moderate' : 'Low'),
              riskLevel: ind.volatility > 0.03 ? 'High' : (ind.volatility > 0.015 ? 'Medium' : 'Low'),
              description,
              tradePlan: {
                tradeType: style,
                suggestedEntryZone: `$${entryMin.toFixed(2)} - $${entryMax.toFixed(2)}`,
                optimalEntry: `$${ind.price.toFixed(2)}`,
                stopLoss: `$${stopLoss.toFixed(2)}`,
                takeProfitTargets: [`$${target1.toFixed(2)}`, `$${target2.toFixed(2)}`],
                riskRewardRatio: (Math.abs(target1 - ind.price) / Math.abs(ind.price - stopLoss)).toFixed(1),
                suggestedHoldingTime: tf === '1d' ? '14D - 30D' : (tf === '4h' ? '3D - 7D' : '1D - 3D'),
              },
              indicators: {
                rsi: Math.round(ind.rsi),
                volatility: ind.volatility.toFixed(4),
                support: ind.support.toFixed(2),
                resistance: ind.resistance.toFixed(2)
              }
            };
            
            scanResults.push(oppObject);
            cachedOpportunities.set(oppId, oppObject);
          }
        } catch (tfErr) {
          // Skip timeframe errors
        }
      }
    }

    // Sort by opportunityScore descending
    let filtered = [...scanResults];
    
    // Apply filters
    if (queryParams.timeframe) {
      filtered = filtered.filter(o => o.timeframe === queryParams.timeframe);
    }
    if (queryParams.direction) {
      filtered = filtered.filter(o => o.direction.toLowerCase() === queryParams.direction.toLowerCase());
    }
    if (queryParams.style) {
      filtered = filtered.filter(o => o.style.toLowerCase() === queryParams.style.toLowerCase());
    }
    if (queryParams.search) {
      const q = queryParams.search.toLowerCase();
      filtered = filtered.filter(o => o.symbol.toLowerCase().includes(q) || o.style.toLowerCase().includes(q));
    }

    filtered.sort((a, b) => b.opportunityScore - a.opportunityScore);
    return filtered;
  },

  /**
   * Returns details and drafts Gemini evidence-based AI reasoning for a specific opportunity
   */
  async getOpportunityDetails(userId, opportunityId) {
    let opp = cachedOpportunities.get(opportunityId);

    // If not in cache, try to dynamically reconstruct
    if (!opp) {
      const parts = opportunityId.split('-');
      if (parts.length >= 4) {
        const symbol = parts[1].toUpperCase() + 'USDT';
        const tf = parts[2];
        const assets = await this.getTradingAssets();
        const asset = assets.find(a => a.symbol === symbol);
        if (asset) {
          const ind = await this.calculateIndicatorsForAsset(symbol, tf);
          // Simple reconstruction
          opp = {
            id: opportunityId,
            symbol,
            baseAsset: asset.base_asset,
            logoUrl: asset.logo_url,
            timeframe: tf,
            direction: parts[3] === 'long' ? 'Long' : 'Short',
            style: 'Swing',
            opportunityScore: 78,
            confidence: 'Moderate',
            riskLevel: 'Medium',
            description: `Reconstructed opportunity model.`,
            tradePlan: {
              tradeType: 'Swing',
              suggestedEntryZone: `$${(ind.price * 0.99).toFixed(2)} - $${(ind.price * 1.01).toFixed(2)}`,
              optimalEntry: `$${ind.price.toFixed(2)}`,
              stopLoss: `$${(ind.price * 0.96).toFixed(2)}`,
              takeProfitTargets: [`$${(ind.price * 1.04).toFixed(2)}`, `$${(ind.price * 1.08).toFixed(2)}`],
              riskRewardRatio: '2.0',
              suggestedHoldingTime: '3D - 7D'
            },
            indicators: {
              rsi: Math.round(ind.rsi),
              volatility: ind.volatility.toFixed(4),
              support: ind.support.toFixed(2),
              resistance: ind.resistance.toFixed(2)
            }
          };
        }
      }
    }

    if (!opp) {
      throw ApiError.notFound('Opportunity setup details not found or expired');
    }

    // Call Gemini to generate Evidence-Based Analysis following Ravora Policy
    let aiExplanation = 'Indicators display stabilizing patterns around key bounds.';
    let bullishCase = 'Support holds, leading to price expansion.';
    let bearishCase = 'Support breaks, leading to acceleration of losses.';
    let invalidation = 'Price closes below suggested stop level.';

    try {
      const provider = AiServiceFactory.create();
      const prompt = `You are Araiven, Ravora's AI Market Intelligence Copilot. Analyze this trading setup and write a policy-compliant, evidence-based trade report.
Opportunity: ${opp.symbol} ${opp.direction} on ${opp.timeframe} timeframe.
Indicators: RSI ${opp.indicators.rsi}, Support $${opp.indicators.support}, Resistance $${opp.indicators.resistance}

You MUST follow the RAVORA AI DECISION & RECOMMENDATION POLICY:
- Never use directive buying/selling instructions (Do NOT write "buy now", "sell now").
- Use conditional terms ("Current evidence currently suggests...", "This setup may become attractive if...").
- Output a valid JSON matching this schema exactly:
{
  "explanation": "Brief natural language explanation of why this was surfaced.",
  "bullishScenario": "Detail of bullish target scenarios.",
  "bearishScenario": "Detail of bearish target scenarios.",
  "invalidationConditions": "Specific technical closures that invalidate the trade."
}

Do NOT output anything other than JSON.`;

      const response = await provider.sendRequest([{ role: 'user', content: prompt }], {
        jsonMode: true,
        systemInstruction: "You are Ravora's evidence-based research analyst. Analyze opportunities objectively and return valid JSON."
      });

      const parsed = JSON.parse(response);
      aiExplanation = parsed.explanation || aiExplanation;
      bullishCase = parsed.bullishScenario || bullishCase;
      bearishCase = parsed.bearishScenario || bearishCase;
      invalidation = parsed.invalidationConditions || invalidation;
    } catch (err) {
      logger.warn('WorkspaceService', 'Gemini policy reasoning generation failed', err);
    }

    return {
      opportunity: opp,
      aiAnalysis: {
        opportunitySummary: opp.description,
        technicalEvidence: `RSI is currently resting at ${opp.indicators.rsi}. Support level is identified at $${opp.indicators.support}.`,
        bullishScenario: bullishCase,
        bearishScenario: bearishCase,
        invalidationConditions: invalidation,
        aiExplanation,
        whatToMonitorNext: `Monitor price action around nearest support level $${opp.indicators.support}.`
      }
    };
  },

  /**
   * Watchlist actions
   */
  async getWatchlist(userId) {
    const list = watchlistStore.get(userId) || [];
    return list;
  },

  async toggleWatchlist(userId, symbol) {
    const list = watchlistStore.get(userId) || [];
    const sym = symbol.toUpperCase();
    
    let action = 'added';
    if (list.includes(sym)) {
      const idx = list.indexOf(sym);
      list.splice(idx, 1);
      action = 'removed';
    } else {
      list.push(sym);
    }

    watchlistStore.set(userId, list);

    // Save to Supabase watchlists as well
    try {
      const db = getSupabaseAdmin();
      if (action === 'added') {
        await db.from('watchlists').upsert({ user_id: userId, asset_symbol: sym }, 'user_id,asset_symbol');
      } else {
        await db.from('watchlists').delete().eq('user_id', userId).eq('asset_symbol', sym);
      }
    } catch (dbErr) {
      logger.warn('WorkspaceService', 'Watchlist sync with database failed', dbErr);
    }

    return { action, list };
  },

  /**
   * Alerts actions
   */
  async createAlert(userId, alertData) {
    const userAlerts = alertsStore.get(userId) || [];
    const alertId = 'alert-' + Math.floor(Math.random() * 100000);
    const newAlert = {
      id: alertId,
      userId,
      symbol: alertData.symbol.toUpperCase(),
      timeframe: alertData.timeframe || '1d',
      conditionType: alertData.conditionType, // e.g. price_cross, rsi_bounds, ema_crossover
      thresholdValue: alertData.thresholdValue,
      createdAt: new Date().toISOString()
    };
    userAlerts.push(newAlert);
    alertsStore.set(userId, userAlerts);

    await NotificationService.send(userId, {
      channel: 'market',
      priority: 'low',
      title: 'Alert Registered',
      body: `Successfully set alert for ${newAlert.symbol} trigger conditions.`
    });

    return newAlert;
  }
};
