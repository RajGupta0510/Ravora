/**
 * News & Sentiment Engine V1 — Integration & Verification Tests
 */

import { initializeDatabase, getSupabaseAdmin } from '../config/database.js';
import { NewsService } from '../services/NewsService.js';
import { ToolRegistry } from '../ai/tools/ToolRegistry.js';

async function runTests() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('       STARTING NEWS & SENTIMENT ENGINE INTEGRATION TESTS  ');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Initialize DB
  initializeDatabase();
  const db = getSupabaseAdmin();

  // Test User
  const testUserId = '88888888-8888-4888-8888-888888888888';

  try {
    // Clean old news data to isolate test runs (gracefully handle missing tables)
    try {
      console.log('[Setup] Cleaning old news data...');
      await db.from('news_bookmarks').delete().eq('user_id', testUserId);
      await db.from('news_articles').delete().eq('source', 'Bloomberg (Simulated)');
      await db.from('news_articles').delete().eq('source', 'CoinDesk (Simulated)');
      await db.from('news_articles').delete().eq('source', 'Cointelegraph (Simulated)');
      await db.from('news_articles').delete().eq('source', 'Binance News (Simulated)');
      console.log('✓ Old data cleaned.');
    } catch (err) {
      console.warn('[Setup] Database cleanup bypassed (news tables not migrated). using in-memory fallbacks.');
    }

    // ----------------------------------------------------
    // TEST 1: News Ingestion & Duplicate Detection
    // ----------------------------------------------------
    console.log('\n--- TEST 1: Ingestion & Duplicate Filtering ---');
    
    // Ingest first run
    const firstRunSynced = await NewsService.syncNews();
    console.log(`✓ First run completed. Synced new articles: ${firstRunSynced}`);
    if (firstRunSynced === 0) {
      throw new Error('NewsService synced 0 mock articles on first execution');
    }

    // Ingest second run immediately (expecting 0 additions due to duplicate matching)
    const secondRunSynced = await NewsService.syncNews();
    console.log(`✓ Second run completed. Synced new articles (duplicates): ${secondRunSynced}`);
    if (secondRunSynced !== 0) {
      throw new Error(`Deduplicator failed! Re-ingested ${secondRunSynced} duplicate articles.`);
    }

    console.log('✓ TEST 1 PASSED.');

    // ----------------------------------------------------
    // TEST 2: Local Rule-Based Sentiment Analysis Math
    // ----------------------------------------------------
    console.log('\n--- TEST 2: Local Sentiment Analysis Math ---');

    const bullishText = "Bitcoin ETF is experiencing a massive rally as buying pressure breakouts to the highest levels.";
    const bearishText = "Solana network drops as major DeFi protocol hack triggers a bearish liquidation selloff.";
    const neutralText = "The price of Ethereum consolidates around key support level after morning volatility.";

    const bullRes = NewsService.analyzeSentimentLocally(bullishText);
    const bearRes = NewsService.analyzeSentimentLocally(bearishText);
    const neutRes = NewsService.analyzeSentimentLocally(neutralText);

    console.log(`✓ Bullish text analysis: Sentiment="${bullRes.sentiment}", Score=${bullRes.score}`);
    console.log(`✓ Bearish text analysis: Sentiment="${bearRes.sentiment}", Score=${bearRes.score}`);
    console.log(`✓ Neutral text analysis: Sentiment="${neutRes.sentiment}", Score=${neutRes.score}`);

    if (bullRes.sentiment === 'Neutral' || bullRes.score <= 0.5) {
      throw new Error('Sentiment analyzer failed to score bullish text correctly');
    }
    if (bearRes.sentiment === 'Neutral' || bearRes.score >= 0.5) {
      throw new Error('Sentiment analyzer failed to score bearish text correctly');
    }

    console.log('✓ TEST 2 PASSED.');

    // ----------------------------------------------------
    // TEST 3: Local Market Impact Scoring
    // ----------------------------------------------------
    console.log('\n--- TEST 3: Market Impact Rating ---');

    const criticalText = "Breaking: Federal Reserve announces rate cut following sudden CPI spike.";
    const highText = "Fidelity files spot Solana ETF application with SEC.";
    const lowText = "A local analyst discusses Bitcoin price ranges on YouTube.";

    const criticalRes = NewsService.evaluateMarketImpactLocally(criticalText);
    const highRes = NewsService.evaluateMarketImpactLocally(highText);
    const lowRes = NewsService.evaluateMarketImpactLocally(lowText);

    console.log(`✓ Critical text: Impact="${criticalRes.impact}"`);
    console.log(`✓ High text: Impact="${highRes.impact}"`);
    console.log(`✓ Low text: Impact="${lowRes.impact}"`);

    if (criticalRes.impact !== 'critical' || highRes.impact !== 'high' || lowRes.impact !== 'low') {
      throw new Error('Market impact scorer failed to match correct ratings');
    }

    console.log('✓ TEST 3 PASSED.');

    // ----------------------------------------------------
    // TEST 4: Mappings & Queries APIs
    // ----------------------------------------------------
    console.log('\n--- TEST 4: Mappings and Service Queries ---');

    // Retrieve latest news
    const latest = await NewsService.getLatestNews(10);
    console.log(`✓ Retried latest articles. Total: ${latest.length}`);

    // Retrieve SOL asset mapped news
    const solNews = await NewsService.getAssetNews('SOL', 5);
    console.log(`✓ Mapped Solana news articles count: ${solNews.length}`);
    if (solNews.length === 0) {
      throw new Error('Asset mapping failed to link Solana keywords to articles');
    }

    // Retrieve sentiment calculations for SOL
    const solSentiment = await NewsService.getSentiment('SOL');
    const solImpact = await NewsService.getMarketImpact('SOL');
    console.log(`✓ Solana overall sentiment: "${solSentiment.overallSentiment}" (Avg Score: ${solSentiment.averageScore})`);
    console.log(`✓ Solana overall impact: "${solImpact.overallImpact}" (Criticals count: ${solImpact.criticalCount})`);

    console.log('✓ TEST 4 PASSED.');

    // ----------------------------------------------------
    // TEST 5: Bookmarks persistence
    // ----------------------------------------------------
    console.log('\n--- TEST 5: User Bookmarking & Listings ---');

    const targetArticle = solNews[0];
    
    // Add bookmark
    const bookmark = await NewsService.bookmarkArticle(testUserId, targetArticle.id);
    console.log(`✓ Article bookmarked successfully. Bookmark ID: ${bookmark.id || bookmark.article_id}`);

    // List user bookmarks
    const list = await NewsService.getBookmarks(testUserId);
    console.log(`✓ Mapped Bookmarks count retrieved: ${list.length}`);
    if (list.length !== 1) {
      throw new Error('Bookmarks retrieval returned invalid counts');
    }

    console.log('✓ TEST 5 PASSED.');

    // ----------------------------------------------------
    // TEST 6: Araiven Integration context
    // ----------------------------------------------------
    console.log('\n--- TEST 6: ToolRegistry Araiven Integration context ---');

    const context = await ToolRegistry.getNewsSentimentContext('SOL');
    console.log(`✓ ToolRegistry news context generated for SOL.`);
    console.log(`  Overall Sentiment: "${context.overallSentiment}"`);
    console.log(`  Impact: "${context.overallImpact}"`);
    console.log(`  Recent Headlines Count: ${context.recentHeadlines?.length}`);

    if (context.recentHeadlines?.length === 0) {
      throw new Error('Araiven news context bridge failed');
    }

    console.log('✓ TEST 6 PASSED.');

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('      ALL NEWS & SENTIMENT ENGINE TESTS PASSED!            ');
    console.log('═══════════════════════════════════════════════════════════');
    process.exit(0);

  } catch (err) {
    console.error('\n❌ TEST RUN FAILED:');
    console.error(err.stack || err.message || err);
    process.exit(1);
  }
}

runTests();
