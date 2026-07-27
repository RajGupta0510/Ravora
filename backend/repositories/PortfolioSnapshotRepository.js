import { BaseRepository } from './BaseRepository.js';

export class PortfolioSnapshotRepository extends BaseRepository {
  constructor() {
    super('portfolio_snapshots');
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

  async recordSnapshot(userId, snapshotData) {
    return this.create({
      user_id: userId,
      total_value: snapshotData.total_value || 0,
      cash_balance: snapshotData.cash_balance || 0,
      asset_splits: snapshotData.asset_splits || {},
      risk_score: snapshotData.risk_score || 0,
      safety_score: snapshotData.safety_score || 100,
      created_at: new Date().toISOString()
    });
  }
}
