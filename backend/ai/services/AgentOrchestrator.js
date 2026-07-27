import { AiServiceFactory } from '../AiServiceFactory.js';
import { ToolRegistry } from '../tools/ToolRegistry.js';
import { ConversationMemory } from '../memory/ConversationMemory.js';
import { logger } from '../../utils/logger.js';
import { AuditLogRepository } from '../../repositories/AuditLogRepository.js';

// Import personalization repositories
import { UserPreferencesRepository } from '../../repositories/UserPreferencesRepository.js';
import { LearningProgressRepository } from '../../repositories/LearningProgressRepository.js';
import { PortfolioSnapshotRepository } from '../../repositories/PortfolioSnapshotRepository.js';
import { RecommendationHistoryRepository } from '../../repositories/RecommendationHistoryRepository.js';
import { ContextSummaryRepository } from '../../repositories/ContextSummaryRepository.js';

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
   * Main orchestrator entry point with streaming and multi-stage status progress
   */
  async orchestrate(userId, message, conversationId = null, options = {}) {
    const startTime = Date.now();
    const provider = AiServiceFactory.create();
    const { stream = false, onChunk = null, onProgress = null, signal = null } = options;

    // Stage 1: Thinking
    if (onProgress) {
      onProgress({ type: 'status', status: 'thinking', message: 'Thinking...' });
    }

    // 1. Fetch recent conversation memory and user stance
    const conversation = await ConversationMemory.getOrCreateConversation(userId, conversationId);
    const history = await ConversationMemory.getRecentHistory(userId, conversation.id, 8);
    const userStance = await ConversationMemory.getUserStanceContext(userId);

    // Save user message to database
    const savedConvId = await ConversationMemory.saveUserMessage(userId, conversation.id, message);

    // Stage 2: Analyzing intent
    if (onProgress) {
      onProgress({ type: 'status', status: 'analyzing', message: 'Analyzing request...' });
    }

    // 2. Fetch User Personalization Profiles
    const userPrefRepo = new UserPreferencesRepository();
    let preferences = await userPrefRepo.findByUserId(userId);
    if (!preferences) {
      preferences = await userPrefRepo.upsertPreferences(userId, {
        risk_tolerance: userStance.riskStance || 'balanced',
        investment_goals: ['growth'],
        preferred_markets: userStance.preferredMarkets || ['BTCUSDT', 'ETHUSDT'],
        preferred_assets: (userStance.preferredMarkets || []).map(m => m.replace('USDT', '')),
        investment_horizon: 'long-term',
        trading_experience: 'intermediate',
        preferred_strategy: 'DCA',
        preferred_language: 'English',
        notification_preferences: { email: true, push: true }
      });
    }

    const learnRepo = new LearningProgressRepository();
    let learningProgress = await learnRepo.findByUserId(userId);
    if (!learningProgress) {
      learningProgress = await learnRepo.upsertLearningProgress(userId, {
        concepts_explained: [],
        indicators_learned: [],
        trading_mistakes: [],
        repeated_questions: {},
        knowledge_level: preferences.trading_experience || 'intermediate'
      });
    }

    const summaryRepo = new ContextSummaryRepository();
    const allSummaries = await summaryRepo.findByUserId(userId, 50);
    const msgWords = message.toLowerCase().match(/\b[a-z]{3,15}\b/g) || [];
    const relevantMemories = allSummaries.filter(sum => {
      const keywords = sum.keywords || [];
      return keywords.some(kw => msgWords.includes(kw.toLowerCase()));
    }).slice(0, 3);

    // 3. Intent Detection via Gemini
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
          systemInstruction: "You are Araiven's Intent Engine. Output only valid JSON matching the schema.",
          signal
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

    // Stage 3: Retrieving Data
    if (onProgress) {
      onProgress({ type: 'status', status: 'retrieving', message: 'Retrieving data...' });
    }

    // 4. Tool Routing & Context Assembly
    const toolsData = {};
    const toolPromises = [];
    const executionLogs = [];

    tools.forEach(tool => {
      const toolStartTime = Date.now();
      
      // Notify tool start
      if (onProgress) {
        onProgress({ type: 'tool_start', tool, message: `Checking ${tool.replace('Service', '').replace('Engine', '')} data...` });
      }

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
            if (onProgress) onProgress({ type: 'tool_end', tool, status: 'success' });
          } catch (err) {
            logger.error('AgentOrchestrator', 'MarketDataService tool call failed', err);
            toolsData.MarketDataService = { error: 'Market data is currently unavailable.' };
            executionLogs.push({ tool, success: false, error: err.message, latencyMs: Date.now() - toolStartTime });
            if (onProgress) onProgress({ type: 'tool_end', tool, status: 'failed', error: err.message });
          }
        })());
      }

      if (tool === 'PortfolioService') {
        toolPromises.push((async () => {
          try {
            toolsData.PortfolioService = await ToolRegistry.getPortfolioContext(userId);
            executionLogs.push({ tool, success: true, latencyMs: Date.now() - toolStartTime });
            if (onProgress) onProgress({ type: 'tool_end', tool, status: 'success' });
          } catch (err) {
            logger.error('AgentOrchestrator', 'PortfolioService tool call failed', err);
            toolsData.PortfolioService = { error: 'Portfolio metrics are unavailable.' };
            executionLogs.push({ tool, success: false, error: err.message, latencyMs: Date.now() - toolStartTime });
            if (onProgress) onProgress({ type: 'tool_end', tool, status: 'failed', error: err.message });
          }
        })());
      }

      if (tool === 'ExchangeSyncService') {
        toolPromises.push((async () => {
          try {
            toolsData.ExchangeSyncService = await ToolRegistry.getExchangeContext(userId);
            executionLogs.push({ tool, success: true, latencyMs: Date.now() - toolStartTime });
            if (onProgress) onProgress({ type: 'tool_end', tool, status: 'success' });
          } catch (err) {
            logger.error('AgentOrchestrator', 'ExchangeSyncService tool call failed', err);
            toolsData.ExchangeSyncService = [];
            executionLogs.push({ tool, success: false, error: err.message, latencyMs: Date.now() - toolStartTime });
            if (onProgress) onProgress({ type: 'tool_end', tool, status: 'failed', error: err.message });
          }
        })());
      }

      if (tool === 'TradeExecutionService') {
        toolPromises.push((async () => {
          try {
            const hist = await ToolRegistry.getTradeHistoryContext(userId);
            toolsData.TradeExecutionService = {
              recentOrders: hist.recentOrders?.slice(0, 5) || [],
              recentExecutions: hist.recentExecutions?.slice(0, 5) || []
            };
            executionLogs.push({ tool, success: true, latencyMs: Date.now() - toolStartTime });
            if (onProgress) onProgress({ type: 'tool_end', tool, status: 'success' });
          } catch (err) {
            logger.error('AgentOrchestrator', 'TradeExecutionService tool call failed', err);
            toolsData.TradeExecutionService = { error: 'Trade records are unavailable.' };
            executionLogs.push({ tool, success: false, error: err.message, latencyMs: Date.now() - toolStartTime });
            if (onProgress) onProgress({ type: 'tool_end', tool, status: 'failed', error: err.message });
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
            if (onProgress) onProgress({ type: 'tool_end', tool, status: 'success' });
          } catch (err) {
            logger.error('AgentOrchestrator', 'PaperTradingService tool call failed', err);
            toolsData.PaperTradingService = { error: 'Paper trading account information is unavailable.' };
            executionLogs.push({ tool, success: false, error: err.message, latencyMs: Date.now() - toolStartTime });
            if (onProgress) onProgress({ type: 'tool_end', tool, status: 'failed', error: err.message });
          }
        })());
      }

      if (tool === 'RiskEngine') {
        toolPromises.push((async () => {
          try {
            toolsData.RiskEngine = await ToolRegistry.getRiskContext(userId);
            executionLogs.push({ tool, success: true, latencyMs: Date.now() - toolStartTime });
            if (onProgress) onProgress({ type: 'tool_end', tool, status: 'success' });
          } catch (err) {
            logger.error('AgentOrchestrator', 'RiskEngine tool call failed', err);
            toolsData.RiskEngine = { error: 'Risk profile metrics calculations are unavailable.' };
            executionLogs.push({ tool, success: false, error: err.message, latencyMs: Date.now() - toolStartTime });
            if (onProgress) onProgress({ type: 'tool_end', tool, status: 'failed', error: err.message });
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
            if (onProgress) onProgress({ type: 'tool_end', tool, status: 'success' });
          } catch (err) {
            logger.error('AgentOrchestrator', 'NewsService tool call failed', err);
            toolsData.NewsService = { error: 'Market news updates are unavailable.' };
            executionLogs.push({ tool, success: false, error: err.message, latencyMs: Date.now() - toolStartTime });
            if (onProgress) onProgress({ type: 'tool_end', tool, status: 'failed', error: err.message });
          }
        })());
      }

      if (tool === 'WatchlistService') {
        toolPromises.push((async () => {
          try {
            toolsData.WatchlistService = await ToolRegistry.getWatchlistContext(userId);
            executionLogs.push({ tool, success: true, latencyMs: Date.now() - toolStartTime });
            if (onProgress) onProgress({ type: 'tool_end', tool, status: 'success' });
          } catch (err) {
            logger.error('AgentOrchestrator', 'WatchlistService tool call failed', err);
            toolsData.WatchlistService = [];
            executionLogs.push({ tool, success: false, error: err.message, latencyMs: Date.now() - toolStartTime });
            if (onProgress) onProgress({ type: 'tool_end', tool, status: 'failed', error: err.message });
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
            if (onProgress) onProgress({ type: 'tool_end', tool, status: 'success' });
          } catch (err) {
            logger.error('AgentOrchestrator', 'NotificationService tool call failed', err);
            toolsData.NotificationService = { error: 'Notification system is unavailable.' };
            executionLogs.push({ tool, success: false, error: err.message, latencyMs: Date.now() - toolStartTime });
            if (onProgress) onProgress({ type: 'tool_end', tool, status: 'failed', error: err.message });
          }
        })());
      }
    });

    await Promise.allSettled(toolPromises);

    // Stage 4: Generating Insights
    if (onProgress) {
      onProgress({ type: 'status', status: 'generating', message: 'Generating AI insights...' });
    }

    // 5. Prompt Engine Assembly with Memory & Personalization context
    const liveContextBlock = `
LIVE PORTFOLIO CONTEXT:
- Audited Valuation: $${(toolsData.PortfolioService?.valuation?.currentValue || 0).toLocaleString()}
- Stance: ${userStance.riskStance.toUpperCase()} (Drawdown Limit: ${userStance.maxDrawdown}%)
- Favorite Symbols: ${JSON.stringify(toolsData.WatchlistService || [])}

REAL-TIME backend structured information from tool calls:
${JSON.stringify(toolsData, null, 2)}
`;

    const systemPrompt = `You are Araiven, Ravora's flagship intelligent AI agent investment copilot. 

Boundaries & Constraints:
1. ADVISORY ONLY: You are an analyst, NOT an execution module. You cannot execute trades or edit database files. Under no circumstances should you purchase, sell, or modify positions.
2. DO NOT HALLUCINATE OR INVENT: Never invent account balances, trades, simulated positions, orders, or live prices. If data is missing or connection fails, state that clearly instead of guessing.
3. OBJECTIVE TONE: Speak in a professional, quantitative, financial analyst tone. Avoid hype or emoji-heavy speech. Explain WHY you reach every conclusion.

USER PERSONALIZATION INSIGHTS (Customize details and recommendations to fit this profile):
- Risk Tolerance Stance: ${preferences.risk_tolerance.toUpperCase()}
- Investment Goals: ${preferences.investment_goals.join(', ')}
- Target Horizon: ${preferences.investment_horizon}
- Preferred Assets: ${preferences.preferred_assets.join(', ') || 'None selected'}
- Strategy: ${preferences.preferred_strategy}
- Knowledge & Experience: ${preferences.trading_experience.toUpperCase()}
- Explanation Style: Adapt explanations to a user with ${learningProgress.knowledge_level.toUpperCase()} trading knowledge.
- Concepts/Indicators the user has already learned: ${learningProgress.indicators_learned.join(', ') || 'None yet'}
- Past Relevant Context from Previous Discussions:
${relevantMemories.map(m => `- Summary: ${m.content} (Keywords: ${m.keywords.join(', ')})`).join('\n') || 'None recorded yet.'}

Compliance Directives:
1. When explaining indicator signals, adjust detail. For BEGINNERS, explain basic concepts. For ADVANCED, provide detailed metrics.
2. If you recommend an asset action (buying/holding/selling), you MUST append:
   "Recommendation: ACTION SYMBOL" (e.g. "Recommendation: ACCUMULATE BTC") on a new line so the backend parser can log it.

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
    const tokenEstimatePrompt = JSON.stringify(messages).length / 4;

    // 6. Reasoning loop via Gemini Provider
    try {
      if (stream && onChunk) {
        if (provider.streamChat) {
          await provider.streamChat(userId, message, history, onChunk, { signal });
        } else {
          await provider.sendRequest(messages, {
            stream: true,
            systemInstruction: systemPrompt,
            onChunk,
            signal
          });
        }
      } else {
        reply = await provider.sendRequest(messages, {
          systemInstruction: systemPrompt,
          signal
        });
      }
    } catch (err) {
      // Handle AbortError/Cancellation specifically
      if (err.name === 'AbortError') {
        logger.info('AgentOrchestrator', 'Orchestration streaming request was aborted by client', { userId });
        throw err;
      }
      logger.error('AgentOrchestrator', 'Gemini reasoning failed', err);
      reply = `I encountered an issue processing your request through the Gemini AI core: ${err.message}. Ravora's backend data remains available.`;
      if (stream && onChunk) {
        onChunk(reply);
      }
    }

    const latencyMs = Date.now() - startTime;
    const tokenEstimateCompletion = reply ? reply.length / 4 : 100;
    const estimatedCost = ((tokenEstimatePrompt * 0.00015) + (tokenEstimateCompletion * 0.0006)) / 1000;

    const statsMeta = `Latency: ${latencyMs}ms | Cost: $${estimatedCost.toFixed(5)} | Tools: ${tools.join(', ') || 'None'}`;

    // Stage 5: Completed
    if (onProgress) {
      onProgress({ type: 'status', status: 'completed', message: 'Completed' });
    }

    // 7. Save reply to Memory (if not already handled in streaming loop)
    if (!stream) {
      await ConversationMemory.saveCopilotMessage(userId, savedConvId, reply, statsMeta);
    }

    // 8. Construct Contextual Follow-up Suggestions
    const suggestions = [];
    if (symbols.length > 0) {
      const sym = symbols[0];
      suggestions.push(`Analyze ${sym === 'BTC' ? 'ETH' : 'BTC'} instead`);
      suggestions.push(`Explain EMA and RSI indicators for ${sym}`);
      suggestions.push(`Review risks for ${sym}`);
    } else {
      suggestions.push('Review my portfolio');
      suggestions.push('Explain RSI');
      suggestions.push('Show similar opportunities');
      suggestions.push('Review risks');
    }

    if (onProgress) {
      onProgress({ type: 'suggestions', data: suggestions });
    }

    // 9. Personalization: Post-Response Memory Updates & Background Audits
    try {
      const lowerReply = reply.toLowerCase();
      
      const newlyLearned = [];
      const keywordsToIndicators = {
        'rsi': 'RSI (Relative Strength Index)',
        'sma': 'SMA (Simple Moving Average)',
        'ema': 'EMA (Exponential Moving Average)',
        'macd': 'MACD (Moving Average Convergence Divergence)',
        'bollinger': 'Bollinger Bands',
        'drawdown': 'Drawdown risk control',
        'hhi': 'HHI Concentration Index',
        'leverage': 'Leverage risk exposure'
      };

      for (const [key, name] of Object.entries(keywordsToIndicators)) {
        if (lowerReply.includes(key) && !learningProgress.indicators_learned.includes(name)) {
          newlyLearned.push(name);
        }
      }

      if (newlyLearned.length > 0) {
        learningProgress.indicators_learned = [
          ...learningProgress.indicators_learned,
          ...newlyLearned
        ];
        await learnRepo.upsertLearningProgress(userId, {
          indicators_learned: learningProgress.indicators_learned
        });
      }

      const repeatedQuestions = learningProgress.repeated_questions || {};
      const msgNormalized = message.trim().toLowerCase();
      if (repeatedQuestions[msgNormalized]) {
        repeatedQuestions[msgNormalized] += 1;
      } else {
        repeatedQuestions[msgNormalized] = 1;
      }
      await learnRepo.upsertLearningProgress(userId, {
        repeated_questions: repeatedQuestions
      });

      const recRepo = new RecommendationHistoryRepository();
      const recRegex = /Recommendation:\s*(ACCUMULATE|TRIM|HOLD|BUY|SELL)\s*([A-Z]{3,6})/gi;
      let match;
      while ((match = recRegex.exec(reply)) !== null) {
        const action = match[1].toLowerCase();
        const symbol = match[2].toUpperCase();
        await recRepo.recordRecommendation(userId, {
          conversation_id: savedConvId,
          symbol,
          action,
          reasoning: `Extracted from conversation thread: "${message.substring(0, 100)}..."`,
          confidence_score: 85
        });
      }

      if (tools.includes('PortfolioService') && toolsData.PortfolioService && !toolsData.PortfolioService.error) {
        const portSnapRepo = new PortfolioSnapshotRepository();
        const portVal = toolsData.PortfolioService.valuation;
        await portSnapRepo.recordSnapshot(userId, {
          total_value: portVal?.currentValue || 0,
          cash_balance: portVal?.cashBalance || 0,
          asset_splits: toolsData.PortfolioService.allocations || {},
          risk_score: toolsData.PortfolioService.riskStance === 'aggressive' ? 80 : (toolsData.PortfolioService.riskStance === 'balanced' ? 50 : 20),
          safety_score: portVal?.safetyScore || 100
        });
      }

      if (history.length >= 6 && history.length % 4 === 0) {
        (async () => {
          try {
            const summaryPrompt = `Provide a concise 1-2 sentence summary of the key discussion points and conclusions in this chat history:
${JSON.stringify(history.slice(-6))}

Output format: JSON with "summary" and "keywords" (array of lowercase words).`;
            const summaryRes = await provider.sendRequest(
              [{ role: 'user', content: summaryPrompt }],
              { jsonMode: true, systemInstruction: "Provide summary of chat history in JSON.", signal }
            );
            const parsedSum = JSON.parse(summaryRes);
            await summaryRepo.recordSummary(userId, {
              conversation_id: savedConvId,
              summary_type: 'general',
              content: parsedSum.summary,
              keywords: parsedSum.keywords || []
            });
          } catch (sumErr) {
            logger.error('AgentOrchestrator', 'Failed to generate background context summary', sumErr);
          }
        })();
      }

    } catch (postErr) {
      logger.error('AgentOrchestrator', 'Error in post-response memory processing', postErr);
    }

    logger.info('AgentOrchestrator', 'Orchestration step processed successfully with streaming', {
      userId,
      intents,
      toolsCalled: tools,
      latencyMs,
      estimatedCost
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
      suggestions,
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
