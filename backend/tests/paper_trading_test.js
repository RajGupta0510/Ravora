/**
 * Paper Trading Engine V1 — Integration & Verification Tests
 */

import { initializeDatabase, getSupabaseAdmin } from '../config/database.js';
import { PaperTradingService } from '../services/PaperTradingService.js';
import { MarketDataService } from '../services/MarketDataService.js';

async function runTests() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('       STARTING PAPER TRADING ENGINE INTEGRATION TESTS     ');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Initialize DB
  initializeDatabase();
  const db = getSupabaseAdmin();

  // Test User
  const testUserId = '88888888-8888-4888-8888-888888888888';

  try {
    // 1. Prepare Test Data & Clean State
    console.log('[Setup] Cleaning old paper trading records...');
    const account = await PaperTradingService.getAccount(testUserId);
    await PaperTradingService.resetAccount(testUserId);
    console.log(`✓ Account reset. Balance: $${account.initial_balance}`);

    // Seed mock price for testing BTCUSDT in MarketCache
    const mockPrice = 64000.00;
    await MarketDataService.persistTickers([
      { symbol: 'BTC', name: 'Bitcoin', price: mockPrice, change24h: 1.5, volume24h: 1200000000 }
    ]);
    console.log(`✓ Seeded live price for BTC: $${mockPrice}`);

    // ----------------------------------------------------
    // TEST 1: Market Order Execution
    // ----------------------------------------------------
    console.log('\n--- TEST 1: Placing Market Buy Order ---');
    const orderData = {
      symbol: 'BTC',
      type: 'market',
      side: 'buy',
      quantity: 0.1, // 0.1 BTC = ~$6,400.00
      leverage: 1.0
    };

    const filledOrder = await PaperTradingService.placeOrder(testUserId, orderData);
    console.log(`✓ Market order placed and filled. Price: $${filledOrder.filled_price}, Status: ${filledOrder.status}`);
    
    // Check balance and positions
    const activeAccount = await PaperTradingService.getAccount(testUserId);
    const openPositions = await PaperTradingService.getOpenPositions(testUserId);

    console.log(`✓ Virtual Account Balance: $${parseFloat(activeAccount.balance).toFixed(2)}`);
    console.log(`✓ Open Positions Count: ${openPositions.length}`);

    if (openPositions.length !== 1 || openPositions[0].symbol !== 'BTC') {
      throw new Error('Failed to create BTC position on Market Buy Order');
    }

    // ----------------------------------------------------
    // TEST 2: Limit Order & Trigger Matching Loop
    // ----------------------------------------------------
    console.log('\n--- TEST 2: Placing Limit Buy Order (Price target: $60,000) ---');
    const limitOrder = await PaperTradingService.placeOrder(testUserId, {
      symbol: 'BTC',
      type: 'limit',
      side: 'buy',
      quantity: 0.05,
      price: 60000.00,
      leverage: 1.0
    });

    console.log(`✓ Pending Limit Order registered. ID: ${limitOrder.id}, Status: ${limitOrder.status}`);

    // Verify order is pending in database
    const pendingOrdersBefore = await db.from('paper_orders').select('*').eq('status', 'pending');
    console.log(`✓ Total Pending Orders in DB: ${pendingOrdersBefore.data?.length}`);
    if (pendingOrdersBefore.data?.length !== 1) {
      throw new Error('Limit order was not recorded as pending');
    }

    // Simulate price movement: Drop BTC price to $59,500.00 (triggers limit buy!)
    console.log('[Simulation] Simulating price drop to $59,500.00...');
    await MarketDataService.persistTickers([
      { symbol: 'BTC', name: 'Bitcoin', price: 59500.00, change24h: -5.0, volume24h: 1500000000 }
    ]);

    // Run matching loop trigger
    await PaperTradingService.processPendingOrders();

    // Verify order got filled
    const pendingOrdersAfter = await db.from('paper_orders').select('*').eq('status', 'pending');
    console.log(`✓ Pending Orders after trigger: ${pendingOrdersAfter.data?.length}`);

    const filledCheck = await db.from('paper_orders').select('*').eq('id', limitOrder.id).single();
    console.log(`✓ Limit order status: ${filledCheck.data.status}, Filled Price: $${filledCheck.data.filled_price}`);
    if (filledCheck.data.status !== 'filled') {
      throw new Error('Limit order was not executed by matching loop');
    }

    // ----------------------------------------------------
    // TEST 3: Closing Positions & Araiven Reviews
    // ----------------------------------------------------
    console.log('\n--- TEST 3: Closing Position & AI Coaching Reviews ---');
    const activePositions = await PaperTradingService.getOpenPositions(testUserId);
    console.log(`✓ Active Positions Count: ${activePositions.length}`);

    const btcPos = activePositions.find(p => p.symbol === 'BTC');
    if (!btcPos) throw new Error('No open BTC position found to close');

    // Close position at $65,000.00 (expect profit!)
    const closed = await PaperTradingService.closePosition(testUserId, btcPos.id, 65000.00);
    console.log(`✓ Position closed. Exit Price: $${closed.exit_price}, P&L: $${parseFloat(closed.pnl).toFixed(2)}`);

    // Verify Araiven review is attached
    const hasReview = !!closed.review_json;
    console.log(`✓ Araiven AI Coach review generated: ${hasReview}`);
    
    if (hasReview) {
      const review = typeof closed.review_json === 'string' ? JSON.parse(closed.review_json) : closed.review_json;
      console.log(`  Verdict: "${review?.verdict?.toUpperCase()}"`);
      console.log(`  Educational insight: "${review?.educationalExplanation}"`);
    }

    // ----------------------------------------------------
    // TEST 4: Performance Analytics & Streaks
    // ----------------------------------------------------
    console.log('\n--- TEST 4: Performance Analytics ---');
    const stats = await PaperTradingService.getStatistics(testUserId);
    console.log(`✓ Total Trades: ${stats.totalTrades}`);
    console.log(`✓ Win Rate: ${stats.winRate}%, Profit Factor: ${stats.profitFactor}`);
    console.log(`✓ Streak Index: ${stats.currentStreak}`);
    console.log(`✓ Max Drawdown: ${stats.maxDrawdown}%`);

    if (stats.totalTrades === 0) {
      throw new Error('Statistics calculations returned empty');
    }

    // ----------------------------------------------------
    // TEST 5: Account Reset
    // ----------------------------------------------------
    console.log('\n--- TEST 5: Resetting Account ---');
    await PaperTradingService.resetAccount(testUserId);
    
    const resetAccount = await PaperTradingService.getAccount(testUserId);
    const resetPositions = await PaperTradingService.getOpenPositions(testUserId);
    const resetOrders = await db.from('paper_orders').select('*').eq('paper_account_id', resetAccount.id);

    console.log(`✓ Reset Balance: $${parseFloat(resetAccount.balance).toFixed(2)}`);
    console.log(`✓ Reset Positions Count: ${resetPositions.length}`);
    console.log(`✓ Reset Orders Count: ${resetOrders.data?.length}`);

    if (parseFloat(resetAccount.balance) !== 100000.00 || resetPositions.length !== 0 || resetOrders.data?.length !== 0) {
      throw new Error('Reset account did not completely clean up positions/orders or restore balance');
    }

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('      ALL PAPER TRADING ENGINE TESTS PASSED!               ');
    console.log('═══════════════════════════════════════════════════════════');
    process.exit(0);

  } catch (err) {
    console.error('\n❌ TEST RUN FAILED:');
    console.error(err.stack || err.message || err);
    process.exit(1);
  }
}

runTests();
