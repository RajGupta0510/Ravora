import '../config/environment.js';
import { initializeDatabase } from '../config/database.js';
import { DiscoverService } from '../services/DiscoverService.js';
import { DiscoverController } from '../controllers/DiscoverController.js';

async function runTest() {
  try {
    console.log('Initializing database connection...');
    initializeDatabase();

    const userId = '9a7b7e28-2c26-4d04-8b43-9828236746ef'; // raj.gupta@example.com from seed data

    console.log('\n1. Testing DiscoverService.generateInsights...');
    const insights = await DiscoverService.generateInsights(userId);
    console.log('✓ SUCCESS: Generated raw discover insights.');
    console.log('Insights count:', insights.length);
    if (insights.length > 0) {
      console.log('First Insight:', insights[0].title, '| Category:', insights[0].category, '| Priority:', insights[0].priority);
    }

    console.log('\n2. Testing DiscoverService.getPersonalizedFeed (Smart Grouping)...');
    const groupedFeed = await DiscoverService.getPersonalizedFeed(userId);
    console.log('✓ SUCCESS: Grouped and ranked personalized feed compiled.');
    groupedFeed.forEach(group => {
      console.log(`Asset Group: ${group.asset} (${group.symbol}) | Primary Score: ${group.primaryScore}`);
      group.insights.forEach(ins => {
        console.log(`  - [${ins.category.toUpperCase()}] ${ins.title} (Freshness: ${ins.timestamp})`);
      });
    });

    console.log('\n3. Testing DiscoverService.getDailyBriefing...');
    const briefing = await DiscoverService.getDailyBriefing(userId);
    console.log('✓ SUCCESS: Daily AI Briefing generated.');
    console.log(`Briefing content:\n"${briefing.briefing}"`);
    console.log('Category Counts:', briefing.counts);

    console.log('\n4. Testing DiscoverService.explainInsightDetail...');
    if (insights.length > 0) {
      const insId = insights[0].id;
      const explanation = await DiscoverService.explainInsightDetail(userId, insId);
      console.log('✓ SUCCESS: Gemini detailed sub-explanation generated.');
      console.log(`Explanation:\n"${explanation.explanation}"`);
    }

    console.log('\n5. Testing DiscoverController handlers integration...');
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

    await DiscoverController.getOverview(reqMock, resMock, (err) => {
      console.error('getOverview controller threw error:', err);
      process.exit(1);
    });
    if (jsonSent && jsonSent.success && jsonSent.data.briefing !== undefined) {
      console.log('✓ SUCCESS: DiscoverController.getOverview routed successfully.');
    } else {
      console.error('FAIL: getOverview routing failed!');
      process.exit(1);
    }

    await DiscoverController.getFeed(reqMock, resMock, (err) => {
      console.error('getFeed controller threw error:', err);
      process.exit(1);
    });
    if (jsonSent && jsonSent.success && Array.isArray(jsonSent.data)) {
      console.log('✓ SUCCESS: DiscoverController.getFeed routed successfully.');
    } else {
      console.error('FAIL: getFeed routing failed!');
      process.exit(1);
    }

    console.log('\nAll Araiven Discover Engine tests completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Discover Engine test execution failed:', err);
    process.exit(1);
  }
}

runTest();
