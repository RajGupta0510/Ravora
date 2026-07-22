import { AiServiceFactory } from '../AiServiceFactory.js';
import { ToolRegistry } from '../tools/ToolRegistry.js';
import { ConversationMemory } from '../memory/ConversationMemory.js';
import { AraivenPrompts } from '../prompts/AraivenPrompts.js';
import { logger } from '../../utils/logger.js';
import { AuditLogRepository } from '../../repositories/AuditLogRepository.js';

const auditRepo = new AuditLogRepository();

export const AiService = {
  /**
   * Helper to instantiate the active configured provider
   */
  getProvider() {
    return AiServiceFactory.create();
  },

  /**
   * Orchestrates conversational copilot chat with streaming support.
   */
  async askAraiven(userId, message, conversationId = null, options = {}) {
    const startTime = Date.now();
    const provider = this.getProvider();
    
    // 1. Gather all live data context to prevent hallucinations
    const portfolioCtx = await ToolRegistry.getPortfolioContext(userId);
    const riskCtx = await ToolRegistry.getRiskContext(userId);
    const marketCtx = await ToolRegistry.getMarketContext();
    const watchlistCtx = await ToolRegistry.getWatchlistContext(userId);

    const userStance = await ConversationMemory.getUserStanceContext(userId);

    // 2. Fetch recent conversation memory
    const conversation = await ConversationMemory.getOrCreateConversation(userId, conversationId);
    const history = await ConversationMemory.getRecentHistory(userId, conversation.id, 8);

    // 3. Save User message to Database immediately
    const savedConvId = await ConversationMemory.saveUserMessage(userId, conversation.id, message);

    // 4. Build system prompt enclosing live context parameters
    const liveContextBlock = `
LIVE PORTFOLIO CONTEXT:
- Audited Valuation: $${(portfolioCtx.valuation?.currentValue || 0).toLocaleString()} ${portfolioCtx.preferredCurrency || 'USD'}
- Realized/Unrealized PNL: $${portfolioCtx.valuation?.unrealizedPnL || 0} (${portfolioCtx.valuation?.pnlPercentage || 0}%)
- Safety Index Score: ${portfolioCtx.valuation?.safetyScore || 100}/100
- Active Risk Stance: ${userStance.riskStance.toUpperCase()} (Max Drawdown Limit: ${userStance.maxDrawdown}%)
- Asset holdings: ${JSON.stringify(portfolioCtx.assets)}
- Risk Metrics: ${JSON.stringify(riskCtx)}
- Watchlist symbols: ${JSON.stringify(watchlistCtx)}
- Top market prices: ${JSON.stringify(marketCtx.overview?.slice(0, 5))}
`;

    const systemPrompt = `${AraivenPrompts.SYSTEM_INSTRUCTIONS}\n\n${liveContextBlock}`;

    let reply = '';
    const { stream = false, onChunk = null } = options;

    try {
      // 5. Send request to LLM
      if (stream && onChunk) {
        // Check if provider supports native streaming (Mock provider has a streamChat wrapper)
        if (provider.streamChat) {
          await provider.streamChat(userId, message, history, onChunk);
        } else if (provider.sendRequest) {
          const messages = [
            ...history.map(m => ({
              role: m.sender === 'user' ? 'user' : 'assistant',
              content: m.text
            })),
            { role: 'user', content: message }
          ];
          await provider.sendRequest(messages, {
            stream: true,
            systemPrompt,
            onChunk
          });
        } else {
          // Fallback if provider does not support stream
          const chatRes = await provider.chat(userId, message, history);
          reply = chatRes.reply;
          onChunk(reply);
        }
      } else {
        // Non-streaming normal REST path
        if (provider.sendRequest) {
          const messages = [
            ...history.map(m => ({
              role: m.sender === 'user' ? 'user' : 'assistant',
              content: m.text
            })),
            { role: 'user', content: message }
          ];
          reply = await provider.sendRequest(messages, { systemPrompt });
        } else {
          const chatRes = await provider.chat(userId, message, history);
          reply = chatRes.reply;
        }
      }

      const latencyMs = Date.now() - startTime;
      
      // Save Araiven message to DB (excluding stream chunks as they've already run)
      if (reply) {
        await ConversationMemory.saveCopilotMessage(userId, savedConvId, reply, `Strategy: ${userStance.riskStance}`);
      }

      // 6. Observability and audit logging
      logger.info('AiService', `AskAraiven query processed successfully`, {
        userId,
        provider: provider.name,
        latencyMs,
        stream
      });

      await auditRepo.log(userId, 'ask_araiven', 'ai_conversations', savedConvId, { latencyMs });

      return {
        conversationId: savedConvId,
        reply: reply || '[Streamed Response]',
        actionHtml: null
      };

    } catch (err) {
      const latencyMs = Date.now() - startTime;
      logger.error('AiService', 'AskAraiven query execution failed', { error: err.message, latencyMs });
      throw err;
    }
  },

  /**
   * Runs a complete portfolio balance and weight review.
   */
  async portfolioReview(userId) {
    const startTime = Date.now();
    const provider = this.getProvider();

    const portfolioCtx = await ToolRegistry.getPortfolioContext(userId);
    const marketCtx = await ToolRegistry.getMarketContext();
    const riskCtx = await ToolRegistry.getRiskContext(userId);

    try {
      const review = await provider.analyzePortfolio(portfolioCtx, marketCtx.overview);
      
      const latencyMs = Date.now() - startTime;
      logger.info('AiService', 'Portfolio review generated', { userId, latencyMs });
      await auditRepo.log(userId, 'portfolio_review', 'portfolios', null, { latencyMs });

      return review;
    } catch (err) {
      logger.error('AiService', 'Portfolio review failed', { error: err.message });
      throw err;
    }
  },

  /**
   * Reviews user risk indices, HHI, and drawdowns.
   */
  async riskReview(userId) {
    const startTime = Date.now();
    const provider = this.getProvider();

    const portfolioCtx = await ToolRegistry.getPortfolioContext(userId);
    const marketCtx = await ToolRegistry.getMarketContext();
    const riskCtx = await ToolRegistry.getRiskContext(userId);

    try {
      const review = await provider.assessRisk(portfolioCtx.assets, marketCtx.overview);
      
      const latencyMs = Date.now() - startTime;
      logger.info('AiService', 'Risk review generated', { userId, latencyMs });
      await auditRepo.log(userId, 'risk_review', 'portfolios', null, { latencyMs });

      return review;
    } catch (err) {
      logger.error('AiService', 'Risk review failed', { error: err.message });
      throw err;
    }
  },

  /**
   * Reviews proposed trade before execution.
   */
  async tradeReview(userId, tradeParams) {
    const startTime = Date.now();
    const provider = this.getProvider();

    const portfolioCtx = await ToolRegistry.getPortfolioContext(userId);
    const riskCtx = await ToolRegistry.getRiskContext(userId);

    const context = {
      portfolioValuation: portfolioCtx.valuation,
      riskStance: portfolioCtx.riskStance,
      maxDrawdownCap: portfolioCtx.maxDrawdownCap,
      riskMetrics: riskCtx,
      activeHoldings: portfolioCtx.assets
    };

    try {
      const review = await provider.reviewTrade(tradeParams, context);
      
      const latencyMs = Date.now() - startTime;
      logger.info('AiService', 'Trade review completed', { userId, latencyMs });
      await auditRepo.log(userId, 'trade_review', 'orders', null, { latencyMs });

      return review;
    } catch (err) {
      logger.error('AiService', 'Trade review failed', { error: err.message });
      throw err;
    }
  },

  /**
   * Returns a daily summary report of the market.
   */
  async marketSummary(userId) {
    const startTime = Date.now();
    const provider = this.getProvider();

    const marketCtx = await ToolRegistry.getMarketContext();

    try {
      const summary = await provider.summarizeMarket(marketCtx.overview);
      
      const latencyMs = Date.now() - startTime;
      logger.info('AiService', 'Market summary generated', { userId, latencyMs });
      await auditRepo.log(userId, 'market_summary', 'market', null, { latencyMs });

      return summary;
    } catch (err) {
      logger.error('AiService', 'Market summary failed', { error: err.message });
      throw err;
    }
  },

  /**
   * Analyzes opportunities matching user allocations.
   */
  async opportunityAnalysis(userId) {
    const startTime = Date.now();
    const provider = this.getProvider();

    const portfolioCtx = await ToolRegistry.getPortfolioContext(userId);
    const marketCtx = await ToolRegistry.getMarketContext();

    try {
      // Scans opportunities inside database
      const db = getSupabaseAdmin();
      const { data: opportunities } = await db
        .from('opportunities')
        .select('*')
        .eq('is_active', true)
        .limit(10);

      const review = await provider.generateRecommendations(userId, portfolioCtx, opportunities || []);
      
      const latencyMs = Date.now() - startTime;
      logger.info('AiService', 'Opportunity analysis generated', { userId, latencyMs });
      await auditRepo.log(userId, 'opportunity_analysis', 'opportunities', null, { latencyMs });

      return review;
    } catch (err) {
      logger.error('AiService', 'Opportunity analysis failed', { error: err.message });
      throw err;
    }
  },

  /**
   * Performs technical analysis and indicator breakdown for a single asset.
   */
  async analyzeAsset(userId, symbol) {
    const startTime = Date.now();
    const provider = this.getProvider();

    // 1. Fetch asset indicators & pattern context
    const assetCtx = await ToolRegistry.getAssetContext(symbol);

    try {
      // 2. Query LLM provider
      const review = await provider.analyzeAsset(symbol.toUpperCase(), assetCtx);
      
      const latencyMs = Date.now() - startTime;
      logger.info('AiService', `Asset analysis completed for ${symbol}`, { userId, latencyMs });
      await auditRepo.log(userId, 'analyze_asset', 'market', null, { latencyMs, symbol });

      return review;
    } catch (err) {
      logger.error('AiService', `Asset analysis failed for ${symbol}`, { error: err.message });
      throw err;
    }
  },

  /**
   * Reviews user watchlists and provides target tokens suggestions.
   */
  async watchlistReview(userId) {
    const startTime = Date.now();
    const provider = this.getProvider();

    const watchlistCtx = await ToolRegistry.getWatchlistContext(userId);
    const marketCtx = await ToolRegistry.getMarketContext();

    try {
      const prompt = `Review the active user watchlist items:
Watchlist: ${JSON.stringify(watchlistCtx)}
Market Data: ${JSON.stringify(marketCtx.overview)}
Provide response in strict JSON format:
{
  "summary": "Detailed narrative watchlist review explaining trends and opportunities.",
  "riskRating": "low" | "moderate" | "high",
  "actionableTokens": ["BTC"],
  "insights": ["insight1"]
}`;

      const systemInstruction = 'You are Araiven, Ravora\'s institutional AI investment analyst. Output only valid JSON.';
      const contents = [{ role: 'user', parts: [{ text: prompt }] }];
      const reviewText = await provider.sendRequest(contents, { systemInstruction, jsonMode: true });
      const review = JSON.parse(reviewText);

      const latencyMs = Date.now() - startTime;
      logger.info('AiService', 'Watchlist review completed', { userId, latencyMs });
      await auditRepo.log(userId, 'watchlist_review', 'watchlists', null, { latencyMs });

      return review;
    } catch (err) {
      logger.error('AiService', 'Watchlist review failed', { error: err.message });
      throw err;
    }
  }
};
