import { Router } from 'express';
import { OpportunityController } from '../controllers/OpportunityController.js';
import { PaperTradingController } from '../controllers/PaperTradingController.js';

const router = Router();

router.get('/', OpportunityController.getOpportunities);
router.get('/trending', OpportunityController.getTrending);
router.get('/history', OpportunityController.getHistory);
router.get('/recommendations', OpportunityController.getRecommendations);
router.post('/recommendations/:id/execute', OpportunityController.executeRecommendation);
router.post('/deploy', PaperTradingController.placeOrder);
router.get('/:id', OpportunityController.getOpportunityById);
router.post('/save', OpportunityController.saveOpportunity);
router.post('/dismiss', OpportunityController.dismissOpportunity); // Deploying an opportunity opens a paper position

export default router;
