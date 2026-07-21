import { ExchangeSyncService } from '../services/ExchangeSyncService.js';
import { getSupabaseAdmin } from '../config/database.js';

export const ExchangeController = {
  async connectExchange(req, res, next) {
    try {
      const { exchangeName, apiKey, apiSecret, passphrase } = req.body;
      const account = await ExchangeSyncService.connectExchange(
        req.user.id,
        exchangeName,
        apiKey,
        apiSecret,
        passphrase
      );
      return res.status(201).json({ success: true, data: account });
    } catch (err) { next(err); }
  },

  async disconnectExchange(req, res, next) {
    try {
      const { id } = req.params;
      const result = await ExchangeSyncService.disconnectExchange(req.user.id, id);
      return res.json({ success: true, data: result });
    } catch (err) { next(err); }
  },

  async listExchanges(req, res, next) {
    try {
      const list = await ExchangeSyncService.listConnectedExchanges(req.user.id);
      return res.json({ success: true, data: list });
    } catch (err) { next(err); }
  },

  async startManualSync(req, res, next) {
    try {
      const { id } = req.params;
      const result = await ExchangeSyncService.syncExchangeAccount(req.user.id, id);
      return res.json({ success: true, data: result });
    } catch (err) { next(err); }
  },

  async getSyncStatus(req, res, next) {
    try {
      const { id } = req.params;
      const status = await ExchangeSyncService.getSyncStatus(req.user.id, id);
      return res.json({ success: true, data: status });
    } catch (err) { next(err); }
  },

  async getSyncLogs(req, res, next) {
    try {
      const db = getSupabaseAdmin();
      const { data, error } = await db
        .from('exchange_sync_logs')
        .select('*')
        .eq('user_id', req.user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return res.json({ success: true, data: data || [] });
    } catch (err) { next(err); }
  }
};
