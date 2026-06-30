import { DecisionService } from '../decision/decisionService.js';
import { ASSET_METADATA } from '../../config/marketConfig.js';

/**
 * Main entry point for the Opportunity Engine.
 * 
 * Delegates to the central DecisionService to analyze all assets,
 * then ranks them by Opportunity Score.
 * 
 * @param {Array} tickers - Live tickers from MarketDataService
 * @param {Function} getAssetDetails - Async function to fetch OHLCV for a symbol
 * @param {Object} externalSignals - Future signal inputs (Funding Rates, News, etc.)
 * @returns {Promise<Array>} Ranked opportunity results, highest score first
 */
export async function runOpportunityEngine(tickers, getAssetDetails, externalSignals = {}) {
  console.log(`[OpportunityEngine] Starting full analysis for ${tickers.length} assets...`);

  const rawResults = [];

  for (const ticker of tickers) {
    try {
      const details = await getAssetDetails(ticker.symbol);
      const decision = DecisionService.makeDecision(ticker, details, tickers, externalSignals);
      
      // Inject static metadata
      const meta = ASSET_METADATA[ticker.symbol] || { name: ticker.symbol, icon: '₿', opportunityId: ticker.symbol, type: 'momentum' };
      
      rawResults.push({
        ...decision,
        name: meta.name,
        icon: meta.icon,
        opportunityId: meta.opportunityId,
        type: meta.type
      });
    } catch (err) {
      console.error(`[OpportunityEngine] Failed to analyze ${ticker.symbol}:`, err.message);
    }
  }

  // Rank: highest Opportunity Score first
  rawResults.sort((a, b) => b.opportunityScore - a.opportunityScore);

  if (rawResults.length > 0) {
    console.log(`[OpportunityEngine] Analysis complete. Top asset: ${rawResults[0]?.symbol} (Score: ${rawResults[0]?.opportunityScore})`);
  }

  return rawResults;
}
