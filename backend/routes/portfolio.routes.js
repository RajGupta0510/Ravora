import { Router } from 'express';
import { PortfolioController } from '../controllers/PortfolioController.js';

const router = Router();

router.get('/', PortfolioController.getPortfolio);
router.get('/history', PortfolioController.getHistory);
router.get('/transactions', PortfolioController.getTransactions);
router.post('/positions/:symbol/close', PortfolioController.closePosition);
router.post('/assets', PortfolioController.addAsset);

export default router;
