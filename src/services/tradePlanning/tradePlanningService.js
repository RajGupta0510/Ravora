import { PullbackTradeModel, BreakoutTradeModel, MeanReversionTradeModel } from './tradeModels.js';

class TradePlanningServiceOrchestrator {
  constructor() {
    this.models = {};
    // Register default trade planning models
    this.registerModel(new PullbackTradeModel());
    this.registerModel(new BreakoutTradeModel());
    this.registerModel(new MeanReversionTradeModel());
  }

  /**
   * Registers a new trade planning model.
   * 
   * @param {BaseTradeModel} model - Instance of a class extending BaseTradeModel
   */
  registerModel(model) {
    if (typeof model.generatePlan !== 'function' || !model.name) {
      throw new Error(`Invalid trade model interface for: ${model?.name || 'unknown'}`);
    }
    this.models[model.name] = model;
  }

  /**
   * Generates a structured trade plan based on market conditions.
   * 
   * @param {Object} inputs - Combined outputs from all Araiven engines
   * @returns {Object} Complete trade plan
   */
  generateTradePlan(inputs) {
    const {
      direction = 'WAIT',
      trendDirection = 'Sideways',
      trendStrength = 50,
      momentumScore = 50
    } = inputs;

    // Default safety trade plan if we are in a WAIT/HOLD state
    if (direction === 'WAIT' || direction === 'HOLD') {
      return {
        suggestedEntry: 0,
        suggestedStopLoss: 0,
        suggestedTakeProfit: 0,
        suggestedTakeProfit1: 0,
        suggestedTakeProfit2: 0,
        suggestedTakeProfit3: 0,
        riskRewardRatio: 'N/A',
        expectedDuration: 'N/A',
        tradeQuality: 'Avoid',
        probability: 0,
        strategyUsed: 'None'
      };
    }

    // Select the optimal trade planning strategy based on market regime
    let selectedModelName = 'Pullback';

    if (trendDirection === 'Sideways' || trendStrength < 35) {
      selectedModelName = 'MeanReversion';
    } else if (trendStrength > 65 && momentumScore > 65) {
      selectedModelName = 'Breakout';
    }

    const model = this.models[selectedModelName] || this.models['Pullback'];
    const plan = model.generatePlan(inputs);

    return {
      ...plan,
      strategyUsed: model.name
    };
  }
}

export const TradePlanningService = new TradePlanningServiceOrchestrator();
export { TradePlanningServiceOrchestrator };
