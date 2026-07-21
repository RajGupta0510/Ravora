import { Router } from 'express';
import { ExchangeController } from '../controllers/ExchangeController.js';

const router = Router();

router.post('/', ExchangeController.connectExchange);
router.get('/', ExchangeController.listExchanges);
router.get('/logs', ExchangeController.getSyncLogs);
router.get('/:id/status', ExchangeController.getSyncStatus);
router.post('/:id/sync', ExchangeController.startManualSync);
router.delete('/:id', ExchangeController.disconnectExchange);

export default router;
