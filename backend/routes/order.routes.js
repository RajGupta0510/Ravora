import { Router } from 'express';
import { authorizeAdmin } from '../middleware/authorize.js';
import { OrderController } from '../execution/controllers/OrderController.js';

const router = Router();

router.post('/', OrderController.placeOrder);
// Global trading halt affects every user: admin only.
router.post('/halt', authorizeAdmin, OrderController.toggleEmergencyHalt);
router.get('/open', OrderController.getOpenOrders);
router.get('/history', OrderController.getOrderHistory);
router.get('/executions', OrderController.getExecutions);
router.get('/:id', OrderController.getOrder);
router.post('/:id/cancel', OrderController.cancelOrder);

export default router;
