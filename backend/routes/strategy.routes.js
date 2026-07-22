import { Router } from 'express';
import { StrategyController } from '../controllers/StrategyController.js';

const router = Router();

router.post('/backtest/run', StrategyController.runBacktest);
router.post('/', StrategyController.saveStrategy);
router.get('/', StrategyController.listStrategies);
router.get('/backtests', StrategyController.listBacktests);
router.get('/backtests/compare', StrategyController.compareBacktests);
router.get('/patterns/lookup', StrategyController.patternLookup);

export default router;
