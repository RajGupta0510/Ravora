import { BaseRepository } from './BaseRepository.js';

export class PortfolioRepository extends BaseRepository {
  constructor() { super('portfolios'); }

  async findByUserId(userId) {
    return this.findOne({ user_id: userId });
  }

  async getAssets(portfolioId) {
    const { data, error } = await this.db
      .from('portfolio_assets')
      .select('*')
      .eq('portfolio_id', portfolioId);
    if (error) throw error;
    return data || [];
  }

  async upsertAsset(portfolioId, assetData) {
    const { data, error } = await this.db
      .from('portfolio_assets')
      .upsert({ portfolio_id: portfolioId, ...assetData }, { onConflict: 'portfolio_id,asset_symbol' })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateBalance(userId, balance, safetyScore) {
    const portfolio = await this.findByUserId(userId);
    if (!portfolio) return null;
    return this.update(portfolio.id, { current_balance: balance, safety_score: safetyScore });
  }
}
