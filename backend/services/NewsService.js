import { MockNewsProvider } from '../news/providers/MockNewsProvider.js';
import { CryptoPanicNewsProvider } from '../news/providers/CryptoPanicNewsProvider.js';
import { getSupabaseAdmin } from '../config/database.js';
import { logger } from '../utils/logger.js';

// Define local repositories in-line or raw queries to remain decoupled
const db = getSupabaseAdmin;

// In-memory fallback stores for news (self-healing resilience)
const memoryArticles = new Map();
const memoryMappings = [];
const memoryBookmarks = [];

// Deterministic positive & negative lists for local sentiment analysis
const POSITIVE_WORDS = ['bullish', 'surge', 'breakout', 'inflow', 'accumulation', 'upgrade', 'support', 'gains', 'buy', 'rally', 'utility', 'pump', 'approve', 'outperform', 'highest', 'expansion', 'integration'];
const NEGATIVE_WORDS = ['bearish', 'drop', 'crash', 'outflow', 'regulation', 'ban', 'hack', 'exploit', 'dump', 'sell', 'selloff', 'liquidation', 'resistance', 'crackdown', 'fined', 'lawsuit', 'investigate'];

// Keywords to trigger high/critical market impact
const IMPACT_CRITICAL = ['hack', 'exploit', 'ban', 'cpi', 'fomc', 'rate cut', 'rate hike', 'sec lawsuit'];
const IMPACT_HIGH = ['etf', 'upgrade', 'approval', 'regulatory', 'inflows', 'outflows'];

