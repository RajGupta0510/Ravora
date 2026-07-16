import { BaseRepository } from './BaseRepository.js';

export class OpportunityRepository extends BaseRepository {
  constructor() { super('opportunities'); }

  async findAllOpportunities() {
    const { data, error } = await this.db
      .from(this.tableName)
      .select('*')
      .order('opportunity_score', { ascending: false });
    if (error) throw error;
    return data || [];
  }
}
