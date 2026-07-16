import { BaseRepository } from './BaseRepository.js';

export class NotificationRepository extends BaseRepository {
  constructor() { super('notifications'); }

  async findByUserId(userId, options = {}) {
    return this.findAll({ filters: { user_id: userId }, ...options });
  }

  async findUnreadByUserId(userId) {
    const { data } = await this.findAll({
      filters: { user_id: userId, is_read: false },
      sortBy: 'created_at',
      sortOrder: 'desc',
      limit: 50,
    });
    return data;
  }

  async markAsRead(id) {
    return this.update(id, { is_read: true });
  }

  async markAllAsRead(userId) {
    const { data, error } = await this.db
      .from(this.tableName)
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)
      .select();
    if (error) throw error;
    return data;
  }

  async getUnreadCount(userId) {
    const { count, error } = await this.db
      .from(this.tableName)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    if (error) throw error;
    return count || 0;
  }
}
