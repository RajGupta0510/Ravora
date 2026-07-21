/**
 * Portfolio Sync Worker — Scheduled Exchange Engine Worker
 * Runs background synchronization across all connected exchange accounts with concurrency locking and backoff retries.
 */

import { getSupabaseAdmin } from '../../config/database.js';
import { ExchangeSyncService } from '../../services/ExchangeSyncService.js';
import { PortfolioIntelligenceService } from '../../services/PortfolioIntelligenceService.js';
import { logger } from '../../utils/logger.js';

// Concurrency lock to prevent duplicate parallel sync jobs for the same account ID
const activeSyncLocks = new Set();

export async function portfolioSyncWorker() {
  try {
    const db = getSupabaseAdmin();
    
    // 1. Fetch active connected exchange accounts
    const { data: accounts, error: accErr } = await db
      .from('connected_exchanges')
      .select('id, user_id, exchange_name, status, last_sync_at, error_count, updated_at')
      .eq('status', 'active');

    if (accErr) throw accErr;

    for (const account of accounts || []) {
      if (activeSyncLocks.has(account.id)) {
        logger.debug('PortfolioSyncWorker', `Skipping account ${account.id} — sync already in progress`);
        continue;
      }

      try {
        const lastSync = new Date(account.last_sync_at || account.updated_at).getTime();
        const timeSinceSync = Date.now() - lastSync;

        // Exponential backoff for accounts with errors (e.g. errorCount * 5 minutes)
        const minIntervalMs = account.error_count > 0
          ? Math.min(300_000 * Math.pow(2, account.error_count), 3600_000)
          : 300_000; // 5 minutes standard interval

        if (timeSinceSync >= minIntervalMs) {
          activeSyncLocks.add(account.id);
          logger.info('PortfolioSyncWorker', `Auto-syncing exchange ${account.exchange_name} (ID: ${account.id}) for user ${account.user_id}`);

          // Execute background sync
          await ExchangeSyncService.syncExchangeAccount(account.user_id, account.id);
        }
      } catch (syncErr) {
        logger.warn('PortfolioSyncWorker', `Failed auto-sync for account ${account.id}`, { error: syncErr.message });
      } finally {
        activeSyncLocks.delete(account.id);
      }
    }

    // 2. Perform global portfolio intelligence metrics update for all users
    const { data: portfolios, error: portErr } = await db
      .from('portfolios')
      .select('id, user_id');

    if (portErr) throw portErr;

    for (const portfolio of portfolios || []) {
      try {
        const summary = await PortfolioIntelligenceService.calculatePerformanceSummary(portfolio.user_id);
        await db
          .from('portfolios')
          .update({
            current_balance: summary.currentValue,
            updated_at: new Date().toISOString()
          })
          .eq('id', portfolio.id);
      } catch (calcErr) {
        logger.warn('PortfolioSyncWorker', `Failed portfolio metrics update for user ${portfolio.user_id}`, { error: calcErr.message });
      }
    }

    logger.debug('PortfolioSyncWorker', 'Completed scheduled portfolio and exchange sync run.');
  } catch (err) {
    logger.error('PortfolioSyncWorker', 'Error in portfolio sync loop', { error: err.message });
  }
}
