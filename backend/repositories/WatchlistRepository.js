import { BaseRepository } from './BaseRepository.js';

export class WatchlistRepository extends BaseRepository {
  constructor() { super('watchlist'); }

  async findByUserId(userId) {
    const { data } = await this.findAll({ filters: { user_id: userId }, sortBy: 'created_at', sortOrder: 'desc', limit: 100 });
    return data;
  }

  async addSymbol(userId, symbol, notes = null) {
    return this.upsert({ user_id: userId, symbol, notes }, 'user_id,symbol');
  }

  async removeSymbol(userId, symbol) {
    const { error } = await this.db
      .from(this.tableName)
      .delete()
      .eq('user_id', userId)
      .eq('symbol', symbol);
    if (error) throw error;
  }

  async hasSymbol(userId, symbol) {
    const item = await this.findOne({ user_id: userId, symbol });
    return !!item;
  }
}
