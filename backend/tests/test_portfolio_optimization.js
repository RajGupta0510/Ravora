import '../config/environment.js';
import { initializeDatabase } from '../config/database.js';
import { PortfolioOptimizationService } from '../services/PortfolioOptimizationService.js';
import { PortfolioController } from '../controllers/PortfolioController.js';

async function runTest() {
  try {
    console.log('Initializing database connection...');
    initializeDatabase();

    const userId = '9a7b7e28-2c26-4d04-8b43-9828236746ef'; // raj.gupta@example.com from seed data

    console.log('\n1. Testing PortfolioOptimizationService.evaluateHealthBreakdown...');
    const health = await PortfolioOptimizationService.evaluateHealthBreakdown(userId);
    console.log('✓ SUCCESS: Portfolio Health score compiled.');
    console.log(`Overall Health Score: ${health.score}/100`);
    console.log('Metrics Breakdown:', health.metrics);
    console.log(`AI Explanation: "${health.explanation}"`);

    if (health.score < 0 || health.score > 100) {
      console.error(`FAIL: Health score ${health.score} out of bounds!`);
      process.exit(1);
    }

    console.log('\n2. Testing PortfolioOptimizationService.getRecommendations...');
    const recommendations = await PortfolioOptimizationService.getRecommendations(userId);
    console.log('✓ SUCCESS: Recommendations compiled.');
    console.log(`Summary: "${recommendations.summary}"`);
    console.log('Action Actions list:', recommendations.actions);

    console.log('\n3. Testing PortfolioOptimizationService.simulateScenarios...');
    const scenarios = await PortfolioOptimizationService.simulateScenarios(userId);
    console.log('✓ SUCCESS: Scenarios compiled.');
    scenarios.forEach(sc => {
      console.log(`Scenario: ${sc.name} (${sc.description}) -> Simulated Value: $${sc.simulatedPortfolioValue.toLocaleString()} (${sc.percentageChange}%)`);
    });

    console.log('\n4. Testing PortfolioOptimizationService.calculateRebalancing...');
    const rebalancing = await PortfolioOptimizationService.calculateRebalancing(userId);
    console.log('✓ SUCCESS: Rebalancing splits compiled.');
    console.log('Stance compatibility mode:', rebalancing.stance);
    console.log('Target splits:', rebalancing.targetSplits);
    console.log('Trades required to align targets:', rebalancing.tradesRequired);

    console.log('\n5. Testing PortfolioController handlers integration...');
    const reqMock = {
      user: { id: userId, email: 'raj.gupta@example.com' }
    };
    let jsonSent = null;
    const resMock = {
      json: (data) => {
        jsonSent = data;
      }
    };

    await PortfolioController.getHealth(reqMock, resMock, (err) => {
      console.error('getHealth controller threw next error:', err);
      process.exit(1);
    });
    if (jsonSent && jsonSent.score !== undefined) {
      console.log('✓ SUCCESS: PortfolioController.getHealth routed successfully.');
    } else {
      console.error('FAIL: getHealth routing failed!');
      process.exit(1);
    }

    await PortfolioController.getRecommendations(reqMock, resMock, (err) => {
      console.error('getRecommendations controller threw next error:', err);
      process.exit(1);
    });
    if (jsonSent && jsonSent.actions !== undefined) {
      console.log('✓ SUCCESS: PortfolioController.getRecommendations routed successfully.');
    } else {
      console.error('FAIL: getRecommendations routing failed!');
      process.exit(1);
    }

    await PortfolioController.getScenarios(reqMock, resMock, (err) => {
      console.error('getScenarios controller threw next error:', err);
      process.exit(1);
    });
    if (jsonSent && Array.isArray(jsonSent)) {
      console.log('✓ SUCCESS: PortfolioController.getScenarios routed successfully.');
    } else {
      console.error('FAIL: getScenarios routing failed!');
      process.exit(1);
    }

    await PortfolioController.rebalance(reqMock, resMock, (err) => {
      console.error('rebalance controller threw next error:', err);
      process.exit(1);
    });
    if (jsonSent && jsonSent.tradesRequired !== undefined) {
      console.log('✓ SUCCESS: PortfolioController.rebalance routed successfully.');
    } else {
      console.error('FAIL: rebalance routing failed!');
      process.exit(1);
    }

    console.log('\nAll Portfolio Optimization tests completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Portfolio Optimization test execution failed:', err);
    process.exit(1);
  }
}

runTest();
