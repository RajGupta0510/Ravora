import { BaseRepository } from './BaseRepository.js';

export class MarketCacheRepository extends BaseRepository {
  constructor() { super('market_cache'); }

  async getBySymbol(symbol) {
    return this.findOne({ symbol });
  }

  async getAllTickers() {
    const { data, error } = await this.db
      .from(this.tableName)
      .select('*')
      .order('market_cap', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async upsertTicker(tickerData) {
    return this.upsert({ ...tickerData, updated_at: new Date().toISOString() }, 'symbol');
  }

  async upsertMultiple(tickers) {
    const { data, error } = await this.db
      .from(this.tableName)
      .upsert(
        tickers.map(t => ({ ...t, updated_at: new Date().toISOString() })),
        { onConflict: 'symbol' }
      )
      .select();
    if (error) throw error;
    return data || [];
  }
}
