/**
 * Exchange Sync Service — Ravora Exchange Sync Engine V1
 * Handles API key encryption, credential validation, multi-asset synchronization (balances, positions, orders, trade history),
 * deduplication, WebSocket progress broadcasting, and Portfolio Intelligence recalculations.
 */

import { getSupabaseAdmin } from '../config/database.js';
import { encrypt, decrypt } from '../utils/encryption.js';
import { ExchangeFactory } from '../exchange/ExchangeFactory.js';
import { PortfolioIntelligenceService } from './PortfolioIntelligenceService.js';
import { MarketDataService } from './MarketDataService.js';
import { sendToUser } from '../websocket/WebSocketServer.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

export const ExchangeSyncService = {
  /**
   * Connects a new exchange account for a user, validates keys, encrypts credentials, and initiates initial sync.
   */
  async connectExchange(userId, exchangeName, apiKey, apiSecret, passphrase = null) {
    const db = getSupabaseAdmin();

    // 1. Verify exchange is supported
    const supported = ExchangeFactory.getSupportedExchanges();
    if (!supported.includes(exchangeName.toLowerCase())) {
      throw ApiError.badRequest(`Unsupported exchange: ${exchangeName}. Supported: ${supported.join(', ')}`);
    }

    // 2. Validate credentials with the exchange provider
    const provider = ExchangeFactory.create(exchangeName, { apiKey, apiSecret, passphrase });
    const validation = await provider.validateCredentials();
    if (!validation.valid) {
      throw ApiError.badRequest(`Invalid exchange credentials: ${validation.error}`);
    }

    // 3. Encrypt credentials for secure storage at rest
    const apiKeyEncrypted = encrypt(apiKey);
    const apiSecretEncrypted = encrypt(apiSecret);
    const passphraseEncrypted = passphrase ? encrypt(passphrase) : null;
    const permissions = validation.permissions || { read: true, trade: true, withdraw: false };

    // 4. Save to database
    const { data: account, error } = await db
      .from('connected_exchanges')
      .upsert({
        user_id: userId,
        exchange_name: exchangeName.toLowerCase(),
        api_key_encrypted: apiKeyEncrypted,
        api_secret_encrypted: apiSecretEncrypted,
        api_passphrase_encrypted: passphraseEncrypted,
        permissions: permissions,
        status: 'active',
        error_count: 0,
        last_error_message: null,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,exchange_name' })
      .select()
      .single();

    if (error) {
      logger.error('ExchangeSync', 'Failed to save connected exchange', { error: error.message });
      throw error;
    }

    // 5. Trigger initial full sync in the background
    this.syncExchangeAccount(userId, account.id).catch(err => {
      logger.error('ExchangeSync', 'Background initial sync failed after connection', { error: err.message });
    });

    return {
      id: account.id,
      exchangeName: account.exchange_name,
      status: account.status,
      permissions: account.permissions,
      lastSyncAt: account.updated_at
    };
  },

  /**
   * Disconnects an exchange account and removes all synced records (assets, positions, orders, history).
   */
  async disconnectExchange(userId, accountId) {
    const db = getSupabaseAdmin();

    // 1. Verify account exists
    const { data: account } = await db
      .from('connected_exchanges')
      .select('id, exchange_name')
      .eq('id', accountId)
      .eq('user_id', userId)
      .maybeSingle();

    if (!account) {
      throw ApiError.notFound('Exchange account not found');
    }

    // 2. Remove exchange credentials
    const { error: deleteErr } = await db
      .from('connected_exchanges')
      .delete()
      .eq('id', accountId)
      .eq('user_id', userId);

    if (deleteErr) throw deleteErr;

    // 3. Clean up all holdings and records associated with this exchange account
    await Promise.all([
      db.from('portfolio_assets').delete().eq('exchange_account_id', accountId),
      db.from('positions').delete().eq('exchange_account_id', accountId),
      db.from('orders').delete().eq('exchange_account_id', accountId),
      db.from('trade_history').delete().eq('exchange_account_id', accountId)
    ]);

    // 4. Trigger portfolio recalculation
    try {
      const summary = await PortfolioIntelligenceService.calculatePerformanceSummary(userId);
      const { data: portfolio } = await db
        .from('portfolios')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (portfolio) {
        await db.from('portfolios').update({ current_balance: summary.currentValue }).eq('id', portfolio.id);
      }

      // Notify frontend of disconnection & updated portfolio
      sendToUser(userId, 'connection_status', { accountId, exchangeName: account.exchange_name, status: 'disconnected' });
      sendToUser(userId, 'portfolio_updated', summary);
    } catch (err) {
      logger.warn('ExchangeSync', 'Failed to recalculate portfolio after disconnect', { error: err.message });
    }

    return { success: true, message: `Exchange ${account.exchange_name} disconnected successfully` };
  },

  /**
   * Lists all connected exchanges for a user (without exposing encrypted keys)
   */
  async listConnectedExchanges(userId) {
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from('connected_exchanges')
      .select('id, exchange_name, status, permissions, last_sync_at, error_count, created_at, updated_at')
      .eq('user_id', userId);

    if (error) throw error;

    return (data || []).map(row => ({
      id: row.id,
      exchangeName: row.exchange_name,
      status: row.status,
      permissions: row.permissions,
      lastSyncAt: row.last_sync_at || row.updated_at,
      errorCount: row.error_count || 0
    }));
  },

  /**
   * Main Sync Pipeline — Synchronizes wallet balances, spot assets, open positions, open orders, and completed trades.
   */
  async syncExchangeAccount(userId, accountId) {
    const db = getSupabaseAdmin();
    
    // 1. Create a sync log record
    const { data: log } = await db
      .from('exchange_sync_logs')
      .insert({
        user_id: userId,
        exchange_account_id: accountId,
        sync_status: 'in_progress',
        payload: { stage: 'started', timestamp: new Date().toISOString() }
      })
      .select()
      .single();

    sendToUser(userId, 'sync_progress', { accountId, stage: 'starting', percent: 10 });

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

      // 3. Decrypt credentials
      const apiKey = decrypt(account.api_key_encrypted);
      const apiSecret = decrypt(account.api_secret_encrypted);
      const passphrase = account.api_passphrase_encrypted ? decrypt(account.api_passphrase_encrypted) : null;

      // 4. Instantiate provider
      const provider = ExchangeFactory.create(account.exchange_name, { apiKey, apiSecret, passphrase });

      // ----------------------------------------------------
      // PHASE 1: Spot Assets & Wallet Balances Synchronization
      // ----------------------------------------------------
      sendToUser(userId, 'sync_progress', { accountId, stage: 'syncing_balances', percent: 25 });
      const balances = await provider.getBalance();

      const { data: portfolio } = await db
        .from('portfolios')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (!portfolio) {
        throw new Error('User portfolio record does not exist');
      }

      // Remove previous balances for this exchange account
      await db.from('portfolio_assets').delete().eq('exchange_account_id', accountId);

      const overview = await MarketDataService.getOverview();
      const prices = { USDC: 1.00, USDS: 1.00, USDT: 1.00, USD: 1.00 };
      overview.forEach(o => { prices[o.symbol] = o.price; });

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
          allocation_pct: 0.0,
          balance_amount: totalAmount,
          average_entry_price: livePrice,
          position_type: 'long',
          leverage: 1.0
        });
      }

      if (assetInserts.length > 0) {
        assetInserts.forEach(ai => {
          ai.allocation_pct = totalVal > 0 ? (ai.balance_amount * ai.average_entry_price / totalVal) * 100 : 0.0;
        });
        const { error: insErr } = await db.from('portfolio_assets').insert(assetInserts);
        if (insErr) throw insErr;
      }

      sendToUser(userId, 'balance_updated', { accountId, assetsCount: assetInserts.length });

      // ----------------------------------------------------
      // PHASE 2: Open Positions (Margin / Futures) Synchronization
      // ----------------------------------------------------
      sendToUser(userId, 'sync_progress', { accountId, stage: 'syncing_positions', percent: 50 });
      let positionsSyncedCount = 0;
      try {
        const rawPositions = await provider.getPositions();
        await db.from('positions').delete().eq('exchange_account_id', accountId);

        if (rawPositions && rawPositions.length > 0) {
          const positionInserts = rawPositions.map(pos => ({
            user_id: userId,
            exchange_account_id: accountId,
            exchange: account.exchange_name,
            symbol: pos.symbol,
            side: pos.side,
            entry_price: pos.entryPrice,
            current_price: pos.currentPrice || pos.entryPrice,
            quantity: pos.quantity,
            leverage: pos.leverage || 1.0,
            margin_used: pos.marginUsed || 0,
            unrealized_pnl: pos.unrealizedPnl || 0,
            status: pos.status || 'open'
          }));

          await db.from('positions').insert(positionInserts);
          positionsSyncedCount = positionInserts.length;
        }
        sendToUser(userId, 'position_updated', { accountId, positionsCount: positionsSyncedCount });
      } catch (posErr) {
        logger.warn('ExchangeSync', `Positions sync warning for ${account.exchange_name}`, { error: posErr.message });
      }

      // ----------------------------------------------------
      // PHASE 3: Open Orders Synchronization
      // ----------------------------------------------------
      sendToUser(userId, 'sync_progress', { accountId, stage: 'syncing_orders', percent: 70 });
      let ordersSyncedCount = 0;
      try {
        const rawOrders = await provider.getOpenOrders();
        await db.from('orders').delete().eq('exchange_account_id', accountId);

        if (rawOrders && rawOrders.length > 0) {
          const orderInserts = rawOrders.map(ord => ({
            user_id: userId,
            exchange_account_id: accountId,
            exchange: account.exchange_name,
            exchange_order_id: ord.exchangeOrderId,
            symbol: ord.symbol,
            type: ord.type,
            side: ord.side,
            quantity: ord.quantity,
            price: ord.price,
            status: ord.status || 'pending',
            created_at: ord.createdAt || new Date().toISOString()
          }));

          await db.from('orders').insert(orderInserts);
          ordersSyncedCount = orderInserts.length;
        }
      } catch (ordErr) {
        logger.warn('ExchangeSync', `Orders sync warning for ${account.exchange_name}`, { error: ordErr.message });
      }

      // ----------------------------------------------------
      // PHASE 4: Completed Trade History Synchronization (Incremental / Deduplicated)
      // ----------------------------------------------------
      sendToUser(userId, 'sync_progress', { accountId, stage: 'syncing_history', percent: 85 });
      let tradesSyncedCount = 0;
      try {
        const rawTrades = await provider.getTradeHistory();
        if (rawTrades && rawTrades.length > 0) {
          // Fetch existing trade records for this account to avoid duplicates
          const { data: existingTrades } = await db
            .from('trade_history')
            .select('symbol, opened_at, closed_at')
            .eq('user_id', userId);

          const existingKeys = new Set(
            (existingTrades || []).map(t => `${t.symbol}_${new Date(t.opened_at).getTime()}`)
          );

          const tradeInserts = [];
          for (const tr of rawTrades) {
            const key = `${tr.symbol}_${new Date(tr.openedAt).getTime()}`;
            if (!existingKeys.has(key)) {
              tradeInserts.push({
                user_id: userId,
                exchange_account_id: accountId,
                exchange: account.exchange_name,
                symbol: tr.symbol,
                side: tr.side,
                entry_price: tr.entryPrice,
                exit_price: tr.exitPrice,
                quantity: tr.quantity,
                leverage: tr.leverage || 1.0,
                pnl: tr.pnl || 0,
                fee: tr.fee || 0,
                opened_at: tr.openedAt || new Date().toISOString(),
                closed_at: tr.closedAt || new Date().toISOString()
              });
            }
          }

          if (tradeInserts.length > 0) {
            await db.from('trade_history').insert(tradeInserts);
            tradesSyncedCount = tradeInserts.length;
          }
        }
      } catch (trErr) {
        logger.warn('ExchangeSync', `Trade history sync warning for ${account.exchange_name}`, { error: trErr.message });
      }

      // ----------------------------------------------------
      // PHASE 5: Portfolio Intelligence Recalculation & Snapshots
      // ----------------------------------------------------
      sendToUser(userId, 'sync_progress', { accountId, stage: 'recalculating_portfolio', percent: 95 });
      const summary = await PortfolioIntelligenceService.calculatePerformanceSummary(userId);

      await db
        .from('portfolios')
        .update({
          current_balance: summary.currentValue,
          updated_at: new Date().toISOString()
        })
        .eq('id', portfolio.id);

      // Update exchange account sync status
      const nowIso = new Date().toISOString();
      await db
        .from('connected_exchanges')
        .update({
          last_sync_at: nowIso,
          updated_at: nowIso,
          error_count: 0,
          last_error_message: null,
          status: 'active'
        })
        .eq('id', accountId);

      // Complete sync log
      const syncResultPayload = {
        assets_imported: assetInserts.length,
        positions_imported: positionsSyncedCount,
        orders_imported: ordersSyncedCount,
        trades_imported: tradesSyncedCount,
        total_valuation: totalVal
      };

      if (log) {
        await db
          .from('exchange_sync_logs')
          .update({
            sync_status: 'success',
            payload: syncResultPayload
          })
          .eq('id', log.id);
      }

      // Real-time WebSocket Notifications
      sendToUser(userId, 'sync_progress', { accountId, stage: 'completed', percent: 100, result: syncResultPayload });
      sendToUser(userId, 'portfolio_updated', summary);
      sendToUser(userId, 'connection_status', { accountId, status: 'active', lastSyncAt: nowIso });

      logger.info('ExchangeSync', `Successfully synced ${account.exchange_name} for user ${userId}`, syncResultPayload);
      return { success: true, ...syncResultPayload };

    } catch (err) {
      logger.error('ExchangeSync', `Failed to sync exchange account ${accountId} for user ${userId}`, { error: err.message });
      
      // Handle retry count increment in DB
      try {
        const { data: acc } = await db.from('connected_exchanges').select('error_count').eq('id', accountId).maybeSingle();
        const nextErrorCount = ((acc?.error_count) || 0) + 1;
        const nextStatus = nextErrorCount >= 5 ? 'inactive' : 'active';

        await db
          .from('connected_exchanges')
          .update({
            error_count: nextErrorCount,
            last_error_message: err.message,
            status: nextStatus
          })
          .eq('id', accountId);
      } catch (dbErr) {
        logger.warn('ExchangeSync', 'Failed to update error count in database', { error: dbErr.message });
      }

      if (log) {
        await db
          .from('exchange_sync_logs')
          .update({
            sync_status: 'failed',
            error_message: err.message
          })
          .eq('id', log.id);
      }

      sendToUser(userId, 'sync_progress', { accountId, stage: 'failed', percent: 100, error: err.message });
      throw err;
    }
  },

  /**
   * Retrieves current sync status and latest logs for an account
   */
  async getSyncStatus(userId, accountId) {
    const db = getSupabaseAdmin();

    const { data: account, error: accErr } = await db
      .from('connected_exchanges')
      .select('id, exchange_name, status, last_sync_at, error_count, last_error_message')
      .eq('id', accountId)
      .eq('user_id', userId)
      .maybeSingle();

    if (accErr || !account) {
      throw ApiError.notFound('Exchange account not found');
    }

    const { data: latestLog } = await db
      .from('exchange_sync_logs')
      .select('*')
      .eq('exchange_account_id', accountId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return {
      accountId: account.id,
      exchangeName: account.exchange_name,
      status: account.status,
      lastSyncAt: account.last_sync_at,
      errorCount: account.error_count,
      lastErrorMessage: account.last_error_message,
      latestSync: latestLog ? {
        id: latestLog.id,
        syncStatus: latestLog.sync_status,
        payload: latestLog.payload,
        errorMessage: latestLog.error_message,
        createdAt: latestLog.created_at
      } : null
    };
  }
};
