import { AiServiceInterface } from '../AiServiceInterface.js';

export class MockAIProvider extends AiServiceInterface {
  constructor() {
    super('Araiven (Mock Sandbox)');
  }

  async analyzePortfolio(portfolio, marketData) {
    const balance = portfolio?.current_balance || 124500.00;
    const stance = (portfolio?.risk_stance || 'balanced').toUpperCase();
    const assetsCount = portfolio?.assets?.length || 3;

    return {
      summary: `Your portfolio balance stands at $${balance.toLocaleString()} under the active ${stance} strategy stance. We have analyzed the ${assetsCount} connected asset allocations and validated that your staking yields are compounding correctly in accordance with volatility targets.`,
      healthScore: stance === 'CONSERVATIVE' ? 94 : (stance === 'AGGRESSIVE' ? 78 : 88),
      diversificationAnalysis: `With ${assetsCount} asset holdings, your portfolio displays a healthy allocation spread. Concentration risks are mitigated, though slightly higher weight in stable pools is advised to cushion against short-term delta variance.`,
      recommendations: [
        'Increase stablecoin liquidity staking allocation by 5% to capture current yield spikes.',
        `Review position weight thresholds on BTC and ETH to align with the active ${stance} stance.`
      ]
    };
  }

  async reviewTrade(trade, context) {
    const qty = trade?.quantity || 1.0;
    const symbol = trade?.symbol || 'BTCUSDT';
    const side = (trade?.side || 'buy').toUpperCase();
    const price = trade?.price || 64000.00;
    const totalCost = qty * price;

    const verdict = totalCost > 50000 ? 'warn' : 'approve';
    const reasoning = verdict === 'warn'
      ? `The total order value ($${totalCost.toLocaleString()}) represents a significant allocation block. Araiven advises placing this in split orders to minimize slippage.`
      : `The proposed ${side} order for ${qty} ${symbol} aligns with your current risk profile and falls safely within daily exposure caps.`;

    return {
      verdict,
      reasoning,
      confidence: 91,
      riskLevel: totalCost > 50000 ? 'high' : 'low'
    };
  }

  async summarizeMarket(marketData) {
    const totalAssets = marketData?.length || 5;
    return {
      summary: `Araiven sentiment aggregators indicate strong capital inflows across top layer-1 protocols. Spot indices are consolidating near range support, indicating a low-volatility buildup.`,
      sentiment: 'bullish',
      keyInsights: [
        `Bitcoin volume delta shows accumulation clusters at the $62,000 support band.`,
        `Ethereum gas utility metrics indicate sustained ecosystem interaction, supporting a neutral-to-bullish outlook.`
      ]
    };
  }

  async assessRisk(positions, marketConditions) {
    const posCount = positions?.length || 2;
    return {
      overallRisk: posCount > 4 ? 'moderate' : 'low',
      score: posCount > 4 ? 65 : 35,
      warnings: posCount > 4 ? ['Slight concentration risk in layer-1 assets.'] : [],
      suggestions: ['Maintain current trailing stop-loss buffers on volatile holdings.']
    };
  }

  async chat(userId, message, conversationHistory = []) {
    const responseText = this.generateMockChatReply(message);
    return {
      reply: responseText,
      actionHtml: null
    };
  }

  async streamChat(userId, message, conversationHistory = [], onChunk) {
    const responseText = this.generateMockChatReply(message);
    // Split into words and simulate streaming chunks
    const words = responseText.split(' ');
    for (const word of words) {
      onChunk(word + ' ');
      await new Promise(r => setTimeout(r, 20)); // brief simulation delay
    }
  }

  generateMockChatReply(message) {
    const norm = message.toLowerCase();
    if (norm.includes('yield') || norm.includes('apy') || norm.includes('earn')) {
      return 'Under your active strategy, Araiven is capturing compounding yields of **12.42% APY** across Ethereum liquidity pools and USDC yield spreads. These allocations are monitored 24/7 with automatic drawdown buffers.';
    }
    if (norm.includes('risk') || norm.includes('drawdown') || norm.includes('exposure')) {
      return 'Araiven Risk Manager reports that your portfolio drawdown limit is currently set to a maximum of **5.0%**. No risk limits have been breached today. Overall volatility index is low.';
    }
    if (norm.includes('balance') || norm.includes('portfolio') || norm.includes('holdings')) {
      return 'Your current audited portfolio valuation is **$124,500.00**, split across 60% stablecoins and 40% crypto assets. This maintains perfect alignment with your risk profile.';
    }
    return `Hello! I am Araiven, your AI wealth copilot. I am actively monitoring market orderbooks, sentiment channels, and yield vaults. You asked: "${message}". How can I assist you with your Ravora portfolio today?`;
  }

  async generateRecommendations(userId, portfolio, opportunities) {
    return [
      {
        opportunityId: 'opp-1',
        suggested_allocation_pct: 10.0,
        reasoning: 'High momentum consolidation on BTC layer-1 spot ETFs.'
      }
    ];
  }
}
