import { AiService } from '../services/AiService.js';
import { AgentOrchestrator } from '../services/AgentOrchestrator.js';
import { ApiError } from '../../utils/ApiError.js';

export const AiController = {
  /**
   * Main Ask Araiven endpoint with SSE streaming support.
   */
  async ask(req, res, next) {
    try {
      const userId = req.user.id;
      const { message, conversationId, stream = false } = req.body;

      if (!message) {
        throw ApiError.badRequest('message content is required');
      }

      if (stream === true || req.headers.accept === 'text/event-stream') {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        let accumulatedReply = '';
        
        try {
          const { ConversationMemory } = await import('../memory/ConversationMemory.js');
          const conv = await ConversationMemory.getOrCreateConversation(userId, conversationId);
          
          res.write(`data: ${JSON.stringify({ conversationId: conv.id })}\n\n`);

          const onChunk = (chunk) => {
            accumulatedReply += chunk;
            res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
          };

          const result = await AgentOrchestrator.orchestrate(userId, message, conv.id, {
            stream: true,
            onChunk
          });

          await ConversationMemory.saveCopilotMessage(userId, conv.id, accumulatedReply, result.stats);

          res.write('data: [DONE]\n\n');
          return res.end();
        } catch (streamErr) {
          res.write(`data: ${JSON.stringify({ error: streamErr.message })}\n\n`);
          return res.end();
        }
      } else {
        const data = await AgentOrchestrator.orchestrate(userId, message, conversationId, { stream: false });
        return res.json({
          success: true,
          data
        });
      }
    } catch (err) {
      next(err);
    }
  },

  /**
   * chat endpoint (alias for ask)
   */
  async chat(req, res, next) {
    return AiController.ask(req, res, next);
  },

  /**
   * agent endpoint returning the execution path, intents, tools called, and response
   */
  async agent(req, res, next) {
    try {
      const userId = req.user.id;
      const { message, conversationId } = req.body;

      if (!message) {
        throw ApiError.badRequest('message content is required');
      }

      const data = await AgentOrchestrator.orchestrate(userId, message, conversationId, { stream: false });
      return res.json({
        success: true,
        data
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * analyze endpoint for asset/market queries
   */
  async analyze(req, res, next) {
    try {
      const userId = req.user.id;
      const symbol = req.query.symbol || req.body.symbol;
      const message = req.body.message || (symbol ? `Perform technical and indicator analysis for ${symbol}` : 'Perform general market analysis');

      const data = await AgentOrchestrator.orchestrate(userId, message, req.body.conversationId, { stream: false });
      return res.json({
        success: true,
        data
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * review endpoint for portfolio, risk or trade
   */
  async review(req, res, next) {
    try {
      const userId = req.user.id;
      const { type, tradeParams, conversationId } = req.body;

      let promptText = '';
      if (type === 'portfolio') {
        promptText = 'Review my active portfolio, sector allocations, and asset weights.';
      } else if (type === 'risk') {
        promptText = 'Calculate risk vectors, HHI index, and identify leverage exposure.';
      } else if (type === 'trade') {
        if (!tradeParams || !tradeParams.symbol || !tradeParams.quantity) {
          throw ApiError.badRequest('tradeParams (symbol, quantity) are required for trade reviews');
        }
        promptText = `Perform a pre-trade safety review for executing: ${tradeParams.action || 'BUY'} ${tradeParams.quantity} of ${tradeParams.symbol}`;
      } else {
        promptText = 'Perform a complete review of my portfolio, risk factors, and trade settings.';
      }

      const data = await AgentOrchestrator.orchestrate(userId, promptText, conversationId, { stream: false });
      return res.json({
        success: true,
        data
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * tools endpoint listing available backend tools metadata
   */
  async tools(req, res, next) {
    try {
      const toolList = [
        { name: 'MarketDataService', description: 'Real-time cryptocurrency prices, details, and technical indicators (SMA, EMA, RSI).' },
        { name: 'PortfolioService', description: 'Calculates active portfolio valuations, equity, cash balance, and asset allocations.' },
        { name: 'ExchangeSyncService', description: 'Retrieves connection statuses for linked exchange APIs.' },
        { name: 'TradeExecutionService', description: 'Retrieves order execution history logs.' },
        { name: 'PaperTradingService', description: 'Retrieves active virtual/paper positions, balance, and mock trade history.' },
        { name: 'RiskEngine', description: 'Calculates volatility risks, portfolio concentration (HHI), and drawdown caps.' },
        { name: 'NewsService', description: 'Retrieves news sentiment indicators and headlines.' },
        { name: 'WatchlistService', description: 'Retrieves watchlist asset tokens.' },
        { name: 'NotificationService', description: 'Retrieves active unread system notifications and alerts.' }
      ];
      return res.json({
        success: true,
        data: toolList
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * history endpoint listing user's past conversation threads
   */
  async history(req, res, next) {
    return AiController.getConversations(req, res, next);
  },

  /**
   * Adaptive route mapping to keep existing frontend wealth copilot chat functional.
   */
  async copilotMessage(req, res, next) {
    try {
      const userId = req.user.id;
      const { message, conversationId } = req.body;

      if (!message) {
        throw ApiError.badRequest('Message content is required');
      }

      const data = await AgentOrchestrator.orchestrate(userId, message, conversationId, { stream: false });
      
      const { ConversationMemory } = await import('../memory/ConversationMemory.js');
      const history = await ConversationMemory.getRecentHistory(userId, data.conversationId, 2);
      const lastMsg = history[history.length - 1];

      return res.json({
        reply: data.reply,
        stats: lastMsg?.statsMeta || data.stats || '',
        actions: [],
        conversationId: data.conversationId
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Legacy endpoint: Portfolio allocation review analysis
   */
  async portfolioReview(req, res, next) {
    try {
      const userId = req.user.id;
      const data = await AiService.portfolioReview(userId);
      return res.json({
        success: true,
        data
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Legacy endpoint: Portfolio risk score review
   */
  async riskReview(req, res, next) {
    try {
      const userId = req.user.id;
      const data = await AiService.riskReview(userId);
      return res.json({
        success: true,
        data
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Legacy endpoint: Pre-trade safety reviews
   */
  async tradeReview(req, res, next) {
    try {
      const userId = req.user.id;
      const tradeParams = req.body;
      
      if (!tradeParams || !tradeParams.symbol || !tradeParams.quantity) {
        throw ApiError.badRequest('symbol and quantity are required for trade reviews');
      }

      const data = await AiService.tradeReview(userId, tradeParams);
      return res.json({
        success: true,
        data
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Legacy endpoint: Macro market briefing summary
   */
  async marketSummary(req, res, next) {
    try {
      const userId = req.user.id;
      const data = await AiService.marketSummary(userId);
      return res.json({
        success: true,
        data
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Legacy endpoint: Opportunity analysis matching scanner
   */
  async opportunityAnalysis(req, res, next) {
    try {
      const userId = req.user.id;
      const data = await AiService.opportunityAnalysis(userId);
      return res.json({
        success: true,
        data
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Legacy endpoint: Performs technical analysis and indicator breakdown for a single asset.
   */
  async analyzeAsset(req, res, next) {
    try {
      const userId = req.user.id;
      const symbol = req.query.symbol || req.body.symbol;

      if (!symbol) {
        throw ApiError.badRequest('symbol parameter is required');
      }

      const data = await AiService.analyzeAsset(userId, symbol);
      return res.json({
        success: true,
        data
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Legacy endpoint: Watchlist sentiment and potential targets review
   */
  async watchlistReview(req, res, next) {
    try {
      const userId = req.user.id;
      const data = await AiService.watchlistReview(userId);
      return res.json({
        success: true,
        data
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Lists all past conversation threads for the user
   */
  async getConversations(req, res, next) {
    try {
      const userId = req.user.id;
      const { AIConversationsRepository } = await import('../../repositories/AIConversationsRepository.js');
      const list = await new AIConversationsRepository().findByUserId(userId);
      return res.json({
        success: true,
        data: list || []
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Retrieves messages of a specific thread
   */
  async getConversationDetails(req, res, next) {
    try {
      const { id } = req.params;
      const { AIConversationsRepository } = await import('../../repositories/AIConversationsRepository.js');
      const conv = await new AIConversationsRepository().findById(id);

      if (!conv || conv.user_id !== req.user.id) {
        throw ApiError.notFound('Conversation not found');
      }

      return res.json({
        success: true,
        data: conv
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Deletes a conversation thread
   */
  async deleteConversation(req, res, next) {
    try {
      const { id } = req.params;
      const { AIConversationsRepository } = await import('../../repositories/AIConversationsRepository.js');
      const repo = new AIConversationsRepository();
      const conv = await repo.findById(id);

      if (!conv || conv.user_id !== req.user.id) {
        throw ApiError.notFound('Conversation not found');
      }

      await repo.hardDelete(id);
      return res.json({
        success: true,
        message: 'Conversation deleted successfully'
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Renames a conversation thread
   */
  async renameConversation(req, res, next) {
    try {
      const { id } = req.params;
      const { title } = req.body;
      const { AIConversationsRepository } = await import('../../repositories/AIConversationsRepository.js');
      const repo = new AIConversationsRepository();
      const conv = await repo.findById(id);

      if (!conv || conv.user_id !== req.user.id) {
        throw ApiError.notFound('Conversation not found');
      }

      await repo.update(id, { title, updated_at: new Date().toISOString() });
      return res.json({
        success: true,
        message: 'Conversation renamed successfully'
      });
    } catch (err) {
      next(err);
    }
  }
};

