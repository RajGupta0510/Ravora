import { Router } from 'express';
import { WorkspaceController } from '../controllers/WorkspaceController.js';

const router = Router();

router.get('/assets', WorkspaceController.getAssets);
router.get('/opportunities', WorkspaceController.getOpportunities);
router.get('/analysis/:symbol', WorkspaceController.getAnalysis);
router.get('/timeframes/:symbol', WorkspaceController.getTimeframes);
router.get('/opportunities/:id', WorkspaceController.getOpportunityById);
router.get('/watchlist', WorkspaceController.getWatchlist);
router.post('/watchlist', WorkspaceController.toggleWatchlist);
router.post('/alerts', WorkspaceController.createAlert);

export default router;
