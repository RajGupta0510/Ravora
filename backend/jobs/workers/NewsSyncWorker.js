/**
 * News Sync Worker — background synchronization for news feed and sentiment metrics.
 */

import { NewsService } from '../../services/NewsService.js';
import { logger } from '../../utils/logger.js';

export async function newsSyncWorker() {
  try {
    const syncedCount = await NewsService.syncNews();
    logger.debug('NewsSyncWorker', `Successfully synced ${syncedCount} new articles.`);
  } catch (err) {
    logger.error('NewsSyncWorker', 'Failed to run news synchronization worker', { error: err.message });
  }
}
export default newsSyncWorker;
