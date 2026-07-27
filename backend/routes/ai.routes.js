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
router.post('/chat', AiController.chat);
router.post('/agent', AiController.agent);
router.post('/analyze', AiController.analyze);
router.post('/review', AiController.review);
router.post('/tools', AiController.tools);
router.get('/history', AiController.history);

// Real-Time Streaming Endpoints
router.post('/chat/stream', AiController.chatStream);
router.post('/analyze/stream', AiController.analyzeStream);
router.post('/review/stream', AiController.reviewStream);

// Memory & Personalization API
router.get('/memory', AiController.getMemory);
router.post('/memory', AiController.createMemory);
router.delete('/memory', AiController.deleteMemory);
router.get('/preferences', AiController.getPreferences);
router.put('/preferences', AiController.updatePreferences);

router.post('/analyze-asset', AiController.analyzeAsset);
router.post('/analyze-portfolio', AiController.portfolioReview);
router.post('/analyze-trade', AiController.tradeReview);
router.post('/market-summary', AiController.marketSummary);
router.post('/risk-review', AiController.riskReview);
router.post('/watchlist-review', AiController.watchlistReview);

router.get('/conversations', AiController.getConversations);
router.get('/conversations/:id', AiController.getConversationDetails);
router.delete('/conversations/:id', AiController.deleteConversation);
router.patch('/conversations/:id', AiController.renameConversation);

export default router;
