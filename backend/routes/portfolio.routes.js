import { Router } from 'express';
import { PortfolioController } from '../controllers/PortfolioController.js';

const router = Router();

router.get('/', PortfolioController.getPortfolio);
router.get('/performance', PortfolioController.getPerformance);
router.get('/allocation', PortfolioController.getAllocation);
router.get('/risk', PortfolioController.getRisk);
router.get('/analytics', PortfolioController.getAnalytics);
router.get('/health', PortfolioController.getHealth);
router.get('/history', PortfolioController.getHistory);
router.get('/transactions', PortfolioController.getTransactions);
router.post('/positions/:symbol/close', PortfolioController.closePosition);
router.post('/assets', PortfolioController.addAsset);

export default router;
