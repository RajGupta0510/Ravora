import { BaseRepository } from './BaseRepository.js';

export class TradingAssetRepository extends BaseRepository {
  constructor() {
    super('trading_assets');
  }

  /**
   * Retrieves all registered trading assets
   */
  async getAllAssets() {
    const { data } = await this.findAll({});
    return data || [];
  }

  /**
   * Syncs asset definitions
   */
  async syncAssets(assetsList) {
    const all = await this.getAllAssets();
    for (const asset of assetsList) {
      const existing = all.find(a => a.symbol === asset.symbol);
      if (existing) {
        await this.update(existing.id, {
          ...asset,
          updated_at: new Date().toISOString()
        });
      } else {
        await this.create({
          ...asset,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    }
  }
}
