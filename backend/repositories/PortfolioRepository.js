import { BaseRepository, getMemoryStore, withTimeout } from './BaseRepository.js';

export class PortfolioRepository extends BaseRepository {
  constructor() { super('portfolios'); }

  async findByUserId(userId) {
    return this.findOne({ user_id: userId });
  }

  async getAssets(portfolioId) {
    try {
      const { data, error } = await withTimeout(this.db
        .from('portfolio_assets')
        .select('*')
        .eq('portfolio_id', portfolioId));
      if (error) {
        if (this.isMissingTableError(error)) {
          return this._memoryGetAssets(portfolioId);
        }
        throw error;
      }
      return data || [];
    } catch (err) {
      return this._memoryGetAssets(portfolioId);
    }
  }

  _memoryGetAssets(portfolioId) {
    const store = getMemoryStore('portfolio_assets');
    return Array.from(store.values()).filter(a => a.portfolio_id === portfolioId);
  }

  async upsertAsset(portfolioId, assetData) {
    try {
      const { data, error } = await withTimeout(this.db
        .from('portfolio_assets')
        .upsert({ portfolio_id: portfolioId, ...assetData }, { onConflict: 'portfolio_id,asset_symbol' })
        .select()
        .single());
      if (error) {
        if (this.isMissingTableError(error)) {
          return this._memoryUpsertAsset(portfolioId, assetData);
        }
        throw error;
      }
      return data;
    } catch (err) {
      return this._memoryUpsertAsset(portfolioId, assetData);
    }
  }

  _memoryUpsertAsset(portfolioId, assetData) {
    const store = getMemoryStore('portfolio_assets');
    const existing = Array.from(store.values()).find(
      a => a.portfolio_id === portfolioId && a.asset_symbol === assetData.asset_symbol
    );
    const id = existing?.id || Math.random().toString(36).substr(2, 9);
    const record = {
      id,
      portfolio_id: portfolioId,
      ...assetData
    };
    store.set(id, record);
    return record;
  }

  async clearAssets(portfolioId) {
    try {
      const { error } = await withTimeout(this.db
        .from('portfolio_assets')
        .delete()
        .eq('portfolio_id', portfolioId));
      if (error) {
        if (this.isMissingTableError(error)) {
          this._memoryClearAssets(portfolioId);
          return;
        }
        throw error;
      }
    } catch (err) {
      this._memoryClearAssets(portfolioId);
    }
  }

  _memoryClearAssets(portfolioId) {
    const store = getMemoryStore('portfolio_assets');
    for (const [id, record] of store.entries()) {
      if (record.portfolio_id === portfolioId) {
        store.delete(id);
      }
    }
  }

  async updateBalance(userId, balance, safetyScore) {
    const portfolio = await this.findByUserId(userId);
    if (!portfolio) return null;
    return this.update(portfolio.id, { current_balance: balance, safety_score: safetyScore });
  }
}
