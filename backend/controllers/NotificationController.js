/**
 * Ravora Backend V1 — Notification Controller
 */

import { NotificationService } from '../services/NotificationService.js';

export const NotificationController = {
  async getAll(req, res, next) {
    try {
      const items = await NotificationService.getNotifications(req.user.id, { limit: 100 });
      const formatted = items.data.map(n => ({
        notificationId: n.id,
        channel: n.channel,
        priority: n.priority,
        title: n.title,
        body: n.body,
        isRead: !!n.is_read
      }));
      return res.json(formatted);
    } catch (err) { next(err); }
  },

  async getUnread(req, res, next) {
    try {
      const items = await NotificationService.getUnread(req.user.id);
      const formatted = items.map(n => ({
        notificationId: n.id,
        channel: n.channel,
        priority: n.priority,
        title: n.title,
        body: n.body,
        isRead: false
      }));
      return res.json(formatted);
    } catch (err) { next(err); }
  },

  async markAsRead(req, res, next) {
    try {
      await NotificationService.markAsRead(req.user.id, req.params.id);
      return res.json({ status: 'success' });
    } catch (err) { next(err); }
  },

  async markAllAsRead(req, res, next) {
    try {
      const count = await NotificationService.getUnreadCount(req.user.id);
      await NotificationService.markAllAsRead(req.user.id);
      return res.json({
        status: 'success',
        markedReadCount: count
      });
    } catch (err) { next(err); }
  },
};
