import '../config/environment.js';
import { initializeDatabase } from '../config/database.js';
import { OpportunityDiscoveryService } from '../services/OpportunityDiscoveryService.js';
import { OpportunityController } from '../controllers/OpportunityController.js';

async function runTest() {
  try {
    console.log('Initializing database connection...');
    initializeDatabase();

    const userId = '9a7b7e28-2c26-4d04-8b43-9828236746ef'; // raj.gupta@example.com from seed data

    console.log('\n1. Testing OpportunityDiscoveryService.getPersonalizedOpportunities...');
    const opps = await OpportunityDiscoveryService.getPersonalizedOpportunities(userId);
    console.log('✓ SUCCESS: Personalized opportunities list compiled.');
    console.log('Total active opportunities found:', opps.length);
    if (opps.length > 0) {
      console.log('Top ranked opportunity:', opps[0].name, 'Score:', opps[0].personalizedScore);
    }

    console.log('\n2. Testing OpportunityDiscoveryService.saveOpportunity...');
    if (opps.length > 0) {
      const oppId = opps[0].id;
      const result = await OpportunityDiscoveryService.saveOpportunity(userId, oppId);
      console.log('✓ SUCCESS: Saved opportunity interaction logged:', result.status);
    }

    console.log('\n3. Testing OpportunityDiscoveryService.getOpportunityDetails (AI strengths/risks)...');
    if (opps.length > 0) {
      const oppId = opps[0].id;
      const details = await OpportunityDiscoveryService.getOpportunityDetails(userId, oppId);
      console.log('✓ SUCCESS: Surfaced opportunity details with Gemini AI analysis.');
      console.log('AI Strengths:', details.aiAnalysis.strengths);
      console.log('AI Risks:', details.aiAnalysis.risks);
      console.log('AI Indicators to monitor:', details.aiAnalysis.whatToMonitor);
    }

    console.log('\n4. Testing OpportunityDiscoveryService.getInteractionHistory...');
    const history = await OpportunityDiscoveryService.getInteractionHistory(userId);
    console.log('✓ SUCCESS: User interaction history timeline compiled.');
    console.log('History entries count:', history.length);

    console.log('\n5. Testing OpportunityController handlers integration...');
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

    await OpportunityController.getOpportunities(reqMock, resMock, (err) => {
      console.error('getOpportunities controller threw error:', err);
      process.exit(1);
    });
    if (jsonSent && Array.isArray(jsonSent)) {
      console.log('✓ SUCCESS: OpportunityController.getOpportunities routed successfully.');
    } else {
      console.error('FAIL: getOpportunities routing failed!');
      process.exit(1);
    }

    if (opps.length > 0) {
      reqMock.params.id = opps[0].id;
      await OpportunityController.getOpportunityById(reqMock, resMock, (err) => {
        console.error('getOpportunityById controller threw error:', err);
        process.exit(1);
      });
      if (jsonSent && jsonSent.aiAnalysis !== undefined) {
        console.log('✓ SUCCESS: OpportunityController.getOpportunityById routed successfully.');
      } else {
        console.error('FAIL: getOpportunityById routing failed!');
        process.exit(1);
      }
    }

    console.log('\nAll Opportunity Discovery Engine tests completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Opportunity Discovery Engine test failed:', err);
    process.exit(1);
  }
}

runTest();
