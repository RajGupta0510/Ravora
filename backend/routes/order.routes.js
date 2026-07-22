import { Router } from 'express';
import { OrderController } from '../execution/controllers/OrderController.js';

const router = Router();

router.post('/', OrderController.placeOrder);
router.post('/halt', OrderController.toggleEmergencyHalt);
router.get('/open', OrderController.getOpenOrders);
router.get('/history', OrderController.getOrderHistory);
router.get('/executions', OrderController.getExecutions);
router.get('/:id', OrderController.getOrder);
router.post('/:id/cancel', OrderController.cancelOrder);

export default router;
