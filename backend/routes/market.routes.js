import { Router } from 'express';
import { MarketController } from '../controllers/MarketController.js';
import { OpportunityController } from '../controllers/OpportunityController.js';
import { optionalAuth, authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/prices', optionalAuth, MarketController.getPrices);
router.get('/overview', optionalAuth, MarketController.getOverview);
router.get('/summary', optionalAuth, MarketController.getSummary);
router.get('/assets/:symbol', optionalAuth, MarketController.getAssetDetails);

// Authenticated market scanner trigger
router.post('/scan', authenticate, OpportunityController.scanMarkets);

export default router;
