import { BaseRepository } from './BaseRepository.js';

export class UserRepository extends BaseRepository {
  constructor() { super('profiles'); }

  async findByEmail(email) {
    return this.findOne({ email });
  }

  async findByUserId(userId) {
    return this.findById(userId);
  }

  async updateOnboardingStatus(userId, completed) {
    return this.update(userId, { onboarding_completed: completed });
  }

  async updateLastLogin(userId) {
    return this.update(userId, { last_login: new Date().toISOString() });
  }
}
