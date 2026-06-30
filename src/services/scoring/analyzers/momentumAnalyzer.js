import { BaseAnalyzer } from './baseAnalyzer.js';
import { MomentumEngine } from '../../momentum/momentumEngine.js';

export class MomentumAnalyzer extends BaseAnalyzer {
  constructor() {
    super('Momentum');
  }

  analyze(ticker, assetDetails, allTickers = []) {
    const history = assetDetails.history || [];
    const momentumResult = MomentumEngine.analyzeMomentum(ticker.price, history);

    return {
      rsi: momentumResult.rsi,
      roc14: momentumResult.roc14,
      momentumScore: momentumResult.momentumScore,
      relativeMomentum: momentumResult.momentumScore,
      momentumDirection: momentumResult.momentumDirection,
      reasoning: [momentumResult.explanation],
      // Expose raw metrics for downstream analyzers
      _macd: momentumResult.macd
    };
  }
}
