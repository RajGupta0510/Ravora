import { Router } from 'express';
import { DiscoverController } from '../controllers/DiscoverController.js';

const router = Router();

router.get('/', DiscoverController.getOverview);
router.get('/feed', DiscoverController.getFeed);
router.get('/briefing', DiscoverController.getBriefing);
router.get('/alerts', DiscoverController.getAlerts);
router.get('/history', DiscoverController.getHistory);
router.post('/save', DiscoverController.saveInsight);
router.post('/dismiss', DiscoverController.dismissInsight);
router.post('/explain', DiscoverController.explainInsight);

export default router;
