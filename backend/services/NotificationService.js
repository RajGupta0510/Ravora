/**
 * Ravora Backend V1 — Notification Service
 */

import { NotificationRepository } from '../repositories/NotificationRepository.js';

const notifRepo = new NotificationRepository();

export const NotificationService = {
  async getNotifications(userId, options = {}) {
    return notifRepo.findByUserId(userId, options);
  },

  async getUnread(userId) {
    return notifRepo.findUnreadByUserId(userId);
  },

  async getUnreadCount(userId) {
    return notifRepo.getUnreadCount(userId);
  },

  async markAsRead(userId, notificationId) {
    const notif = await notifRepo.findById(notificationId);
    if (!notif || notif.user_id !== userId) return null;
    return notifRepo.markAsRead(notificationId);
  },

  async markAllAsRead(userId) {
    return notifRepo.markAllAsRead(userId);
  },

  /**
   * Create and send a notification.
   * @param {string} userId
   * @param {{ channel: string, priority: string, title: string, body: string, payload?: object }} data
   */
  async send(userId, data) {
    return notifRepo.create({
      user_id: userId,
      channel: data.channel || 'system',
      priority: data.priority || 'medium',
      title: data.title,
      body: data.body,
      payload: data.payload || null,
    });
  },

  /**
   * Send a notification to multiple users.
   */
  async broadcast(userIds, data) {
    const notifications = userIds.map(userId => ({
      user_id: userId,
      channel: data.channel || 'system',
      priority: data.priority || 'medium',
      title: data.title,
      body: data.body,
      payload: data.payload || null,
    }));

    // Batch insert
    const { getSupabaseAdmin } = await import('../config/database.js');
    const db = getSupabaseAdmin();
    const { error } = await db.from('notifications').insert(notifications);
    if (error) throw error;
    return notifications.length;
  },
};
