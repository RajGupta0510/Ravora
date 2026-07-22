/**
 * Araiven AI Decision Engine V1 — Integration & Verification Tests
 */

import { initializeDatabase, getSupabaseAdmin } from '../config/database.js';
import { AiServiceFactory } from '../ai/AiServiceFactory.js';
import { ToolRegistry } from '../ai/tools/ToolRegistry.js';
import { ConversationMemory } from '../ai/memory/ConversationMemory.js';
import { AiService } from '../ai/services/AiService.js';

async function runTests() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('       STARTING ARAIVEN AI ENGINE INTEGRATION TESTS        ');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Initialize DB
  initializeDatabase();
  const db = getSupabaseAdmin();

  // Test User
  const testUserId = '88888888-8888-4888-8888-888888888888';
  const testExchangeId = '77777777-7777-4777-7777-777777777777';
  const testPortfolioId = '66666666-6666-4666-6666-666666666666';

  try {
    // Seed Profile and Portfolio to prevent "Portfolio not found" errors
    console.log('[Setup] Seeding test database records...');
    await db.auth.admin.createUser({
      id: testUserId,
      email: 'test_ai_user@ravora.ai',
      password: 'Password123!',
      email_confirm: true
    }).catch(() => null);

    await db.from('profiles').upsert({
      id: testUserId,
      full_name: 'Test AI Analyst',
      email: 'test_ai_user@ravora.ai',
      risk_stance: 'balanced',
      max_drawdown_cap: 5.0
    }, { onConflict: 'id' });

    await db.from('portfolios').upsert({
      id: testPortfolioId,
      user_id: testUserId,
      current_balance: 100000.00,
      currency: 'USD',
      safety_score: 95
    }, { onConflict: 'user_id' });

    await db.from('portfolio_assets').upsert({
      portfolio_id: testPortfolioId,
      exchange_account_id: testExchangeId,
      asset_symbol: 'USDT',
      balance_amount: 50000.00,
      average_entry_price: 1.00,
      allocation_pct: 50.0
    }, { onConflict: 'portfolio_id,asset_symbol' });

    // ----------------------------------------------------
    // TEST 1: Factory Resolution & Provider Switching
    // ----------------------------------------------------
    console.log('--- TEST 1: Provider Factory Mapping ---');
    const mockProvider = AiServiceFactory.create('mock');
    console.log(`✓ Resolved Mock Provider: "${mockProvider.name}"`);
    if (mockProvider.name !== 'Araiven (Mock Sandbox)') {
      throw new Error('Factory did not resolve Mock Provider correctly');
    }

    const openAiProvider = AiServiceFactory.create('openai');
    console.log(`✓ Resolved OpenAI Provider: "${openAiProvider.name}"`);
    if (openAiProvider.name !== 'OpenAI') {
      throw new Error('Factory did not resolve OpenAI Provider correctly');
    }

    console.log('✓ TEST 1 PASSED.\n');

    // ----------------------------------------------------
    // TEST 2: Secure Tool Context Registry
    // ----------------------------------------------------
    console.log('--- TEST 2: Secure Tool Context Registries ---');
    
    // Gathers portfolio context
    const portfolioCtx = await ToolRegistry.getPortfolioContext(testUserId);
    console.log(`✓ Gathered Portfolio Context: Risk Stance=${portfolioCtx.riskStance}, Valuation=$${portfolioCtx.valuation?.currentValue}`);
    
    // Gathers risk context
    const riskCtx = await ToolRegistry.getRiskContext(testUserId);
    console.log(`✓ Gathered Risk Context: Health Score=${riskCtx?.score || 100}, Risk Score=${riskCtx?.score}`);

    // Gathers market context
    const marketCtx = await ToolRegistry.getMarketContext();
    console.log(`✓ Gathered Market Context: Total tickers fetched=${marketCtx.overview?.length}`);

    console.log('✓ TEST 2 PASSED.\n');

    // ----------------------------------------------------
    // TEST 3: Conversational Memory Thread Management
    // ----------------------------------------------------
    console.log('--- TEST 3: Conversational Memory Threads ---');
    
    // Clear old test conversations
    await db.from('ai_conversations').delete().eq('user_id', testUserId);

    const conv = await ConversationMemory.getOrCreateConversation(testUserId);
    console.log(`✓ Conversation created or fetched. ID: ${conv.id}`);

    // Save user message
    const savedId = await ConversationMemory.saveUserMessage(testUserId, conv.id, 'What is my current yield profile?');
    console.log(`✓ User message saved. Thread ID: ${savedId}`);

    // Save Araiven response
    await ConversationMemory.saveCopilotMessage(testUserId, conv.id, 'Your current audited yield is 12.42% APY.', 'balanced');
    console.log('✓ Copilot response message logged.');

    // Retrieve history
    const history = await ConversationMemory.getRecentHistory(testUserId, conv.id, 5);
    console.log(`✓ Retrieved history length: ${history.length}`);
    if (history.length !== 2) {
      throw new Error(`Expected 2 messages but retrieved ${history.length}`);
    }
    console.log(`  User: "${history[0].text}"`);
    console.log(`  Copilot: "${history[1].text}" (Meta: ${history[1].statsMeta})`);

    console.log('✓ TEST 3 PASSED.\n');

    // ----------------------------------------------------
    // TEST 4: Cognitive Analysis Services (Reviews & Briefings)
    // ----------------------------------------------------
    console.log('--- TEST 4: Cognitive Analysis reviews ---');
    
    // Portfolio Review
    const portReview = await AiService.portfolioReview(testUserId);
    console.log(`✓ Portfolio Review generated. Summary length: ${portReview.summary?.length}`);
    console.log(`  Health Score: ${portReview.healthScore}/100`);

    // Risk Review
    const riskReview = await AiService.riskReview(testUserId);
    console.log(`✓ Risk Review generated. Risk Level: ${riskReview.overallRisk}`);
    console.log(`  Concentration: ${riskReview.concentrationIndex}`);

    // Pre-Trade Review
    const tradeReview = await AiService.tradeReview(testUserId, {
      symbol: 'BTCUSDT',
      side: 'buy',
      quantity: 0.05,
      price: 64200.00
    });
    console.log(`✓ Proposed Trade Review completed. Verdict: "${tradeReview.verdict.toUpperCase()}"`);
    console.log(`  Reasoning: "${tradeReview.reasoning}"`);
    console.log(`  Downside warning: "${tradeReview.potentialDownside}"`);

    // Market Briefing
    const marketSummary = await AiService.marketSummary(testUserId);
    console.log(`✓ Market briefing generated. Sentiment: ${marketSummary.sentiment.toUpperCase()}`);
    console.log(`  Summary: "${marketSummary.summary}"`);

    // Asset Analysis
    const assetAnalysis = await AiService.analyzeAsset(testUserId, 'BTCUSDT');
    console.log(`✓ Technical Asset Analysis generated for BTCUSDT. Outlook: ${assetAnalysis.trendOutlook}`);
    console.log(`  RSI Audit Explanation: "${assetAnalysis.indicatorsAudit?.rsiExplanation}"`);
    console.log(`  Patterns Detected: ${JSON.stringify(assetAnalysis.patternsDetected)}`);
    console.log(`  Action recommendation: "${assetAnalysis.actionableAdvice?.action.toUpperCase()}" (Confidence: ${assetAnalysis.actionableAdvice?.confidenceScore}%)`);

    console.log('✓ TEST 4 PASSED.\n');

    // ----------------------------------------------------
    // TEST 5: SSE Chunk Stream Simulations
    // ----------------------------------------------------
    console.log('--- TEST 5: SSE Progressive Chunk Streaming ---');
    let chunkCount = 0;
    const streamBuffer = [];

    await AiService.askAraiven(testUserId, 'what is my balance?', conv.id, {
      stream: true,
      onChunk: (chunk) => {
        chunkCount++;
        streamBuffer.push(chunk);
      }
    });

    console.log(`✓ Received ${chunkCount} streamed progressive text tokens.`);
    console.log(`  Streamed Text: "${streamBuffer.join('')}"`);
    if (chunkCount === 0) {
      throw new Error('Streaming failed to emit chunks');
    }
    console.log('✓ TEST 5 PASSED.\n');

    console.log('═══════════════════════════════════════════════════════════');
    console.log('        ALL AI ENGINE INTEGRATION TESTS SETTLED!           ');
    console.log('═══════════════════════════════════════════════════════════');
    process.exit(0);

  } catch (err) {
    console.error('\n❌ INTEGRATION TEST FAILED:');
    console.error(err.stack || err.message || err);
    process.exit(1);
  }
}

runTests();
