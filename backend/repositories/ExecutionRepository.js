import { BaseRepository } from './BaseRepository.js';

export class ExecutionRepository extends BaseRepository {
  constructor() {
    super('executions');
  }

  async findByOrderId(orderId) {
    const { data } = await this.findAll({ filters: { order_id: orderId } });
    return data || [];
  }

  async findByUserId(userId, options = {}) {
    return this.findAll({
      filters: { user_id: userId },
      sortBy: 'created_at',
      sortOrder: 'desc',
      ...options
    });
  }
}
