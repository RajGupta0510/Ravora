/**
 * Ravora Backend V1 — AI Service Interface
 * Abstract contract for all AI providers (Araiven, future LLM backends).
 */

export class AiServiceInterface {
  constructor(name) {
    this.name = name;
  }

  async analyzePortfolio(portfolio, marketData) {
    throw new Error(`${this.name}: analyzePortfolio() not implemented`);
  }

  async reviewTrade(trade, context) {
    throw new Error(`${this.name}: reviewTrade() not implemented`);
  }

  async summarizeMarket(marketData) {
    throw new Error(`${this.name}: summarizeMarket() not implemented`);
  }

  async assessRisk(positions, marketConditions) {
    throw new Error(`${this.name}: assessRisk() not implemented`);
  }

  async chat(userId, message, conversationHistory) {
    throw new Error(`${this.name}: chat() not implemented`);
  }

  async generateRecommendations(userId, portfolio, opportunities) {
    throw new Error(`${this.name}: generateRecommendations() not implemented`);
  }
}
