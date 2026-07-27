import { BaseRepository } from './BaseRepository.js';

export class LearningProgressRepository extends BaseRepository {
  constructor() {
    super('learning_progress');
  }

  async findByUserId(userId) {
    return this.findOne({ user_id: userId });
  }

  async upsertLearningProgress(userId, progress) {
    const existing = await this.findByUserId(userId);
    if (existing) {
      return this.update(existing.id, {
        ...progress,
        updated_at: new Date().toISOString()
      });
    } else {
      return this.create({
        user_id: userId,
        concepts_explained: [],
        indicators_learned: [],
        trading_mistakes: [],
        repeated_questions: {},
        knowledge_level: 'beginner',
        ...progress
      });
    }
  }
}
