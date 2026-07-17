/**
 * Quantitative Scanner Service — evaluates live market data and generates real trading signals.
 */

import { MarketProviderFactory } from '../market/MarketProviderFactory.js';
import { getSupabaseAdmin } from '../config/database.js';
import { logger } from '../utils/logger.js';

export const QuantitativeScannerService = {
  /**
   * Evaluates live market data for a symbol and returns technical indicators
   */
  async calculateIndicators(symbol) {
    try {
      const provider = MarketProviderFactory.create('binance');
      // Fetch 30 daily candles to calculate 14-period RSI, SMAs, volatility, and breakouts
      const history = await provider.fetchHistory(symbol, '1d', 30);
      if (!history || history.length < 15) {
        throw new Error(`Insufficient historical data for ${symbol} (needs at least 15 candles)`);
      }

      const closes = history.map(h => h.close);
      const volumes = history.map(h => h.volume);
      const latestClose = closes[closes.length - 1];
      const latestVolume = volumes[volumes.length - 1];

      // 1. Calculate Simple Moving Averages (5-day vs 14-day)
      const calculateSMA = (data, period) => {
        const slice = data.slice(-period);
        return slice.reduce((a, b) => a + b, 0) / period;
      };
      const sma5 = calculateSMA(closes, 5);
      const sma14 = calculateSMA(closes, 14);

      // 2. Calculate Relative Strength Index (RSI - 14 period standard)
      const calculateRSI = (data) => {
        const changes = [];
        for (let i = 1; i < data.length; i++) {
          changes.push(data[i] - data[i - 1]);
        }

        let gains = 0;
        let losses = 0;
        // First 14 changes
        for (let i = 0; i < 14; i++) {
          const change = changes[i];
          if (change > 0) gains += change;
          else losses -= change;
        }

        let avgGain = gains / 14;
        let avgLoss = losses / 14;

        // Smoothing subsequent periods
        for (let i = 14; i < changes.length; i++) {
          const change = changes[i];
          const gain = change > 0 ? change : 0;
          const loss = change < 0 ? -change : 0;
          avgGain = (avgGain * 13 + gain) / 14;
          avgLoss = (avgLoss * 13 + loss) / 14;
        }

        if (avgLoss === 0) return 100;
        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
      };
      const rsi = calculateRSI(closes);

      // 3. Price Momentum (5-day rate of change)
      const fiveDaysAgoClose = closes[closes.length - 6] || closes[0];
      const momentum = ((latestClose - fiveDaysAgoClose) / fiveDaysAgoClose) * 100;

      // 4. Volume Spike (current volume compared to 10-day average)
      const pastVolumes = volumes.slice(-11, -1); // 10 days before today
      const avgVolume10d = pastVolumes.length > 0 ? (pastVolumes.reduce((a, b) => a + b, 0) / pastVolumes.length) : latestVolume;
      const volumeRatio = avgVolume10d > 0 ? (latestVolume / avgVolume10d) : 1;
      const volumeSpike = volumeRatio >= 1.5;

      // 5. Volatility (Standard deviation of daily returns over past 10 days)
      const dailyReturns = [];
      const pastCloses = closes.slice(-11);
      for (let i = 1; i < pastCloses.length; i++) {
        dailyReturns.push((pastCloses[i] - pastCloses[i - 1]) / pastCloses[i - 1]);
      }
      const meanReturn = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
      const variance = dailyReturns.reduce((a, b) => a + Math.pow(b - meanReturn, 2), 0) / dailyReturns.length;
      const volatility = Math.sqrt(variance);

      // 6. Breakouts (High/Low bounds of past 14 days)
      const past14Closes = closes.slice(-15, -1);
      const high14d = Math.max(...past14Closes);
      const low14d = Math.min(...past14Closes);
      
      const nearestSupport = low14d;
      const nearestResistance = high14d;
      const distanceToSupport = ((latestClose - nearestSupport) / latestClose) * 100;
      const distanceToResistance = ((nearestResistance - latestClose) / latestClose) * 100;

      return {
        price: latestClose,
        sma5,
        sma14,
        rsi,
        momentum,
        volumeRatio,
        volumeSpike,
        volatility,
        nearestSupport,
        nearestResistance,
        distanceToSupport,
        distanceToResistance
      };
    } catch (err) {
      logger.error('Scanner', `Failed to calculate indicators for ${symbol}`, { error: err.message });
      throw err;
    }
  },

  /**
   * Scans live markets and generates opportunities & user recommendations
   */
  async scanAndGenerate(userId) {
    const db = getSupabaseAdmin();
    const symbols = ['BTC', 'ETH', 'SOL', 'LINK', 'SUI', 'BNB'];
    const activeOpps = [];

    // Fetch user profile to match risk profile
    const { data: profile } = await db
      .from('profiles')
      .select('risk_stance, capital')
      .eq('id', userId)
      .maybeSingle();
    const riskStance = profile?.risk_stance || 'balanced';
    const capital = parseFloat(profile?.capital || 100000);

    for (const sym of symbols) {
      try {
        const ind = await this.calculateIndicators(sym);

        let signal = 'HOLD';
        let type = 'consolidation';
        let score = 50;
        let stopLoss = 0;
        let takeProfit = 0;
        let reasoning = '';

        const bullishCrossover = ind.sma5 > ind.sma14;
        const oversold = ind.rsi < 35;
        const overbought = ind.rsi > 65;

        // Long Signal Evaluation
        if (bullishCrossover && !overbought && (ind.volumeSpike || ind.rsi < 45)) {
          signal = 'LONG';
          type = 'breakout';
          score = Math.min(98, 70 + Math.round(ind.rsi * 0.2 + (ind.volumeRatio * 5)));
          stopLoss = ind.price * 0.95; // 5% stop loss
          takeProfit = ind.price * 1.15; // 15% take profit
          reasoning = `${sym} displays bullish moving average crossover supported by volume expansion. RSI at ${Math.round(ind.rsi)} suggests headroom.`;
        }
        // Short Signal Evaluation
        else if (!bullishCrossover && !oversold && (ind.volumeSpike || ind.rsi > 55)) {
          signal = 'SHORT';
          type = 'breakdown';
          score = Math.min(98, 65 + Math.round((100 - ind.rsi) * 0.2 + (ind.volumeRatio * 4)));
          stopLoss = ind.price * 1.05; // 5% stop loss
          takeProfit = ind.price * 0.85; // 15% take profit
          reasoning = `${sym} has broken down below short-term moving average with active seller volume. Target support range is active.`;
        }

        if (signal !== 'HOLD') {
          const oppId = `opp-${sym.toLowerCase()}-${signal.toLowerCase()}`;
          const oppData = {
            id: oppId,
            name: `${sym} ${signal} Spot Setup`,
            symbol: `${sym}/USDT`,
            icon_symbol: sym,
            opportunity_type: signal, // Maps directly to UI expectation ('LONG' / 'SHORT')
            opportunity_score: score,
            confidence_score: score - 5,
            risk_score: Math.round(ind.volatility * 1000),
            risk_level: ind.volatility > 0.03 ? 'high' : (ind.volatility > 0.015 ? 'medium' : 'low'),
            expected_return: signal === 'LONG' ? 15.0 : 12.0,
            reasoning_text: reasoning,
            suggested_entry: ind.price,
            suggested_stop_loss: stopLoss,
            suggested_take_profit: takeProfit,
            suggested_take_profit_1: ind.price + (takeProfit - ind.price) * 0.33,
            suggested_take_profit_2: ind.price + (takeProfit - ind.price) * 0.66,
            suggested_take_profit_3: takeProfit,
            expected_duration: '3D - 7D',
            risk_reward_ratio: 3.0,
            trend_direction: signal === 'LONG' ? 'bullish' : 'bearish',
            trend_strength: Math.round(ind.momentum * 10),
            nearest_support: ind.nearestSupport,
            nearest_resistance: ind.nearestResistance,
            distance_to_support: ind.distanceToSupport,
            distance_to_resistance: ind.distanceToResistance,
            market_bias: signal === 'LONG' ? 'Bullish' : 'Bearish'
          };

          // Save opportunity to DB
          await db.from('opportunities').upsert(oppData);
          activeOpps.push(oppData);

          // Map recommendations based on user risk stance
          let allocationPct = 10.0;
          if (riskStance === 'conservative') allocationPct = 10.0;
          else if (riskStance === 'aggressive') allocationPct = 30.0;
          else allocationPct = 20.0; // balanced

          await db.from('araiven_recommendations').upsert({
            user_id: userId,
            opportunity_id: oppId,
            suggested_allocation_pct: allocationPct,
            status: 'pending',
            reasoning_text: `quantitative analysis triggered a ${signal} signal. Allocating ${allocationPct}% of capital matches your ${riskStance} profile.`
          }, 'user_id,opportunity_id');
        }
      } catch (err) {
        logger.warn('Scanner', `Skipping quantitative scan for ${sym} due to error: ${err.message}`);
      }
    }

    logger.info('Scanner', `Quantitative scan complete. Generated ${activeOpps.length} live opportunities.`);
    return activeOpps;
  }
};
