import { Router } from 'express';
import { PaperTradingController } from '../controllers/PaperTradingController.js';

const router = Router();

router.get('/account', PaperTradingController.getAccount);
router.get('/positions', PaperTradingController.getPositions);
router.get('/history', PaperTradingController.getHistory);
router.post('/positions', PaperTradingController.placeOrder); // legacy endpoint compat
router.post('/positions/:id/close', PaperTradingController.closePosition);
router.post('/positions/close-all', PaperTradingController.closeAll);
router.post('/reset', PaperTradingController.resetAccount);

// New Order & Stats Routes
router.post('/order', PaperTradingController.placeOrder);
router.post('/order/:id/cancel', PaperTradingController.cancelOrder);
router.get('/statistics', PaperTradingController.getStatistics);

export default router;
