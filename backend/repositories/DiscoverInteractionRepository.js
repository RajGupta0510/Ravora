import { BaseRepository } from './BaseRepository.js';

export class DiscoverInteractionRepository extends BaseRepository {
  constructor() {
    super('discover_interactions');
  }

  /**
   * Retrieves all discover interactions for a user
   */
  async findByUserId(userId) {
    const { data } = await this.findAll({
      filters: { user_id: userId }
    });
    return data || [];
  }

  /**
   * Records or updates a saved/dismissed discovery insight
   */
  async recordInteraction(userId, insightId, status) {
    const all = await this.findByUserId(userId);
    const existing = all.find(i => i.insight_id === insightId);

    if (existing) {
      return this.update(existing.id, {
        status,
        updated_at: new Date().toISOString()
      });
    }

    return this.create({
      user_id: userId,
      insight_id: insightId,
      status, // 'saved' or 'dismissed'
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }
}
