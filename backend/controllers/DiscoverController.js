import { DiscoverService } from '../services/DiscoverService.js';
import { ApiError } from '../utils/ApiError.js';

export const DiscoverController = {
  /**
   * GET /api/discover
   */
  async getOverview(req, res, next) {
    try {
      const userId = req.user.id;
      const briefing = await DiscoverService.getDailyBriefing(userId);
      const feed = await DiscoverService.getPersonalizedFeed(userId, req.query);

      return res.json({
        success: true,
        data: {
          briefing,
          feed
        }
      });
    } catch (err) { next(err); }
  },

  /**
   * GET /api/discover/feed
   */
  async getFeed(req, res, next) {
    try {
      const userId = req.user.id;
      const feed = await DiscoverService.getPersonalizedFeed(userId, req.query);
      return res.json({ success: true, data: feed });
    } catch (err) { next(err); }
  },

  /**
   * GET /api/discover/briefing
   */
  async getBriefing(req, res, next) {
    try {
      const userId = req.user.id;
      const briefing = await DiscoverService.getDailyBriefing(userId);
      return res.json({ success: true, data: briefing });
    } catch (err) { next(err); }
  },

  /**
   * GET /api/discover/alerts
   */
  async getAlerts(req, res, next) {
    try {
      const userId = req.user.id;
      const alerts = await DiscoverService.getHighPriorityAlerts(userId);
      return res.json({ success: true, data: alerts });
    } catch (err) { next(err); }
  },

  /**
   * GET /api/discover/history
   */
  async getHistory(req, res, next) {
    try {
      const userId = req.user.id;
      const history = await DiscoverService.getInteractionHistory(userId);
      return res.json({ success: true, data: history });
    } catch (err) { next(err); }
  },

  /**
   * POST /api/discover/save
   */
  async saveInsight(req, res, next) {
    try {
      const userId = req.user.id;
      const { insightId } = req.body;
      if (!insightId) throw ApiError.badRequest('insightId is required');
      const result = await DiscoverService.saveInsight(userId, insightId);
      return res.json({ success: true, data: result });
    } catch (err) { next(err); }
  },

  /**
   * POST /api/discover/dismiss
   */
  async dismissInsight(req, res, next) {
    try {
      const userId = req.user.id;
      const { insightId } = req.body;
      if (!insightId) throw ApiError.badRequest('insightId is required');
      const result = await DiscoverService.dismissInsight(userId, insightId);
      return res.json({ success: true, data: result });
    } catch (err) { next(err); }
  },

  /**
   * POST /api/discover/explain
   */
  async explainInsight(req, res, next) {
    try {
      const userId = req.user.id;
      const { insightId } = req.body;
      if (!insightId) throw ApiError.badRequest('insightId is required');
      const result = await DiscoverService.explainInsightDetail(userId, insightId);
      return res.json({ success: true, data: result });
    } catch (err) { next(err); }
  }
};
