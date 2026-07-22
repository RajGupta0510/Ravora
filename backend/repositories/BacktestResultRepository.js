import { BaseRepository } from './BaseRepository.js';

export class BacktestResultRepository extends BaseRepository {
  constructor() {
    super('backtest_results');
  }

  async findByUserId(userId) {
    return this.findAll({ filters: { user_id: userId }, sortBy: 'created_at', sortOrder: 'desc' });
  }
}
