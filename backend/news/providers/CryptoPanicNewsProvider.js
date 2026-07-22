import { NewsProviderInterface } from './NewsProviderInterface.js';
import env from '../../config/environment.js';
import { logger } from '../../utils/logger.js';

export class CryptoPanicNewsProvider extends NewsProviderInterface {
  constructor() {
    super('CryptoPanic');
  }

  async fetchLatestNews() {
    const apiKey = env.CRYPTOPANIC_API_KEY;
    if (!apiKey || apiKey.includes('your_cryptopanic')) {
      logger.debug('CryptoPanic', 'API Key not configured. Skipping CryptoPanic sync.');
      return [];
    }

    try {
      const url = `https://cryptopanic.com/api/v1/posts/?auth_token=${apiKey}&public=true`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP Error ${res.status}`);
      }

      const json = await res.json();
      const results = json.results || [];

      return results.map(post => ({
        title: post.title,
        content: post.title, // CryptoPanic free API usually returns titles only
        url: post.url,
        source: post.source?.title || 'CryptoPanic',
        category: post.metadata?.type || 'general',
        published_at: post.published_at || new Date().toISOString()
      }));
    } catch (err) {
      logger.error('CryptoPanic', 'Failed to fetch news from CryptoPanic', { error: err.message });
      return [];
    }
  }
}
export default CryptoPanicNewsProvider;
