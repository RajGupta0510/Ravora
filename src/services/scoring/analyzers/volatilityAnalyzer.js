import { BaseAnalyzer } from './baseAnalyzer.js';
import { calculateAnnualizedVolatility } from '../../../utils/mathUtils.js';

export class VolatilityAnalyzer extends BaseAnalyzer {
  constructor() {
    super('Volatility');
  }

  analyze(ticker, assetDetails, allTickers = []) {
    const history = assetDetails.history || [];
    const closePrices = history.map(h => h.close);

    const annVol = calculateAnnualizedVolatility(closePrices);
    let volatilityScore = Math.round(annVol * 100 * 0.65); // Scale annualized volatility
    volatilityScore = Math.max(15, Math.min(90, volatilityScore));

    const reasoning = [];
    if (annVol > 0.8) {
      reasoning.push(`Annualized volatility is high at ${(annVol * 100).toFixed(1)}%, signaling higher drawdown variance risk.`);
    } else if (annVol > 0.4) {
      reasoning.push(`Annualized volatility is moderate at ${(annVol * 100).toFixed(1)}%, maintaining stable risk-adjusted and exposure parameters.`);
    } else {
      reasoning.push(`Annualized volatility is low at ${(annVol * 100).toFixed(1)}%, providing a highly secure capital drawdown buffer.`);
    }

    return {
      annualizedVolatility: annVol,
      volatilityScore,
      reasoning
    };
  }
}
