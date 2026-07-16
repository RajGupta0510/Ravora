import { BaseRepository } from './BaseRepository.js';

export class RecommendationRepository extends BaseRepository {
  constructor() { super('araiven_recommendations'); }

  async findPendingByUserId(userId) {
    const { data, error } = await this.db
      .from(this.tableName)
      .select(`
        id,
        suggested_allocation_pct,
        status,
        reasoning_text,
        opportunity:opportunities (
          id,
          name,
          symbol,
          icon_symbol,
          opportunity_score,
          confidence_score,
          risk_score,
          expected_return,
          risk_level,
          suggested_entry,
          suggested_stop_loss,
          suggested_take_profit,
          expected_duration,
          risk_reward_ratio,
          trend_direction,
          support_levels,
          resistance_levels
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'pending');

    if (error) throw error;
    return data || [];
  }
}
