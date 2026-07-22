import { Router } from 'express';
import { AiController } from '../ai/controllers/AiController.js';

const router = Router();

router.post('/ask', AiController.ask);
router.get('/portfolio-review', AiController.portfolioReview);
router.get('/risk-review', AiController.riskReview);
router.post('/trade-review', AiController.tradeReview);
router.get('/market-summary', AiController.marketSummary);
router.get('/opportunity-analysis', AiController.opportunityAnalysis);

export default router;
