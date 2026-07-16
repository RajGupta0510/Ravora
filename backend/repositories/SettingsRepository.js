import { BaseRepository } from './BaseRepository.js';

export class SettingsRepository extends BaseRepository {
  constructor() { super('user_settings'); }

  async findByUserId(userId) {
    return this.findOne({ user_id: userId });
  }

  async upsertForUser(userId, settings) {
    return this.upsert({ user_id: userId, ...settings }, 'user_id');
  }
}
