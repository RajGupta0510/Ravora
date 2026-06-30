import { BaseAnalyzer } from './baseAnalyzer.js';
import { SupportResistanceService } from '../../supportResistance/supportResistanceService.js';

export class SupportResistanceAnalyzer extends BaseAnalyzer {
  constructor() {
    super('SupportResistance');
  }

  /**
   * Analyzes support and resistance levels for an asset.
   * 
   * @param {Object} ticker - Standardized ticker { symbol, price }
   * @param {Object} assetDetails - { history }
   * @param {Array} allTickers
   * @returns {Object} Support & Resistance metrics
   */
  analyze(ticker, assetDetails, allTickers = []) {
    const history = assetDetails.history || [];
    const currentPrice = ticker.price;

    const levelsResult = SupportResistanceService.analyzeLevels(currentPrice, history);

    return {
      supportLevels: levelsResult.supportLevels,
      resistanceLevels: levelsResult.resistanceLevels,
      nearestSupport: levelsResult.nearestSupport,
      nearestResistance: levelsResult.nearestResistance,
      distanceToSupport: levelsResult.distanceToSupport,
      distanceToResistance: levelsResult.distanceToResistance,
      supportStrength: levelsResult.supportStrength,
      resistanceStrength: levelsResult.resistanceStrength,
      reasoning: [levelsResult.explanation]
    };
  }
}
