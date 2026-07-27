import { BaseRepository } from './BaseRepository.js';

export class RecommendationHistoryRepository extends BaseRepository {
  constructor() {
    super('recommendation_history');
  }

  async findByUserId(userId, limit = 50) {
    const { data } = await this.findAll({
      filters: { user_id: userId },
      sortBy: 'created_at',
      sortOrder: 'desc',
      limit
    });
    return data || [];
  }

  async recordRecommendation(userId, data) {
    return this.create({
      user_id: userId,
      conversation_id: data.conversation_id || null,
      symbol: data.symbol.toUpperCase(),
      action: data.action, // e.g. accumulate, trim, hold
      reasoning: data.reasoning || '',
      confidence_score: data.confidence_score || null,
      followed: null, // null = unknown, true = followed, false = ignored
      outcome: null,
      created_at: new Date().toISOString()
    });
  }

  async updateFollowStatus(id, followed, outcome = null) {
    return this.update(id, {
      followed,
      outcome,
      updated_at: new Date().toISOString()
    });
  }
}