export const NewsService = {
  clearMemory() {
    memoryArticles.clear();
    memoryMappings.length = 0;
    memoryBookmarks.length = 0;
  },

  /**
   * Syncs and processes news feeds from all providers.
   * Performs deduplication and rule-based sentiment calculations.
   */
  async syncNews() {
    logger.info('NewsService', 'Starting background news synchronization...');

    const providers = [
      new MockNewsProvider(),
      new CryptoPanicNewsProvider()
    ];

    let allFetched = [];
    for (const p of providers) {
      try {
        const posts = await p.fetchLatestNews();
        allFetched = allFetched.concat(posts);
      } catch (err) {
        logger.error('NewsService', `Provider ${p.name} failed`, { error: err.message });
      }
    }

    if (allFetched.length === 0) {
      logger.info('NewsService', 'No new articles fetched.');
      return 0;
    }

    const client = db();
    let newInserted = 0;

    for (const article of allFetched) {
      try {
        // 1. Duplicate Detection Check (matching URL or Title within 60 minutes window)
        let duplicate = null;
        try {
          const checkWindow = new Date(new Date(article.published_at).getTime() - 60 * 60000).toISOString();
          const { data, error } = await client
            .from('news_articles')
            .select('id, url, title')
            .or(`url.eq."${article.url}",title.eq."${article.title}"`)
            .gte('published_at', checkWindow)
            .maybeSingle();
          if (error) throw error;
          duplicate = data;
        } catch (err) {
          const checkWindowTime = new Date(article.published_at).getTime() - 60 * 60000;
          duplicate = Array.from(memoryArticles.values()).find(a => 
            (a.url === article.url || a.title === article.title) && 
            new Date(a.published_at).getTime() >= checkWindowTime
          );
        }

        if (duplicate) {
          logger.debug('NewsService', `Skipping duplicate article: "${article.title}"`);
          continue;
        }

        // 2. Perform Local Deterministic Sentiment Analysis
        const sentimentSnapshot = this.analyzeSentimentLocally(article.title + " " + article.content);

        // 3. Perform Market Impact Rating
        const impactSnapshot = this.evaluateMarketImpactLocally(article.title + " " + article.content);

        // 4. Ingest Article
        let inserted = null;
        try {
          const { data, error: insertError } = await client
            .from('news_articles')
            .insert({
              title: article.title,
              content: article.content,
              url: article.url,
              source: article.source,
              category: article.category,
              published_at: article.published_at,
              sentiment: sentimentSnapshot.sentiment,
              sentiment_score: sentimentSnapshot.score,
              market_impact: impactSnapshot.impact
            })
            .select()
            .single();

          if (insertError) throw insertError;
          inserted = data;
        } catch (err) {
          inserted = {
            id: Math.random().toString(36).substr(2, 9),
            title: article.title,
            content: article.content,
            url: article.url,
            source: article.source,
            category: article.category,
            published_at: article.published_at,
            sentiment: sentimentSnapshot.sentiment,
            sentiment_score: sentimentSnapshot.score,
            market_impact: impactSnapshot.impact,
            created_at: new Date().toISOString()
          };
          memoryArticles.set(inserted.id, inserted);
        }

        // 5. Extract and map assets
        const mappedAssets = this.extractAssets(article.title + " " + article.content);
        if (mappedAssets.length > 0) {
          try {
            const mappings = mappedAssets.map(asset => ({
              article_id: inserted.id,
              asset_symbol: asset
            }));
            const { error: mapError } = await client.from('news_asset_mappings').insert(mappings);
            if (mapError) throw mapError;
          } catch (err) {
            mappedAssets.forEach(asset => {
              memoryMappings.push({
                article_id: inserted.id,
                asset_symbol: asset
              });
            });
          }
        }

        newInserted++;
      } catch (err) {
        logger.error('NewsService', `Failed to process article: ${article.title}`, { error: err.message });
      }
    }

    logger.info('NewsService', `Sync completed successfully. Synced ${newInserted} new articles.`);
    return newInserted;
  },

  /**
   * Deterministic local sentiment analysis
   */
  analyzeSentimentLocally(text) {
    const cleanText = text.toLowerCase();
    
    let posCount = 0;
    let negCount = 0;

    POSITIVE_WORDS.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'g');
      const matches = cleanText.match(regex);
      if (matches) posCount += matches.length;
    });

    NEGATIVE_WORDS.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'g');
      const matches = cleanText.match(regex);
      if (matches) negCount += matches.length;
    });

    const total = posCount + negCount;
    if (total === 0) {
      return { sentiment: 'Neutral', score: 0.5 };
    }

    // Score from 0.0 (bearish) to 1.0 (bullish)
    const score = (posCount - negCount) / total;
    const normalizedScore = (score + 1) / 2; // maps [-1, 1] to [0, 1]

    let sentiment = 'Neutral';
    if (score >= 0.6) sentiment = 'Very Bullish';
    else if (score >= 0.2) sentiment = 'Bullish';
    else if (score <= -0.6) sentiment = 'Very Bearish';
    else if (score <= -0.2) sentiment = 'Bearish';

    return { sentiment, score: Math.round(normalizedScore * 100) / 100 };
  },

  /**
   * Deterministic local market impact evaluator
   */
  evaluateMarketImpactLocally(text) {
    const cleanText = text.toLowerCase();

    const matchesCritical = IMPACT_CRITICAL.some(word => cleanText.includes(word));
    if (matchesCritical) return { impact: 'critical' };

    const matchesHigh = IMPACT_HIGH.some(word => cleanText.includes(word));
    if (matchesHigh) return { impact: 'high' };

    // Medium if it mentions generic volatility/volume
    if (cleanText.includes('volume') || cleanText.includes('volatility') || cleanText.includes('breakout')) {
      return { impact: 'medium' };
    }

    return { impact: 'low' };
  },

  /**
   * Extracts crypto assets mentioned in the text
   */
  extractAssets(text) {
    const cleanText = text.toUpperCase();
    const assetsSupported = ['BTC', 'ETH', 'SOL', 'BNB', 'SUI', 'LINK'];
    const matched = [];

    assetsSupported.forEach(asset => {
      if (cleanText.includes(asset) || 
          (asset === 'BTC' && cleanText.includes('BITCOIN')) ||
          (asset === 'ETH' && cleanText.includes('ETHEREUM')) ||
          (asset === 'SOL' && cleanText.includes('SOLANA')) ||
          (asset === 'LINK' && cleanText.includes('CHAINLINK'))) {
        matched.push(asset);
      }
    });

    return matched;
  },

  // --- REUSABLE SERVICES FOR CLIENTS & ARAIVEN AI BRAIN ---

  async getLatestNews(limit = 25) {
    try {
      const { data, error } = await db()
        .from('news_articles')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data || [];
    } catch (err) {
      return Array.from(memoryArticles.values())
        .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
        .slice(0, limit);
    }
  },

  async getAssetNews(symbol, limit = 25) {
    const client = db();
    try {
      const { data: mappings, error } = await client
        .from('news_asset_mappings')
        .select('article_id')
        .eq('asset_symbol', symbol.toUpperCase());
      if (error) throw error;

      if (!mappings || mappings.length === 0) return [];
      
      const ids = mappings.map(m => m.article_id);
      const { data, error: articlesError } = await client
        .from('news_articles')
        .select('*')
        .in('id', ids)
        .order('published_at', { ascending: false })
        .limit(limit);

      if (articlesError) throw articlesError;
      return data || [];
    } catch (err) {
      const matchedIds = memoryMappings
        .filter(m => m.asset_symbol === symbol.toUpperCase())
        .map(m => m.article_id);
      
      return Array.from(memoryArticles.values())
        .filter(a => matchedIds.includes(a.id))
        .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
        .slice(0, limit);
    }
  },

  async getSentiment(symbol) {
    const articles = await this.getAssetNews(symbol, 20);
    if (articles.length === 0) return { overallSentiment: 'Neutral', averageScore: 0.5 };

    const sum = articles.reduce((acc, curr) => acc + parseFloat(curr.sentiment_score), 0);
    const averageScore = sum / articles.length;

    let overallSentiment = 'Neutral';
    if (averageScore >= 0.75) overallSentiment = 'Very Bullish';
    else if (averageScore >= 0.55) overallSentiment = 'Bullish';
    else if (averageScore <= 0.25) overallSentiment = 'Very Bearish';
    else if (averageScore <= 0.45) overallSentiment = 'Bearish';

    return {
      overallSentiment,
      averageScore: Math.round(averageScore * 100) / 100,
      totalCount: articles.length
    };
  },

  async getMarketImpact(symbol) {
    const articles = await this.getAssetNews(symbol, 20);
    if (articles.length === 0) return { overallImpact: 'low' };

    const criticalCount = articles.filter(a => a.market_impact === 'critical').length;
    const highCount = articles.filter(a => a.market_impact === 'high').length;
    const mediumCount = articles.filter(a => a.market_impact === 'medium').length;

    let overallImpact = 'low';
    if (criticalCount > 0) overallImpact = 'critical';
    else if (highCount >= 2) overallImpact = 'high';
    else if (mediumCount >= 4) overallImpact = 'medium';

    return {
      overallImpact,
      criticalCount,
      highCount,
      mediumCount,
      lowCount: articles.length - (criticalCount + highCount + mediumCount)
    };
  },

  async getTrendingTopics() {
    try {
      const client = db();
      const { data, error } = await client
        .from('news_articles')
        .select('category, sentiment')
        .order('published_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      
      const counts = {};
      (data || []).forEach(a => {
        counts[a.category] = (counts[a.category] || 0) + 1;
      });

      return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .map(([category, count]) => ({ category, count }));
    } catch (err) {
      const counts = {};
      Array.from(memoryArticles.values()).slice(0, 50).forEach(a => {
        counts[a.category] = (counts[a.category] || 0) + 1;
      });

      return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .map(([category, count]) => ({ category, count }));
    }
  },

  async bookmarkArticle(userId, articleId) {
    const client = db();
    try {
      const { data, error } = await client
        .from('news_bookmarks')
        .upsert({
          user_id: userId,
          article_id: articleId
        }, { onConflict: 'user_id,article_id' })
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      const existing = memoryBookmarks.find(b => b.user_id === userId && b.article_id === articleId);
      if (existing) return existing;

      const newBookmark = {
        id: Math.random().toString(36).substr(2, 9),
        user_id: userId,
        article_id: articleId,
        created_at: new Date().toISOString()
      };
      memoryBookmarks.push(newBookmark);
      return newBookmark;
    }
  },

  async getBookmarks(userId) {
    const client = db();
    try {
      const { data: bookmarks, error } = await client
        .from('news_bookmarks')
        .select('article_id')
        .eq('user_id', userId);
      if (error) throw error;

      if (!bookmarks || bookmarks.length === 0) return [];

      const ids = bookmarks.map(b => b.article_id);
      const { data: articles, error: articlesError } = await client
        .from('news_articles')
        .select('*')
        .in('id', ids)
        .order('published_at', { ascending: false });

      if (articlesError) throw articlesError;
      return articles || [];
    } catch (err) {
      const ids = memoryBookmarks
        .filter(b => b.user_id === userId)
        .map(b => b.article_id);
      
      return Array.from(memoryArticles.values())
        .filter(a => ids.includes(a.id))
        .sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
    }
  }
};
export default NewsService;
