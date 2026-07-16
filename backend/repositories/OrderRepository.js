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

  async markFilled(id, filledPrice, fee = 0) {
    return this.update(id, {
      status: 'filled',
      filled_price: filledPrice,
      fee,
      filled_at: new Date().toISOString(),
    });
  }

  async cancel(id) {
    return this.update(id, { status: 'cancelled' });
  }
}
