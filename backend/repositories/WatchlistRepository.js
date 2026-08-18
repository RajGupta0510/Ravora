import { BaseRepository, getMemoryStore, withTimeout } from './BaseRepository.js';

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
    try {
      const { error } = await withTimeout(this.db
        .from(this.tableName)
        .delete()
        .eq('user_id', userId)
        .eq('symbol', symbol));
      if (error) {
        if (this.isMissingTableError(error)) {
          this._memoryRemoveSymbol(userId, symbol);
          return;
        }
        throw error;
      }
    } catch (err) {
      this._memoryRemoveSymbol(userId, symbol);
    }
  }

  _memoryRemoveSymbol(userId, symbol) {
    const store = getMemoryStore(this.tableName);
    for (const [id, record] of store.entries()) {
      if (record.user_id === userId && record.symbol === symbol) {
        store.delete(id);
      }
    }
  }

  async clearWatchlist(userId) {
    try {
      const { error } = await withTimeout(this.db
        .from(this.tableName)
        .delete()
        .eq('user_id', userId));
      if (error) {
        if (this.isMissingTableError(error)) {
          this._memoryClearWatchlist(userId);
          return;
        }
        throw error;
      }
    } catch (err) {
      this._memoryClearWatchlist(userId);
    }
  }

  _memoryClearWatchlist(userId) {
    const store = getMemoryStore(this.tableName);
    for (const [id, record] of store.entries()) {
      if (record.user_id === userId) {
        store.delete(id);
      }
    }
  }

  async hasSymbol(userId, symbol) {
    const item = await this.findOne({ user_id: userId, symbol });
    return !!item;
  }
}
