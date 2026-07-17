import { Router } from 'express';
import { ExchangeController } from '../controllers/ExchangeController.js';

const router = Router();

router.post('/', ExchangeController.connectExchange);
router.get('/', ExchangeController.listExchanges);
router.delete('/:id', ExchangeController.disconnectExchange);
router.post('/:id/sync', ExchangeController.startManualSync);
router.get('/logs', ExchangeController.getSyncLogs);

export default router;
