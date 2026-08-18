import { BaseRepository, getMemoryStore, withTimeout } from './BaseRepository.js';

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
    try {
      const { data, error } = await withTimeout(this.db
        .from(this.tableName)
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false)
        .select());
      if (error) {
        if (this.isMissingTableError(error)) {
          return this._memoryMarkAllAsRead(userId);
        }
        throw error;
      }
      return data;
    } catch (err) {
      return this._memoryMarkAllAsRead(userId);
    }
  }

  _memoryMarkAllAsRead(userId) {
    const store = getMemoryStore(this.tableName);
    const updated = [];
    for (const record of store.values()) {
      if (record.user_id === userId && !record.is_read) {
        record.is_read = true;
        record.updated_at = new Date().toISOString();
        updated.push(record);
      }
    }
    return updated;
  }

  async getUnreadCount(userId) {
    try {
      const { count, error } = await withTimeout(this.db
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false));
      if (error) {
        if (this.isMissingTableError(error)) {
          return this._memoryGetUnreadCount(userId);
        }
        throw error;
      }
      return count || 0;
    } catch (err) {
      return this._memoryGetUnreadCount(userId);
    }
  }

  _memoryGetUnreadCount(userId) {
    const store = getMemoryStore(this.tableName);
    return Array.from(store.values()).filter(n => n.user_id === userId && !n.is_read).length;
  }

  async clearNotifications(userId) {
    try {
      const { error } = await withTimeout(this.db
        .from(this.tableName)
        .delete()
        .eq('user_id', userId));
      if (error) {
        if (this.isMissingTableError(error)) {
          this._memoryClearNotifications(userId);
          return;
        }
        throw error;
      }
    } catch (err) {
      this._memoryClearNotifications(userId);
    }
  }

  _memoryClearNotifications(userId) {
    const store = getMemoryStore(this.tableName);
    for (const [id, record] of store.entries()) {
      if (record.user_id === userId) {
        store.delete(id);
      }
    }
  }
}
