import { BaseRepository } from './BaseRepository.js';

export class OrderRepository extends BaseRepository {
  constructor() { super('orders'); }

  async findByUserId(userId, options = {}) {
    return this.findAll({ filters: { user_id: userId, ...options }, sortBy: 'created_at', sortOrder: 'desc' });
  }

  async findPendingByUserId(userId) {
    const { data } = await this.findAll({ filters: { user_id: userId, status: 'pending' } });
    return data;
  }

  async findByClientId(userId, clientOrderId) {
    return this.findOne({ user_id: userId, client_order_id: clientOrderId });
  }

  async findOpenOrdersByUserId(userId) {
    const { data } = await this.db
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .in('status', ['pending', 'submitted', 'accepted', 'partially_filled'])
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    return data || [];
  }

  async updateStatus(id, status, errorMsg = null, updates = {}) {
    const payload = {
      status,
      error_message: errorMsg,
      updated_at: new Date().toISOString(),
      ...updates
    };

    if (status === 'filled') {
      payload.filled_at = new Date().toISOString();
    }

    return this.update(id, payload);
  }

  async markFilled(id, filledPrice, fee = 0) {
    return this.updateStatus(id, 'filled', null, {
      filled_price: filledPrice,
      fee
    });
  }

  async cancel(id) {
    return this.updateStatus(id, 'cancelled');
  }
}
