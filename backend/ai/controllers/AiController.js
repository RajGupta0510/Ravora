import { AiService } from '../services/AiService.js';
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
        // Configure Server-Sent Events (SSE) headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders(); // Establish connection immediately

        let accumulatedReply = '';
        
        try {
          // Pre-resolve conversation ID and send to client
          const { ConversationMemory } = await import('../memory/ConversationMemory.js');
          const conv = await ConversationMemory.getOrCreateConversation(userId, conversationId);
          
          res.write(`data: ${JSON.stringify({ conversationId: conv.id })}\n\n`);

          const onChunk = (chunk) => {
            accumulatedReply += chunk;
            res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
          };

          const result = await AiService.askAraiven(userId, message, conv.id, {
            stream: true,
            onChunk
          });

          // Save final message record in database since streaming loop bypassed it
          await ConversationMemory.saveCopilotMessage(userId, conv.id, accumulatedReply);

          res.write('data: [DONE]\n\n');
          return res.end();
        } catch (streamErr) {
          res.write(`data: ${JSON.stringify({ error: streamErr.message })}\n\n`);
          return res.end();
        }
      } else {
        // Standard JSON HTTP response
        const data = await AiService.askAraiven(userId, message, conversationId, { stream: false });
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
   * Adaptive route mapping to keep existing frontendwealth copilot chat functional.
   */
  async copilotMessage(req, res, next) {
    try {
      const userId = req.user.id;
      const { message, conversationId } = req.body;

      if (!message) {
        throw ApiError.badRequest('Message content is required');
      }

      const data = await AiService.askAraiven(userId, message, conversationId, { stream: false });
      
      // Get conversation messages to extract stats metadata if needed
      const { ConversationMemory } = await import('../memory/ConversationMemory.js');
      const history = await ConversationMemory.getRecentHistory(userId, data.conversationId, 2);
      const lastMsg = history[history.length - 1];

      return res.json({
        reply: data.reply,
        stats: lastMsg?.statsMeta || '',
        actions: [],
        conversationId: data.conversationId
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Portfolio allocation review analysis
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
   * Portfolio risk score review
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
   * Pre-trade safety reviews
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
   * Macro market briefing summary
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
   * Opportunity analysis matching scanner
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
   * Performs technical analysis and indicator breakdown for a single asset.
   */
  async analyzeAsset(req, res, next) {
    try {
      const userId = req.user.id;
      // Support both GET query symbol and POST body symbol
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
   * Watchlist sentiment and potential targets review
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
  }
};
