import { BaseRepository } from './BaseRepository.js';

export class WatchlistItemsRepository extends BaseRepository {
  constructor() {
    super('watchlist_items');
  }

  async findByWatchlistId(watchlistId) {
    const { data } = await this.findAll({
      filters: { watchlist_id: watchlistId },
      limit: 100
    });
    return data;
  }

  async addItem(watchlistId, symbol, notes = null) {
    return this.upsert({
      watchlist_id: watchlistId,
      symbol: symbol.toUpperCase(),
      notes
    }, 'watchlist_id,symbol');
  }

  async removeItem(watchlistId, symbol) {
    const { error } = await this.db
      .from(this.tableName)
      .delete()
      .eq('watchlist_id', watchlistId)
      .eq('symbol', symbol.toUpperCase());

    if (error) {
      throw new Error(`Failed to remove item: ${error.message}`);
    }
    return true;
  }
}
