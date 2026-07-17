/**
 * Exchange Sync Service — Handles API key encryption, credential validation, background sync triggers, and portfolio reconciliation.
 */

import { getSupabaseAdmin } from '../config/database.js';
import { encrypt, decrypt } from '../utils/encryption.js';
import { ExchangeFactory } from '../exchange/ExchangeFactory.js';
import { PortfolioIntelligenceService } from './PortfolioIntelligenceService.js';
import { MarketDataService } from './MarketDataService.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

export const ExchangeSyncService = {
  /**
   * Connects a new exchange account for a user, validates keys, and initiates a sync.
   */
  async connectExchange(userId, exchangeName, apiKey, apiSecret, passphrase = null) {
    const db = getSupabaseAdmin();

    // 1. Verify exchange is supported
    const supported = ExchangeFactory.getSupportedExchanges();
    if (!supported.includes(exchangeName.toLowerCase())) {
      throw ApiError.badRequest(`Unsupported exchange: ${exchangeName}`);
    }

    // 2. Validate credentials with the exchange provider
    const provider = ExchangeFactory.create(exchangeName, { apiKey, apiSecret, passphrase });
    const validation = await provider.validateCredentials();
    if (!validation.valid) {
      throw ApiError.badRequest(`Invalid credentials: ${validation.error}`);
    }

    // 3. Encrypt credentials for secure storage at rest
    const apiKeyEncrypted = encrypt(apiKey);
    const apiSecretEncrypted = encrypt(apiSecret);
    const passphraseEncrypted = passphrase ? encrypt(passphrase) : null;

    // 4. Save to database
    const { data: account, error } = await db
      .from('connected_exchanges')
      .upsert({
        user_id: userId,
        exchange_name: exchangeName.toLowerCase(),
        api_key_encrypted: apiKeyEncrypted,
        api_secret_encrypted: apiSecretEncrypted,
        status: 'active',
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,exchange_name' })
      .select()
      .single();

    if (error) {
      logger.error('ExchangeSync', 'Failed to save connected exchange', { error: error.message });
      throw error;
    }

    // 5. Trigger manual sync in the background
    this.syncExchangeAccount(userId, account.id).catch(err => {
      logger.error('ExchangeSync', 'Background sync failed after connection', { error: err.message });
    });

    return {
      id: account.id,
      exchangeName: account.exchange_name,
      status: account.status,
      lastSyncAt: account.updated_at
    };
  },

  /**
   * Disconnects an exchange and removes all its synced assets.
   */
  async disconnectExchange(userId, accountId) {
    const db = getSupabaseAdmin();

    // 1. Remove exchange credentials
    const { error: deleteErr } = await db
      .from('connected_exchanges')
      .delete()
      .eq('id', accountId)
      .eq('user_id', userId);

    if (deleteErr) throw deleteErr;

    // 2. Delete all holdings and records associated with this exchange account
    await db.from('portfolio_assets').delete().eq('exchange_account_id', accountId);

    // 3. Trigger portfolio recalculation
    try {
      const summary = await PortfolioIntelligenceService.calculatePerformanceSummary(userId);
      // Update portfolio value
      const { data: portfolio } = await db
        .from('portfolios')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (portfolio) {
        await db.from('portfolios').update({ current_balance: summary.currentValue }).eq('id', portfolio.id);
      }
    } catch (err) {
      logger.warn('ExchangeSync', 'Failed to recalculate portfolio after disconnect', { error: err.message });
    }

    return { success: true };
  },

  /**
   * Lists all exchanges connected by a user
   */
  async listConnectedExchanges(userId) {
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from('connected_exchanges')
      .select('id, exchange_name, status, created_at, updated_at')
      .eq('user_id', userId);

    if (error) throw error;

    return (data || []).map(row => ({
      id: row.id,
      exchangeName: row.exchange_name,
      status: row.status,
      lastSyncAt: row.updated_at
    }));
  },

  /**
   * Synchronizes balances, assets, positions, and history from a connected exchange account
   */
  async syncExchangeAccount(userId, accountId) {
    const db = getSupabaseAdmin();
    
    // 1. Create a sync log record
    const { data: log, error: logErr } = await db
      .from('exchange_sync_logs')
      .insert({
        user_id: userId,
        exchange_account_id: accountId,
        sync_status: 'in_progress'
      })
      .select()
      .single();

    if (logErr) logger.warn('ExchangeSync', 'Failed to create sync log', { error: logErr.message });

    try {
      // 2. Fetch exchange credentials
      const { data: account, error: accErr } = await db
        .from('connected_exchanges')
        .select('*')
        .eq('id', accountId)
        .eq('user_id', userId)
        .maybeSingle();

      if (accErr || !account) {
        throw new Error('Connected exchange account not found');
      }

      // 3. Decrypt keys
      const apiKey = decrypt(account.api_key_encrypted);
      const apiSecret = decrypt(account.api_secret_encrypted);

      // 4. Instantiate provider and fetch assets
      const provider = ExchangeFactory.create(account.exchange_name, { apiKey, apiSecret });
      const balances = await provider.getBalance(); // returns [{ asset: 'BTC', free: 1.25, locked: 0.0 }, ...]

      // 5. Reconcile assets into portfolio_assets
      const { data: portfolio } = await db
        .from('portfolios')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (!portfolio) {
        throw new Error('User has no portfolio to sync assets into');
      }

      // Delete existing assets for this exchange to avoid duplicates
      await db.from('portfolio_assets').delete().eq('exchange_account_id', accountId);

      const overview = await MarketDataService.getOverview();
      const prices = { USDC: 1.00, USDS: 1.00, USDT: 1.00 };
      overview.forEach(o => {
        prices[o.symbol] = o.price;
      });

      let totalVal = 0;
      const assetInserts = [];

      for (const bal of balances) {
        const totalAmount = bal.free + bal.locked;
        if (totalAmount <= 0) continue;

        const livePrice = prices[bal.asset] || 1.00;
        totalVal += totalAmount * livePrice;

        assetInserts.push({
          portfolio_id: portfolio.id,
          exchange_account_id: accountId,
          asset_symbol: bal.asset,
          allocation_pct: 0.0, // recalculated below
          balance_amount: totalAmount,
          average_entry_price: livePrice,
          position_type: 'long',
          leverage: 1.0
        });
      }

      if (assetInserts.length > 0) {
        // Calculate allocations
        assetInserts.forEach(ai => {
          ai.allocation_pct = totalVal > 0 ? (ai.balance_amount * ai.average_entry_price / totalVal) * 100 : 0.0;
        });

        const { error: insErr } = await db.from('portfolio_assets').insert(assetInserts);
        if (insErr) throw insErr;
      }

      // 6. Recalculate portfolio total value
      const summary = await PortfolioIntelligenceService.calculatePerformanceSummary(userId);
      await db.from('portfolios').update({ current_balance: summary.currentValue }).eq('id', portfolio.id);

      // 7. Update exchange last sync time
      await db
        .from('connected_exchanges')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', accountId);

      // 8. Update sync log to success
      if (log) {
        await db
          .from('exchange_sync_logs')
          .update({
            sync_status: 'success',
            payload: { assets_imported: assetInserts.length, total_valuation: totalVal }
          })
          .eq('id', log.id);
      }

      logger.info('ExchangeSync', `Successfully synced ${account.exchange_name} for user ${userId}`);
      return { success: true, assetsSynced: assetInserts.length };
    } catch (err) {
      logger.error('ExchangeSync', `Failed to sync exchange for user ${userId}`, { error: err.message });
      
      // Update sync log to failed
      if (log) {
        await db
          .from('exchange_sync_logs')
          .update({
            sync_status: 'failed',
            error_message: err.message
          })
          .eq('id', log.id);
      }

      throw err;
    }
  }
};
