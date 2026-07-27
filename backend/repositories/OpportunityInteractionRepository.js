import { BaseRepository } from './BaseRepository.js';

export class OpportunityInteractionRepository extends BaseRepository {
  constructor() {
    super('opportunity_interactions');
  }

  /**
   * Retrieves all interactions for a user
   */
  async findByUserId(userId) {
    const { data } = await this.findAll({
      filters: { user_id: userId }
    });
    return data || [];
  }

  /**
   * Records or updates a saved/dismissed interaction
   */
  async recordInteraction(userId, opportunityId, status) {
    const all = await this.findByUserId(userId);
    const existing = all.find(i => i.opportunity_id === opportunityId);

    if (existing) {
      return this.update(existing.id, {
        status,
        updated_at: new Date().toISOString()
      });
    }

    return this.create({
      user_id: userId,
      opportunity_id: opportunityId,
      status, // 'saved' or 'dismissed'
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }
}
