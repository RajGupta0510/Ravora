import { decideFinalRecommendation } from './decisionRules.js';

/**
 * Abstract Base Class for all pluggable Decision Models.
 */
export class BaseDecisionModel {
  constructor(name) {
    if (this.constructor === BaseDecisionModel) {
      throw new Error("BaseDecisionModel is abstract and cannot be instantiated directly.");
    }
    this.name = name;
  }

  /**
   * Applies the model's decision logic on the combined engine inputs.
   * 
   * @param {Object} inputs - Consolidated parameters from all engines
   * @returns {string} 'LONG' | 'SHORT' | 'WAIT' | 'HOLD'
   */
  makeDecision(inputs) {
    throw new Error("Method 'makeDecision(inputs)' must be implemented by subclass.");
  }
}

/**
 * Pluggable Model: Standard Decision Model
 * Uses the default Ravora decision rules.
 */
export class StandardDecisionModel extends BaseDecisionModel {
  constructor() {
    super('Standard');
  }

  makeDecision(inputs) {
    return decideFinalRecommendation(inputs);
  }
}

/**
 * Pluggable Model: Conservative Decision Model
 * Requires higher confluence and lower risk scores to issue a recommendation.
 */
export class ConservativeDecisionModel extends BaseDecisionModel {
  constructor() {
    super('Conservative');
  }

  makeDecision(inputs) {
    // Override risk threshold to be more conservative
    if (inputs.riskScore >= 55) {
      return 'WAIT';
    }
    // Requires higher opportunity score
    if (inputs.opportunityScore < 65 && inputs.opportunityScore > 35) {
      return 'HOLD';
    }
    return decideFinalRecommendation(inputs);
  }
}

/**
 * Pluggable Model: Aggressive Decision Model
 * Lower thresholds for trend and volume confirmation.
 */
export class AggressiveDecisionModel extends BaseDecisionModel {
  constructor() {
    super('Aggressive');
  }

  makeDecision(inputs) {
    // Allows trading up to 75 risk score
    if (inputs.isVetoed && inputs.riskScore < 75) {
      inputs.isVetoed = false; // Bypass veto for aggressive trading
    }
    return decideFinalRecommendation(inputs);
  }
}
