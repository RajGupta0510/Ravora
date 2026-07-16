import { Router } from 'express';
import { NotificationController } from '../controllers/NotificationController.js';

const router = Router();

router.get('/', NotificationController.getAll);
router.get('/unread', NotificationController.getUnread);
router.post('/read', NotificationController.markAllAsRead);
router.put('/:id/read', NotificationController.markAsRead);

export default router;
