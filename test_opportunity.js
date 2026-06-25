import { initializeDatabase } from './src/database.js';
import { MarketDataService } from './src/services/marketDataService.js';
import { runOpportunityEngine } from './src/services/opportunity/opportunityEngine.js';

async function test() {
  try {
    console.log('Initializing database...');
    await initializeDatabase();
    console.log('Fetching overview...');
    const tickers = await MarketDataService.getOverview();
    console.log('Running Opportunity Engine...');
    const results = await runOpportunityEngine(tickers, MarketDataService.getAssetDetails.bind(MarketDataService));
    console.log('Success! Results count:', results.length);
    console.log('Top opportunity:', JSON.stringify(results[0], null, 2));
  } catch (err) {
    console.error('Test failed:', err);
  }
}

test();
