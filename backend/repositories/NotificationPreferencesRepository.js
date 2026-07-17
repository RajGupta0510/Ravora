import { BaseRepository } from './BaseRepository.js';

export class NotificationPreferencesRepository extends BaseRepository {
  constructor() {
    super('notification_preferences');
  }

  async findByUserId(userId) {
    return this.findOne({ user_id: userId });
  }

  async upsertPreferences(userId, preferences) {
    return this.upsert({
      user_id: userId,
      ...preferences
    }, 'user_id');
  }
}
