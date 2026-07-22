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
          const onChunk = (chunk) => {
            accumulatedReply += chunk;
            res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
          };

          const result = await AiService.askAraiven(userId, message, conversationId, {
            stream: true,
            onChunk
          });

          // Save final message record in database since streaming loop bypassed it
          const { ConversationMemory } = await import('../memory/ConversationMemory.js');
          await ConversationMemory.saveCopilotMessage(userId, result.conversationId, accumulatedReply);

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
        actions: []
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
      const { symbol } = req.query;

      if (!symbol) {
        throw ApiError.badRequest('symbol query parameter is required');
      }

      const data = await AiService.analyzeAsset(userId, symbol);
      return res.json({
        success: true,
        data
      });
    } catch (err) {
      next(err);
    }
  }
};
