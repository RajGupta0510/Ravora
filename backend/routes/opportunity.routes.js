import { Router } from 'express';
import { OpportunityController } from '../controllers/OpportunityController.js';
import { PaperTradingController } from '../controllers/PaperTradingController.js';

const router = Router();

router.get('/', OpportunityController.getOpportunities);
router.get('/recommendations', OpportunityController.getRecommendations);
router.post('/recommendations/:id/execute', OpportunityController.executeRecommendation);
router.post('/deploy', PaperTradingController.openPosition); // Deploying an opportunity opens a paper position

export default router;
