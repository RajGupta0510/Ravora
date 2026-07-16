import { Router } from 'express';
import { PaperTradingController } from '../controllers/PaperTradingController.js';

const router = Router();

router.get('/account', PaperTradingController.getAccount);
router.get('/positions', PaperTradingController.getPositions);
router.get('/history', PaperTradingController.getHistory);
router.post('/positions', PaperTradingController.openPosition);
router.post('/positions/:id/close', PaperTradingController.closePosition);
router.post('/positions/close-all', PaperTradingController.closeAll);
router.post('/reset', PaperTradingController.resetAccount);

export default router;
