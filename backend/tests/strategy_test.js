/**
 * Backtesting & Strategy Engine V1 — Integration & Verification Tests
 */

import { initializeDatabase, getSupabaseAdmin } from '../config/database.js';
import { TechnicalIndicators } from '../ai/reasoning/TechnicalIndicators.js';
import { PatternDetector } from '../ai/reasoning/PatternDetector.js';
import { BacktestEngine } from '../ai/reasoning/BacktestEngine.js';

async function runTests() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('     STARTING BACKTESTING & STRATEGY ENGINE TESTS          ');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Initialize DB
  initializeDatabase();
  const db = getSupabaseAdmin();

  // Test User
  const testUserId = '88888888-8888-4888-8888-888888888888';

  try {
    // ----------------------------------------------------
    // TEST 1: Technical Indicators Math
    // ----------------------------------------------------
    console.log('--- TEST 1: Quantitative Indicators Calculations ---');
    const prices = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29];
    
    // SMA
    const sma5 = TechnicalIndicators.calculateSMA(prices, 5);
    console.log(`✓ SMA (period=5) computed. Last value: ${sma5[sma5.length - 1]}`);
    if (sma5[sma5.length - 1] !== 27) {
      throw new Error(`Expected last SMA value to be 27, but got ${sma5[sma5.length - 1]}`);
    }

    // RSI
    const rsi14 = TechnicalIndicators.calculateRSI(prices, 14);
    console.log(`✓ RSI (period=14) computed. Last value: ${Math.round(rsi14[rsi14.length - 1])}`);

    // Bollinger Bands
    const bb = TechnicalIndicators.calculateBollingerBands(prices, 10, 2);
    console.log(`✓ Bollinger Bands computed. Middle=${bb.middle[bb.middle.length - 1]}, Upper=${bb.upper[bb.upper.length - 1]}, Lower=${bb.lower[bb.lower.length - 1]}`);

    console.log('✓ TEST 1 PASSED.\n');

    // ----------------------------------------------------
    // TEST 2: Technical Chart Pattern Recognition
    // ----------------------------------------------------
    console.log('--- TEST 2: Technical Pattern Detections ---');
    
    // Generate mock candle array for FVG
    // Bullish FVG requires low[0] > high[2]
    const fvgCandles = [
      { open: 100, high: 110, low: 95, close: 105, volume: 100 },
      { open: 105, high: 125, low: 105, close: 120, volume: 150 }, // displacement
      { open: 120, high: 90, low: 85, close: 88, volume: 100 }    // c3 high is 90, which is < c1 low of 95
    ];

    const detectedFVGs = PatternDetector.detectFairValueGaps(fvgCandles);
    console.log(`✓ FVG Scanner identified: ${detectedFVGs.length} gaps.`);
    if (detectedFVGs.length !== 1 || detectedFVGs[0].patternName !== 'bullish_fvg') {
      throw new Error('PatternDetector failed to recognize Bullish FVG');
    }

    // Double Top mock candles
    const doubleTopCandles = Array(20).fill(null).map((_, i) => ({
      open: 100, high: 100, low: 90, close: 95, volume: 100, timestamp: new Date(Date.now() - (20 - i) * 86400000).toISOString()
    }));
    // Insert Peaks
    doubleTopCandles[5].high = 150; // peak 1
    doubleTopCandles[12].high = 150; // peak 2

    const detectedDoubleTops = PatternDetector.detectDoubleTopsBottoms(doubleTopCandles);
    console.log(`✓ Double Top Scanner identified: ${detectedDoubleTops.length} matches.`);
    if (detectedDoubleTops.length === 0) {
      throw new Error('PatternDetector failed to recognize Double Top');
    }

    console.log('✓ TEST 2 PASSED.\n');

    // ----------------------------------------------------
    // TEST 3: Backtest Simulation Engine
    // ----------------------------------------------------
    console.log('--- TEST 3: Strategy Simulation runs ---');
    
    // Generate chronological candles for backtesting (100 candles trending upwards with a dip)
    const backtestCandles = Array(100).fill(null).map((_, i) => {
      const trend = i > 40 && i < 60 ? -1.5 : 2.0; // dip in middle
      const prevClose = i === 0 ? 10000 : 0; // will be resolved
      return {
        symbol: 'BTCUSDT',
        open: 10000 + i * trend,
        high: 10100 + i * trend,
        low: 9900 + i * trend,
        close: 10000 + i * trend,
        volume: 1000 + Math.random() * 500,
        timestamp: new Date(Date.now() - (100 - i) * 86400000).toISOString()
      };
    });

    // Strategy Rules: BUY when RSI < 40, SELL when RSI > 60
    const strategyConfig = {
      buyRules: [
        { indicator: 'rsi', operator: '<', value: 40 }
      ],
      sellRules: [
        { indicator: 'rsi', operator: '>', value: 60 }
      ],
      stopLossPct: 3.0, // 3% stop loss
      takeProfitPct: 10.0 // 10% take profit
    };

    const result = await BacktestEngine.runBacktest({
      symbol: 'BTCUSDT',
      timeframe: '1d',
      candles: backtestCandles,
      strategyConfig,
      initialCapital: 10000,
      feePct: 0.001,
      slippagePct: 0.0005
    });

    console.log(`✓ Simulation completed. Final Capital: $${result.finalCapital.toFixed(2)}`);
    console.log(`✓ Total trades executed: ${result.metrics.totalTrades}`);
    console.log(`✓ Win Rate: ${result.metrics.winRate}%, Profit Factor: ${result.metrics.profitFactor}`);
    console.log(`✓ Max Drawdown: ${result.metrics.maxDrawdown}%`);
    console.log(`✓ Sharpe Ratio: ${result.metrics.sharpeRatio}, Sortino Ratio: ${result.metrics.sortinoRatio}`);

    if (result.finalCapital === 10000) {
      throw new Error('Simulation did not perform any trades or adjustments');
    }

    console.log('✓ TEST 3 PASSED.\n');

    // ----------------------------------------------------
    // TEST 4: Saving strategy & listings
    // ----------------------------------------------------
    console.log('--- TEST 4: Persistence Layer tests ---');
    
    // Clear old test data
    await db.from('strategy_definitions').delete().eq('user_id', testUserId);
    await db.from('backtest_results').delete().eq('user_id', testUserId);

    const { StrategyDefinitionRepository } = await import('../repositories/StrategyDefinitionRepository.js');
    const { BacktestResultRepository } = await import('../repositories/BacktestResultRepository.js');
    const stratRepo = new StrategyDefinitionRepository();
    const resRepo = new BacktestResultRepository();

    const strat = await stratRepo.create({
      user_id: testUserId,
      name: 'RSI Swing Trader',
      description: 'DCA entries on oversold zones.',
      indicators_config: { rsi: 14 },
      rules_config: strategyConfig
    });
    console.log(`✓ Strategy saved to DB. ID: ${strat.id}`);

    const savedRes = await resRepo.create({
      user_id: testUserId,
      strategy_id: strat.id,
      symbol: 'BTCUSDT',
      timeframe: '1d',
      start_date: backtestCandles[0].timestamp,
      end_date: backtestCandles[99].timestamp,
      initial_capital: 10000,
      final_capital: result.finalCapital,
      metrics: result.metrics,
      trades: result.trades
    });
    console.log(`✓ Backtest results persisted. ID: ${savedRes.id}`);

    const { data: strats } = await stratRepo.findByUserId(testUserId);
    console.log(`✓ Queried strategy definitions. Count: ${strats.length}`);
    if (strats.length !== 1) {
      throw new Error('Failed to retrieve saved strategy from database');
    }

    console.log('✓ TEST 4 PASSED.\n');

    // ----------------------------------------------------
    // TEST 5: Araiven Integration: Probability analysis
    // ----------------------------------------------------
    console.log('--- TEST 5: Araiven Pro Probability Engines ---');
    
    const prob = await BacktestEngine.calculateProbability('BTCUSDT', '1d', 'bullish_fvg');
    console.log(`✓ FVG Pattern Probability index computed. Success Probability: ${prob.probability}%, Sample Size: ${prob.sampleSize}`);

    console.log('✓ TEST 5 PASSED.\n');

    console.log('═══════════════════════════════════════════════════════════');
    console.log('      ALL STRATEGY & BACKTESTING TESTS PASSED!             ');
    console.log('═══════════════════════════════════════════════════════════');
    process.exit(0);

  } catch (err) {
    console.error('\n❌ TEST RUN FAILED:');
    console.error(err.stack || err.message || err);
    process.exit(1);
  }
}

runTests();
