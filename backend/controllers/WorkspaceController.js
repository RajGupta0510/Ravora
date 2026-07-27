import { WorkspaceService } from '../services/WorkspaceService.js';
import { ApiError } from '../utils/ApiError.js';

export const WorkspaceController = {
  /**
   * GET /api/workspace/assets
   */
  async getAssets(req, res, next) {
    try {
      const assets = await WorkspaceService.getTradingAssets();
      return res.json({ success: true, data: assets });
    } catch (err) { next(err); }
  },

  /**
   * GET /api/workspace/opportunities
   */
  async getOpportunities(req, res, next) {
    try {
      const userId = req.user.id;
      const opportunities = await WorkspaceService.scanOpportunities(userId, req.query);
      return res.json({ success: true, data: opportunities });
    } catch (err) { next(err); }
  },

  /**
   * GET /api/workspace/analysis/{symbol}
   */
  async getAnalysis(req, res, next) {
    try {
      const { symbol } = req.params;
      const timeframe = req.query.timeframe || '1d';
      const analysis = await WorkspaceService.calculateIndicatorsForAsset(symbol, timeframe);
      return res.json({ success: true, data: { symbol, timeframe, analysis } });
    } catch (err) { next(err); }
  },

  /**
   * GET /api/workspace/timeframes/{symbol}
   */
  async getTimeframes(req, res, next) {
    try {
      const { symbol } = req.params;
      return res.json({
        success: true,
        data: {
          symbol,
          timeframes: ['5m', '15m', '1h', '4h', '1d']
        }
      });
    } catch (err) { next(err); }
  },

  /**
   * GET /api/workspace/opportunities/{id}
   */
  async getOpportunityById(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const details = await WorkspaceService.getOpportunityDetails(userId, id);
      return res.json({ success: true, data: details });
    } catch (err) { next(err); }
  },

  /**
   * GET /api/workspace/watchlist
   */
  async getWatchlist(req, res, next) {
    try {
      const userId = req.user.id;
      const watchlist = await WorkspaceService.getWatchlist(userId);
      return res.json({ success: true, data: watchlist });
    } catch (err) { next(err); }
  },

  /**
   * POST /api/workspace/watchlist
   */
  async toggleWatchlist(req, res, next) {
    try {
      const userId = req.user.id;
      const { symbol } = req.body;
      if (!symbol) throw ApiError.badRequest('symbol is required');
      const result = await WorkspaceService.toggleWatchlist(userId, symbol);
      return res.json({ success: true, data: result });
    } catch (err) { next(err); }
  },

  /**
   * POST /api/workspace/alerts
   */
  async createAlert(req, res, next) {
    try {
      const userId = req.user.id;
      const { symbol, conditionType, thresholdValue } = req.body;
      if (!symbol || !conditionType || !thresholdValue) {
        throw ApiError.badRequest('symbol, conditionType, and thresholdValue are required');
      }
      const alert = await WorkspaceService.createAlert(userId, req.body);
      return res.json({ success: true, data: alert });
    } catch (err) { next(err); }
  }
};
