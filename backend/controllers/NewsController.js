import { NewsService } from '../services/NewsService.js';
import { getSupabaseAdmin } from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';

export const NewsController = {
  /**
   * Retrieves latest aggregated market news
   */
  async getLatestNews(req, res, next) {
    try {
      const limit = parseInt(req.query.limit, 10) || 25;
      const articles = await NewsService.getLatestNews(limit);
      return res.json({
        success: true,
        data: articles
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Retrieves news articles mapped to a specific asset
   */
  async getAssetNews(req, res, next) {
    try {
      const { symbol } = req.params;
      const limit = parseInt(req.query.limit, 10) || 25;

      if (!symbol) {
        throw ApiError.badRequest('symbol parameter is required');
      }

      const articles = await NewsService.getAssetNews(symbol, limit);
      return res.json({
        success: true,
        data: articles
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Performs title/content search scans in database
   */
  async searchNews(req, res, next) {
    try {
      const { q } = req.query;
      if (!q) {
        throw ApiError.badRequest('search query parameter q is required');
      }

      let articles = [];
      const db = getSupabaseAdmin();
      try {
        const { data, error } = await db
          .from('news_articles')
          .select('*')
          .or(`title.ilike.%${q}%,content.ilike.%${q}%`)
          .order('published_at', { ascending: false })
          .limit(30);

        if (error) throw error;
        articles = data || [];
      } catch (err) {
        const all = await NewsService.getLatestNews(100);
        articles = all.filter(a => 
          a.title.toLowerCase().includes(q.toLowerCase()) || 
          a.content.toLowerCase().includes(q.toLowerCase())
        );
      }

      return res.json({
        success: true,
        data: articles
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Returns overall rule-based sentiment metrics for an asset
   */
  async getSentimentSummary(req, res, next) {
    try {
      const { symbol } = req.params;
      if (!symbol) {
        throw ApiError.badRequest('symbol parameter is required');
      }

      const sentiment = await NewsService.getSentiment(symbol);
      const impact = await NewsService.getMarketImpact(symbol);

      return res.json({
        success: true,
        data: {
          symbol: symbol.toUpperCase(),
          ...sentiment,
          ...impact
        }
      });
    } catch (err) {
      next(err);
    }
  },

  async bookmarkArticle(req, res, next) {
    try {
      const userId = req.user.id;
      const { id: articleId } = req.params;

      if (!articleId) {
        throw ApiError.badRequest('article id parameter is required');
      }

      const bookmark = await NewsService.bookmarkArticle(userId, articleId);
      return res.json({
        success: true,
        data: bookmark
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Retrieves bookmarked articles for the user
   */
  async getBookmarks(req, res, next) {
    try {
      const userId = req.user.id;
      const articles = await NewsService.getBookmarks(userId);
      return res.json({
        success: true,
        data: articles
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Lists trending categories and volume counts
   */
  async getCategories(req, res, next) {
    try {
      const trending = await NewsService.getTrendingTopics();
      return res.json({
        success: true,
        data: trending
      });
    } catch (err) {
      next(err);
    }
  }
};
export default NewsController;
