import { BaseRepository } from './BaseRepository.js';

export class StrategyDefinitionRepository extends BaseRepository {
  constructor() {
    super('strategy_definitions');
  }

  async findByUserId(userId) {
    return this.findAll({ filters: { user_id: userId }, sortBy: 'created_at', sortOrder: 'desc' });
  }
}
