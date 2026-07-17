/**
 * Portfolio Sync Worker — recalculates portfolio balances using live prices.
 */

import { getSupabaseAdmin } from '../../config/database.js';
import { ExchangeSyncService } from '../../services/ExchangeSyncService.js';
import { PortfolioIntelligenceService } from '../../services/PortfolioIntelligenceService.js';
import { logger } from '../../utils/logger.js';

export async function portfolioSyncWorker() {
  try {
    const db = getSupabaseAdmin();
    
    // 1. Fetch all connected exchanges that are active
    const { data: accounts, error: accErr } = await db
      .from('connected_exchanges')
      .select('id, user_id, exchange_name, updated_at')
      .eq('status', 'active');

    if (accErr) throw accErr;

    for (const account of accounts || []) {
      try {
        const lastSync = new Date(account.updated_at).getTime();
        const timeSinceSync = Date.now() - lastSync;
        
        // Auto-sync if more than 5 minutes have elapsed since last sync
        if (timeSinceSync > 300_000) {
          logger.info('PortfolioSyncWorker', `Auto-syncing exchange ${account.exchange_name} (ID: ${account.id}) for user ${account.user_id}`);
          await ExchangeSyncService.syncExchangeAccount(account.user_id, account.id);
        }
      } catch (syncErr) {
        logger.warn('PortfolioSyncWorker', `Failed to sync exchange account ${account.id}`, { error: syncErr.message });
      }
    }

    // 2. Perform portfolio recalculation and safety updates for all portfolios
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
        logger.warn('PortfolioSyncWorker', `Failed to recalculate portfolio for user ${portfolio.user_id}`, { error: calcErr.message });
      }
    }

    logger.debug('PortfolioSyncWorker', 'Completed portfolio and exchange sync run.');
  } catch (err) {
    logger.error('PortfolioSyncWorker', 'Failed in portfolio sync loop', { error: err.message });
  }
}
