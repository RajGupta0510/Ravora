/**
 * Ravora Backend V1 — Exchange Sync Engine Automated Integration Test Suite
 * Run via: node backend/tests/test_exchange_sync.js
 */

import { initializeDatabase, getSupabaseAdmin } from '../config/database.js';
import { validateEnvironment } from '../config/environment.js';
import { ExchangeSyncService } from '../services/ExchangeSyncService.js';
import { ExchangeFactory } from '../exchange/ExchangeFactory.js';
import { decrypt } from '../utils/encryption.js';
import { logger } from '../utils/logger.js';

async function runTests() {
  console.log('\n=========================================================');
  console.log('  RAVORA EXCHANGE SYNC ENGINE V1 — INTEGRATION TEST SUITE');
  console.log('=========================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Setup Environment & Database
    validateEnvironment();
    initializeDatabase();
    const db = getSupabaseAdmin();

    const testUserId = '00000000-0000-4000-a000-000000000099';

    // Ensure mock portfolio exists
    const { data: existingPortfolio } = await db
      .from('portfolios')
      .select('id')
      .eq('user_id', testUserId)
      .maybeSingle();

    let portfolioId = existingPortfolio?.id;
    if (!portfolioId) {
      const { data: newPortfolio } = await db
        .from('portfolios')
        .insert({ user_id: testUserId, current_balance: 0.0, currency: 'USD' })
        .select()
        .single();
      portfolioId = newPortfolio.id;
    }

    console.log(`[TEST 1] Testing Supported Exchanges Factory`);
    const supportedExchanges = ExchangeFactory.getSupportedExchanges();
    assert(supportedExchanges.includes('binance'), 'Binance supported');
    assert(supportedExchanges.includes('bybit'), 'Bybit supported');
    assert(supportedExchanges.includes('okx'), 'OKX supported');
    assert(supportedExchanges.includes('coinbase'), 'Coinbase supported');
    assert(supportedExchanges.includes('kraken'), 'Kraken supported');

    console.log(`\n[TEST 2] Connecting Exchange Accounts & Credential Encryption`);

    // Connect OKX (with passphrase)
    const okxAccount = await ExchangeSyncService.connectExchange(
      testUserId,
      'okx',
      'test-okx-key-12345',
      'test-okx-secret-98765',
      'test-okx-passphrase-sec'
    );
    assert(okxAccount && okxAccount.exchangeName === 'okx', 'OKX connected successfully');

    // Verify DB encryption for OKX
    const { data: rawDbOkx } = await db
      .from('connected_exchanges')
      .select('*')
      .eq('id', okxAccount.id)
      .single();

    assert(rawDbOkx.api_key_encrypted !== 'test-okx-key-12345', 'API Key is encrypted at rest');
    assert(rawDbOkx.api_secret_encrypted !== 'test-okx-secret-98765', 'API Secret is encrypted at rest');
    assert(rawDbOkx.api_passphrase_encrypted !== 'test-okx-passphrase-sec', 'Passphrase is encrypted at rest');
    assert(decrypt(rawDbOkx.api_key_encrypted) === 'test-okx-key-12345', 'API Key decrypts correctly');
    assert(decrypt(rawDbOkx.api_passphrase_encrypted) === 'test-okx-passphrase-sec', 'Passphrase decrypts correctly');

    // Connect Binance
    const binanceAccount = await ExchangeSyncService.connectExchange(
      testUserId,
      'binance',
      'test-binance-key-12345',
      'test-binance-secret-98765'
    );
    assert(binanceAccount && binanceAccount.exchangeName === 'binance', 'Binance connected successfully');

    console.log(`\n[TEST 3] Multi-Asset Synchronizations (Balances, Positions, Orders, Trade History)`);

    const okxSyncResult = await ExchangeSyncService.syncExchangeAccount(testUserId, okxAccount.id);
    assert(okxSyncResult.success === true, 'OKX sync executed successfully');
    assert(okxSyncResult.assets_imported > 0, 'OKX imported spot balances');
    assert(okxSyncResult.positions_imported > 0, 'OKX imported open futures/margin positions');
    assert(okxSyncResult.orders_imported > 0, 'OKX imported open orders');
    assert(okxSyncResult.trades_imported > 0, 'OKX imported completed trade history');

    const binanceSyncResult = await ExchangeSyncService.syncExchangeAccount(testUserId, binanceAccount.id);
    assert(binanceSyncResult.success === true, 'Binance sync executed successfully');
    assert(binanceSyncResult.assets_imported > 0, 'Binance imported spot balances');

    console.log(`\n[TEST 4] Database State & Foreign Key Relations Verification`);
    const { data: userAssets } = await db.from('portfolio_assets').select('*').eq('portfolio_id', portfolioId);
    assert(userAssets.length >= 4, `Imported ${userAssets.length} portfolio assets across exchanges`);

    const { data: userPositions } = await db.from('positions').select('*').eq('user_id', testUserId);
    assert(userPositions.length >= 1, `Imported ${userPositions.length} active positions`);

    const { data: userOrders } = await db.from('orders').select('*').eq('user_id', testUserId);
    assert(userOrders.length >= 1, `Imported ${userOrders.length} open orders`);

    const { data: userTrades } = await db.from('trade_history').select('*').eq('user_id', testUserId);
    assert(userTrades.length >= 1, `Imported ${userTrades.length} historical trade records`);

    console.log(`\n[TEST 5] Incremental Sync & Duplicate Prevention Test`);
    const countBefore = userTrades.length;
    await ExchangeSyncService.syncExchangeAccount(testUserId, okxAccount.id);
    const { data: userTradesAfter } = await db.from('trade_history').select('*').eq('user_id', testUserId);
    assert(userTradesAfter.length === countBefore, 'Incremental sync prevented duplicate trade imports');

    console.log(`\n[TEST 6] Status Inspection API Method`);
    const statusResult = await ExchangeSyncService.getSyncStatus(testUserId, okxAccount.id);
    assert(statusResult.exchangeName === 'okx', 'getSyncStatus returned exchange name');
    assert(statusResult.status === 'active', 'getSyncStatus returned active status');
    assert(statusResult.latestSync && statusResult.latestSync.syncStatus === 'success', 'getSyncStatus payload matches');

    console.log(`\n[TEST 7] Disconnection & Data Cleanup Test`);
    await ExchangeSyncService.disconnectExchange(testUserId, okxAccount.id);
    await ExchangeSyncService.disconnectExchange(testUserId, binanceAccount.id);

    const { data: remainingAssets } = await db.from('portfolio_assets').select('*').eq('portfolio_id', portfolioId);
    assert(remainingAssets.length === 0, 'Disconnected exchanges cleaned up portfolio assets');

    const { data: remainingExchanges } = await db.from('connected_exchanges').select('*').eq('user_id', testUserId);
    assert(remainingExchanges.length === 0, 'Disconnected exchange credentials removed from database');

    console.log('\n=========================================================');
    console.log(`  RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('=========================================================\n');

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }

  } catch (err) {
    console.error('Fatal test exception:', err);
    process.exit(1);
  }
}

runTests();
