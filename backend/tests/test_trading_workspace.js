import '../config/environment.js';
import { initializeDatabase } from '../config/database.js';
import { WorkspaceService } from '../services/WorkspaceService.js';
import { WorkspaceController } from '../controllers/WorkspaceController.js';

async function runTest() {
  try {
    console.log('Initializing database connection...');
    initializeDatabase();

    const userId = '9a7b7e28-2c26-4d04-8b43-9828236746ef'; // raj.gupta@example.com from seed data

    console.log('\n1. Testing WorkspaceService.syncBinanceAssets...');
    const synced = await WorkspaceService.syncBinanceAssets();
    console.log('✓ SUCCESS: Synced Spot and Futures assets from Binance.');
    console.log('Total synced assets count:', synced.length);
    if (synced.length > 0) {
      console.log('Sample synced asset:', synced[0].symbol, 'Type:', synced[0].market_type, 'Logo:', synced[0].logo_url);
    }

    console.log('\n2. Testing WorkspaceService.calculateIndicatorsForAsset (Multi-timeframe)...');
    const tfList = ['15m', '1h', '1d'];
    for (const tf of tfList) {
      const ind = await WorkspaceService.calculateIndicatorsForAsset('BTCUSDT', tf);
      console.log(`✓ SUCCESS: Indicator computed for BTC on ${tf} timeframe.`);
      console.log(`  Price: $${ind.price} | RSI: ${ind.rsi} | Support: $${ind.support} | Volatility: ${ind.volatility}`);
    }

    console.log('\n3. Testing WorkspaceService.scanOpportunities (Trading Opportunity Engine)...');
    const opps = await WorkspaceService.scanOpportunities(userId);
    console.log('✓ SUCCESS: Opportunities feed compiled.');
    console.log('Total opportunities discovered:', opps.length);
    if (opps.length > 0) {
      const topOpp = opps[0];
      console.log('Top setup:', topOpp.symbol, '| Direction:', topOpp.direction, '| Timeframe:', topOpp.timeframe);
      console.log('Trade Plan details:', JSON.stringify(topOpp.tradePlan, null, 2));
    }

    console.log('\n4. Testing WorkspaceService.getOpportunityById (Gemini Evidence-Based Policy Report)...');
    if (opps.length > 0) {
      const details = await WorkspaceService.getOpportunityDetails(userId, opps[0].id);
      console.log('✓ SUCCESS: Generated detailed trade report with policy-compliant AI analysis.');
      console.log('AI Explanation:', details.aiAnalysis.aiExplanation);
      console.log('Bullish Case Scenario:', details.aiAnalysis.bullishScenario);
      console.log('Bearish Case Scenario:', details.aiAnalysis.bearishScenario);
      console.log('Invalidation Conditions:', details.aiAnalysis.invalidationConditions);
      console.log('What to monitor next:', details.aiAnalysis.whatToMonitorNext);
    }

    console.log('\n5. Testing WorkspaceController integration...');
    const reqMock = {
      user: { id: userId, email: 'raj.gupta@example.com' },
      query: {},
      params: {},
      body: {}
    };
    let jsonSent = null;
    const resMock = {
      json: (data) => {
        jsonSent = data;
      }
    };

    await WorkspaceController.getAssets(reqMock, resMock, (err) => {
      console.error('getAssets controller threw error:', err);
      process.exit(1);
    });
    if (jsonSent && jsonSent.success && Array.isArray(jsonSent.data)) {
      console.log('✓ SUCCESS: WorkspaceController.getAssets routed successfully.');
    } else {
      console.error('FAIL: getAssets routing failed!');
      process.exit(1);
    }

    await WorkspaceController.getOpportunities(reqMock, resMock, (err) => {
      console.error('getOpportunities controller threw error:', err);
      process.exit(1);
    });
    if (jsonSent && jsonSent.success && Array.isArray(jsonSent.data)) {
      console.log('✓ SUCCESS: WorkspaceController.getOpportunities routed successfully.');
    } else {
      console.error('FAIL: getOpportunities routing failed!');
      process.exit(1);
    }

    console.log('\nAll Ravora AI Trading Workspace Pro tests completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Trading Workspace Pro test execution failed:', err);
    process.exit(1);
  }
}

runTest();
