import { BaseRepository } from './BaseRepository.js';

export class PositionRepository extends BaseRepository {
  constructor() { super('positions'); }

  async findOpenByUserId(userId) {
    const { data } = await this.findAll({
      filters: { user_id: userId, status: 'open' },
      sortBy: 'created_at',
      sortOrder: 'desc',
      limit: 100,
    });
    return data;
  }

  async findByUserAndSymbol(userId, symbol) {
    return this.findOne({ user_id: userId, symbol, status: 'open' });
  }

  async closePosition(id, exitPrice, pnl) {
    return this.update(id, {
      status: 'closed',
      current_price: exitPrice,
      unrealized_pnl: 0,
      closed_at: new Date().toISOString(),
    });
  }
}
