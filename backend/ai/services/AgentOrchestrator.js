import { AiServiceFactory } from '../AiServiceFactory.js';
import { ToolRegistry } from '../tools/ToolRegistry.js';
import { ConversationMemory } from '../memory/ConversationMemory.js';
import { logger } from '../../utils/logger.js';
import { AuditLogRepository } from '../../repositories/AuditLogRepository.js';
import crypto from 'crypto';

const auditRepo = new AuditLogRepository();

class SimpleCache {
  constructor() {
    this.store = new Map();
  }
  set(key, val, ttlMs) {
    this.store.set(key, { val, expiry: Date.now() + ttlMs });
  }
  get(key) {
    const item = this.store.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      this.store.delete(key);
      return null;
    }
    return item.val;
  }
}

const cache = new SimpleCache();

export const AgentOrchestrator = {
  /**
   * Main orchestrator entry point
   */
  async orchestrate(userId, message, conversationId = null, options = {}) {
    const startTime = Date.now();
    const provider = AiServiceFactory.create();
    const { stream = false, onChunk = null } = options;

    // 1. Fetch recent conversation memory and user stance
    const conversation = await ConversationMemory.getOrCreateConversation(userId, conversationId);
    const history = await ConversationMemory.getRecentHistory(userId, conversation.id, 8);
    const userStance = await ConversationMemory.getUserStanceContext(userId);

    // Save user message to database
    const savedConvId = await ConversationMemory.saveUserMessage(userId, conversation.id, message);

    // 2. Intent Detection via Gemini
    let intents = ['Conversation'];
    let tools = [];
    let symbols = [];
    let latencyIntentMs = 0;

    try {
      const intentStartTime = Date.now();
      const intentPrompt = `You are Araiven's Intent Engine. Classify the user's message to determine required tools and mentioned asset symbols.
User Message: "${message}"

You MUST output a valid JSON object matching this schema exactly:
{
  "intents": ["Intent1", "Intent2"],
  "tools": ["Tool1", "Tool2"],
  "symbols": ["SYMBOL1"]
}

Allowed Intents:
- Market Analysis
- Portfolio Review
- Trade Review
- News Summary
- Risk Analysis
- Paper Trading Review
- Strategy Question
- General Education
- Comparison
- Portfolio Optimization
- Conversation

Allowed Tools:
- MarketDataService (for general market conditions, or technical indicator reviews of mentioned symbols)
- PortfolioService (for active assets, balances, preferred currency, allocations)
- ExchangeSyncService (for linked exchange api details or connection status)
- TradeExecutionService (for user's transaction/order history log)
- PaperTradingService (for virtual portfolio, active paper trades, paper history)
- RiskEngine (for concentration index, drawdowns, leverage warnings)
- NewsService (for headline and sentiment context)
- WatchlistService (for watchlist symbol lists)
- NotificationService (for user's unread notifications/alerts log)

Only select tools that are directly relevant to answer the request. Extract asset symbols (like BTC, ETH, SOL) in uppercase. If no symbol is mentioned, return an empty array for symbols.`;

      const classificationResponse = await provider.sendRequest(
        [{ role: 'user', content: intentPrompt }],
        {
          jsonMode: true,
          systemInstruction: "You are Araiven's Intent Engine. Output only valid JSON matching the schema."
        }
      );

      latencyIntentMs = Date.now() - intentStartTime;

      try {
        const parsed = JSON.parse(classificationResponse);
        if (parsed.intents && Array.isArray(parsed.intents)) intents = parsed.intents;
        if (parsed.tools && Array.isArray(parsed.tools)) tools = parsed.tools;
        if (parsed.symbols && Array.isArray(parsed.symbols)) symbols = parsed.symbols.map(s => s.toUpperCase());
      } catch (err) {
        logger.warn('AgentOrchestrator', 'Failed to parse intent engine response JSON', { response: classificationResponse });
        // Fallback rule-based matching if JSON fails
        const msgLower = message.toLowerCase();
        if (msgLower.includes('portfolio') || msgLower.includes('balance') || msgLower.includes('holding')) {
          intents.push('Portfolio Review');
          tools.push('PortfolioService');
        }
        if (msgLower.includes('risk') || msgLower.includes('leverage')) {
          intents.push('Risk Analysis');
          tools.push('RiskEngine');
        }
        if (msgLower.includes('btc') || msgLower.includes('bitcoin') || msgLower.includes('eth') || msgLower.includes('ethereum')) {
          intents.push('Market Analysis');
          tools.push('MarketDataService');
          if (msgLower.includes('btc') || msgLower.includes('bitcoin')) symbols.push('BTC');
          if (msgLower.includes('eth') || msgLower.includes('ethereum')) symbols.push('ETH');
        }
      }
    } catch (err) {
      logger.error('AgentOrchestrator', 'Intent detection failed', err);
    }

    // 3. Tool Routing & Context Assembly
    const toolsData = {};
    const toolPromises = [];
    const executionLogs = [];

    tools.forEach(tool => {
      const toolStartTime = Date.now();
      if (tool === 'MarketDataService') {
        toolPromises.push((async () => {
          try {
            if (symbols.length > 0) {
              const assets = [];
              for (const sym of symbols) {
                const cacheKey = `asset:${sym}`;
                let assetCtx = cache.get(cacheKey);
                if (!assetCtx) {
                  assetCtx = await ToolRegistry.getAssetContext(sym);
                  cache.set(cacheKey, assetCtx, 60 * 1000); // 1m TTL
                }
                assets.push(assetCtx);
              }
              toolsData.MarketDataService = { assets };
            } else {
              const cacheKey = 'market:overview';
              let marketCtx = cache.get(cacheKey);
              if (!marketCtx) {
                marketCtx = await ToolRegistry.getMarketContext();
                cache.set(cacheKey, marketCtx, 60 * 1000);
              }
              toolsData.MarketDataService = marketCtx;
            }
            executionLogs.push({ tool, success: true, latencyMs: Date.now() - toolStartTime });
          } catch (err) {
            logger.error('AgentOrchestrator', 'MarketDataService tool call failed', err);
            toolsData.MarketDataService = { error: 'Market data is currently unavailable.' };
            executionLogs.push({ tool, success: false, error: err.message, latencyMs: Date.now() - toolStartTime });
          }
        })());
      }

      if (tool === 'PortfolioService') {
        toolPromises.push((async () => {
          try {
            toolsData.PortfolioService = await ToolRegistry.getPortfolioContext(userId);
            executionLogs.push({ tool, success: true, latencyMs: Date.now() - toolStartTime });
          } catch (err) {
            logger.error('AgentOrchestrator', 'PortfolioService tool call failed', err);
            toolsData.PortfolioService = { error: 'Portfolio metrics are unavailable.' };
            executionLogs.push({ tool, success: false, error: err.message, latencyMs: Date.now() - toolStartTime });
          }
        })());
      }

      if (tool === 'ExchangeSyncService') {
        toolPromises.push((async () => {
          try {
            toolsData.ExchangeSyncService = await ToolRegistry.getExchangeContext(userId);
            executionLogs.push({ tool, success: true, latencyMs: Date.now() - toolStartTime });
          } catch (err) {
            logger.error('AgentOrchestrator', 'ExchangeSyncService tool call failed', err);
            toolsData.ExchangeSyncService = [];
            executionLogs.push({ tool, success: false, error: err.message, latencyMs: Date.now() - toolStartTime });
          }
        })());
      }

      if (tool === 'TradeExecutionService') {
        toolPromises.push((async () => {
          try {
            const hist = await ToolRegistry.getTradeHistoryContext(userId);
            // Cap history elements to optimize token usage
            toolsData.TradeExecutionService = {
              recentOrders: hist.recentOrders?.slice(0, 5) || [],
              recentExecutions: hist.recentExecutions?.slice(0, 5) || []
            };
            executionLogs.push({ tool, success: true, latencyMs: Date.now() - toolStartTime });
          } catch (err) {
            logger.error('AgentOrchestrator', 'TradeExecutionService tool call failed', err);
            toolsData.TradeExecutionService = { error: 'Trade records are unavailable.' };
            executionLogs.push({ tool, success: false, error: err.message, latencyMs: Date.now() - toolStartTime });
          }
        })());
      }

      if (tool === 'PaperTradingService') {
        toolPromises.push((async () => {
          try {
            const { PaperTradingService } = await import('../../services/PaperTradingService.js');
            const account = await PaperTradingService.getAccount(userId);
            const positions = await PaperTradingService.getOpenPositions(userId);
            const tradeHist = await PaperTradingService.getTradeHistory(userId, 5);
            toolsData.PaperTradingService = { account, positions, history: tradeHist };
            executionLogs.push({ tool, success: true, latencyMs: Date.now() - toolStartTime });
          } catch (err) {
            logger.error('AgentOrchestrator', 'PaperTradingService tool call failed', err);
            toolsData.PaperTradingService = { error: 'Paper trading account information is unavailable.' };
            executionLogs.push({ tool, success: false, error: err.message, latencyMs: Date.now() - toolStartTime });
          }
        })());
      }

      if (tool === 'RiskEngine') {
        toolPromises.push((async () => {
          try {
            toolsData.RiskEngine = await ToolRegistry.getRiskContext(userId);
            executionLogs.push({ tool, success: true, latencyMs: Date.now() - toolStartTime });
          } catch (err) {
            logger.error('AgentOrchestrator', 'RiskEngine tool call failed', err);
            toolsData.RiskEngine = { error: 'Risk profile metrics calculations are unavailable.' };
            executionLogs.push({ tool, success: false, error: err.message, latencyMs: Date.now() - toolStartTime });
          }
        })());
      }

      if (tool === 'NewsService') {
        toolPromises.push((async () => {
          try {
            if (symbols.length > 0) {
              const news = [];
              for (const sym of symbols) {
                const cacheKey = `news:${sym}`;
                let newsCtx = cache.get(cacheKey);
                if (!newsCtx) {
                  newsCtx = await ToolRegistry.getNewsSentimentContext(sym);
                  cache.set(cacheKey, newsCtx, 5 * 60 * 1000); // 5m TTL
                }
                news.push(newsCtx);
              }
              toolsData.NewsService = { news };
            } else {
              const cacheKey = 'news:BTC';
              let newsCtx = cache.get(cacheKey);
              if (!newsCtx) {
                newsCtx = await ToolRegistry.getNewsSentimentContext('BTC');
                cache.set(cacheKey, newsCtx, 5 * 60 * 1000);
              }
              toolsData.NewsService = { news: [newsCtx] };
            }
            executionLogs.push({ tool, success: true, latencyMs: Date.now() - toolStartTime });
          } catch (err) {
            logger.error('AgentOrchestrator', 'NewsService tool call failed', err);
            toolsData.NewsService = { error: 'Market news updates are unavailable.' };
            executionLogs.push({ tool, success: false, error: err.message, latencyMs: Date.now() - toolStartTime });
          }
        })());
      }

      if (tool === 'WatchlistService') {
        toolPromises.push((async () => {
          try {
            toolsData.WatchlistService = await ToolRegistry.getWatchlistContext(userId);
            executionLogs.push({ tool, success: true, latencyMs: Date.now() - toolStartTime });
          } catch (err) {
            logger.error('AgentOrchestrator', 'WatchlistService tool call failed', err);
            toolsData.WatchlistService = [];
            executionLogs.push({ tool, success: false, error: err.message, latencyMs: Date.now() - toolStartTime });
          }
        })());
      }

      if (tool === 'NotificationService') {
        toolPromises.push((async () => {
          try {
            const { NotificationService } = await import('../../services/NotificationService.js');
            const unread = await NotificationService.getUnread(userId);
            toolsData.NotificationService = { unread: unread?.slice(0, 5) || [] };
            executionLogs.push({ tool, success: true, latencyMs: Date.now() - toolStartTime });
          } catch (err) {
            logger.error('AgentOrchestrator', 'NotificationService tool call failed', err);
            toolsData.NotificationService = { error: 'Notification system is unavailable.' };
            executionLogs.push({ tool, success: false, error: err.message, latencyMs: Date.now() - toolStartTime });
          }
        })());
      }
    });

    await Promise.allSettled(toolPromises);

    // 4. Prompt Engine Assembly
    const liveContextBlock = `
LIVE PORTFOLIO CONTEXT:
- Audited Valuation: $${(toolsData.PortfolioService?.valuation?.currentValue || 0).toLocaleString()}
- Risk Stance: ${userStance.riskStance.toUpperCase()} (Drawdown Limit: ${userStance.maxDrawdown}%)
- Favorite Symbols: ${JSON.stringify(toolsData.WatchlistService || [])}

REAL-TIME backend structured information from tool calls:
${JSON.stringify(toolsData, null, 2)}
`;

    const systemPrompt = `You are Araiven, Ravora's flagship intelligent AI agent investment copilot. 

Boundaries & Constraints:
1. ADVISORY ONLY: You are an analyst, NOT an execution module. You cannot execute trades or edit database files. Under no circumstances should you purchase, sell, or modify positions.
2. DO NOT HALLUCINATE OR INVENT: Never invent account balances, trades, simulated positions, orders, or live prices. If data is missing or connection fails, state that clearly instead of guessing.
3. OBJECTIVE TONE: Speak in a professional, quantitative, financial analyst tone. Avoid hype or emoji-heavy speech. Explain WHY you reach every conclusion.

Educational Explanations Rule:
Do not simply list indicator values. You must explain *what* they mean educationally to help the user learn (e.g. "RSI at 28 is inside the oversold zone, which mathematically indicates selling volume has exhausted and a short-term trend reversal is probable.").

Decision Explanations Rule:
For every recommendation or asset shift, you MUST provide:
- Reasoning (detailed why)
- Supporting market data (prices, volumes, indicators)
- Confidence score (0-100)
- Risk level (low, medium, high)
- Key assumptions (market trends, macro status)
- Potential downside
- Potential upside
- Suggested actions

Output formatting:
- Use markdown tables or lists rather than long paragraphs.
- Keep token usage optimal.

${liveContextBlock}`;

    // Assemble messages array
    const messages = [
      ...history.map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      })),
      { role: 'user', parts: [{ text: message }] }
    ];

    let reply = '';
    const tokenEstimatePrompt = JSON.stringify(messages).length / 4; // Simple chars/4 estimation

    // 5. Reasoning loop via Gemini Provider
    try {
      if (stream && onChunk) {
        if (provider.streamChat) {
          await provider.streamChat(userId, message, history, onChunk);
        } else {
          await provider.sendRequest(messages, {
            stream: true,
            systemInstruction: systemPrompt,
            onChunk
          });
        }
      } else {
        reply = await provider.sendRequest(messages, {
          systemInstruction: systemPrompt
        });
      }
    } catch (err) {
      logger.error('AgentOrchestrator', 'Gemini reasoning failed', err);
      reply = `I encountered an issue processing your request through the Gemini AI core: ${err.message}. Ravora's backend data remains available.`;
      if (stream && onChunk) {
        onChunk(reply);
      }
    }

    const latencyMs = Date.now() - startTime;
    const tokenEstimateCompletion = reply ? reply.length / 4 : 100;
    const estimatedCost = ((tokenEstimatePrompt * 0.00015) + (tokenEstimateCompletion * 0.0006)) / 1000; // Mock estimation

    const statsMeta = `Latency: ${latencyMs}ms | Cost: $${estimatedCost.toFixed(5)} | Tools: ${tools.join(', ') || 'None'}`;

    // 6. Save reply to Memory (if not already handled in streaming loop)
    if (!stream) {
      await ConversationMemory.saveCopilotMessage(userId, savedConvId, reply, statsMeta);
    }

    // 7. Observability Logging
    logger.info('AgentOrchestrator', 'Orchestration step processed successfully', {
      userId,
      intents,
      toolsCalled: tools,
      latencyMs,
      estimatedCost,
      statsMeta
    });

    await auditRepo.log(userId, 'agent_orchestrate', 'ai_conversations', savedConvId, {
      intents,
      tools,
      latencyMs,
      estimatedCost,
      executionLogs
    });

    return {
      conversationId: savedConvId,
      reply: reply || '[Streamed Response]',
      actionHtml: null,
      intents,
      tools,
      symbols,
      stats: statsMeta,
      metrics: {
        latencyMs,
        latencyIntentMs,
        tokenEstimatePrompt,
        tokenEstimateCompletion,
        estimatedCost,
        executionLogs
      }
    };
  }
};
