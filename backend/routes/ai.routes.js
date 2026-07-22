import { Router } from 'express';
import { AiController } from '../ai/controllers/AiController.js';

const router = Router();

// Legacy & UI Compatibility Route Definitions
router.post('/ask', AiController.ask);
router.get('/portfolio-review', AiController.portfolioReview);
router.get('/risk-review', AiController.riskReview);
router.post('/trade-review', AiController.tradeReview);
router.get('/market-summary', AiController.marketSummary);
router.get('/opportunity-analysis', AiController.opportunityAnalysis);
router.get('/analyze-asset', AiController.analyzeAsset);

// Spec v1 Endpoint Standardizations (POST/GET mounts)
router.post('/chat', AiController.ask);
router.post('/analyze-asset', AiController.analyzeAsset);
router.post('/analyze-portfolio', AiController.portfolioReview);
router.post('/analyze-trade', AiController.tradeReview);
router.post('/market-summary', AiController.marketSummary);
router.post('/risk-review', AiController.riskReview);
router.post('/watchlist-review', AiController.watchlistReview);

router.get('/conversations', AiController.getConversations);
router.get('/conversations/:id', AiController.getConversationDetails);

export default router;
