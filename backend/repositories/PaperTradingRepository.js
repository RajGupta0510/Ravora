import { BaseRepository } from './BaseRepository.js';

export class PaperTradingRepository extends BaseRepository {
  constructor() { 
    super('paper_accounts'); 
  }

  async findAccountByUserId(userId) {
    return this.findOne({ user_id: userId });
  }

  async getOrCreateAccount(userId) {
    let account = await this.findAccountByUserId(userId);
    if (!account) {
      account = await this.create({
        user_id: userId,
        balance: 100000.00,
        initial_balance: 100000.00,
        currency: 'USD',
      });
    }
    return account;
  }

  async getOpenPositions(accountId) {
    const { data, error } = await this.db
      .from('paper_positions')
      .select('*')
      .eq('paper_account_id', accountId)
      .eq('status', 'open')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async getClosedPositions(accountId, limit = 50) {
    const { data, error } = await this.db
      .from('paper_positions')
      .select('*')
      .eq('paper_account_id', accountId)
      .eq('status', 'closed')
      .order('closed_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  }

  async createPosition(positionData) {
    const { data, error } = await this.db
      .from('paper_positions')
      .insert(positionData)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async closePosition(positionId, exitPrice, pnl, reviewJson = null) {
    const updatePayload = {
      status: 'closed',
      exit_price: exitPrice,
      pnl,
      closed_at: new Date().toISOString()
    };

    if (reviewJson) {
      updatePayload.review_json = reviewJson;
    }

    try {
      const { data, error } = await this.db
        .from('paper_positions')
        .update(updatePayload)
        .eq('id', positionId)
        .select()
        .single();

      if (error) {
        if (error.message.includes('review_json') || error.message.includes('column')) {
          console.warn('[PaperTrading] review_json column is missing in Supabase schema. Retrying close without it.');
          delete updatePayload.review_json;

          const { data: retried, error: retryError } = await this.db
            .from('paper_positions')
            .update(updatePayload)
            .eq('id', positionId)
            .select()
            .single();

          if (retryError) throw retryError;
          return { ...retried, review_json: reviewJson };
        }
        throw error;
      }
      return data;
    } catch (err) {
      console.warn('[PaperTrading] Failed to close position with review_json, retrying close without it.', { error: err.message });
      delete updatePayload.review_json;

      const { data: retried, error: retryError } = await this.db
        .from('paper_positions')
        .update(updatePayload)
        .eq('id', positionId)
        .select()
        .single();

      if (retryError) throw retryError;
      return { ...retried, review_json: reviewJson };
    }
  }

  async updateAccountBalance(accountId, newBalance) {
    return this.update(accountId, { balance: newBalance });
  }

  // --- PAPER ORDERS MANAGER ---

  async createOrder(orderData) {
    const { data, error } = await this.db
      .from('paper_orders')
      .insert(orderData)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateOrderStatus(orderId, status, filledPrice = null, filledAt = null) {
    const { data, error } = await this.db
      .from('paper_orders')
      .update({
        status,
        filled_price: filledPrice,
        filled_at: filledAt
      })
      .eq('id', orderId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async getPendingOrders() {
    const { data, error } = await this.db
      .from('paper_orders')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  async getPendingOrdersByAccountId(accountId) {
    const { data, error } = await this.db
      .from('paper_orders')
      .select('*')
      .eq('paper_account_id', accountId)
      .eq('status', 'pending')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  async clearAccountData(accountId) {
    await this.db.from('paper_positions').delete().eq('paper_account_id', accountId);
    await this.db.from('paper_orders').delete().eq('paper_account_id', accountId);
  }
}
export default PaperTradingRepository;
