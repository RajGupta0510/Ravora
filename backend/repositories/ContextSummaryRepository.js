import { BaseRepository } from './BaseRepository.js';

export class ContextSummaryRepository extends BaseRepository {
  constructor() {
    super('context_summaries');
  }

  async findByUserId(userId, limit = 20) {
    const { data } = await this.findAll({
      filters: { user_id: userId },
      sortBy: 'created_at',
      sortOrder: 'desc',
      limit
    });
    return data || [];
  }

  async recordSummary(userId, data) {
    return this.create({
      user_id: userId,
      conversation_id: data.conversation_id || null,
      summary_type: data.summary_type || 'general', // e.g. general, market_discussion, portfolio_evolution
      content: data.content,
      keywords: data.keywords || [],
      created_at: new Date().toISOString()
    });
  }

  async clearUserSummaries(userId) {
    const summaries = await this.findByUserId(userId, 500);
    for (const sum of summaries) {
      await this.hardDelete(sum.id);
    }
  }
}
