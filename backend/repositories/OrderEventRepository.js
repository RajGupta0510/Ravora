import { BaseRepository } from './BaseRepository.js';

export class OrderEventRepository extends BaseRepository {
  constructor() {
    super('order_events');
  }

  async findByOrderId(orderId) {
    const { data } = await this.findAll({
      filters: { order_id: orderId },
      sortBy: 'created_at',
      sortOrder: 'asc'
    });
    return data || [];
  }

  async logEvent(orderId, eventType, previousStatus, newStatus, message = null) {
    return this.create({
      order_id: orderId,
      event_type: eventType,
      previous_status: previousStatus,
      new_status: newStatus,
      message
    });
  }
}
