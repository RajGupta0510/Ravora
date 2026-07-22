import { BaseRepository } from './BaseRepository.js';

export class ExchangeResponseRepository extends BaseRepository {
  constructor() {
    super('exchange_responses');
  }

  async logResponse(userId, orderId, exchange, endpoint, requestPayload, responsePayload, statusCode = 200, latencyMs = 0) {
    return this.create({
      user_id: userId,
      order_id: orderId,
      exchange: exchange.toLowerCase(),
      endpoint,
      request_payload: requestPayload,
      response_payload: responsePayload,
      status_code: statusCode,
      latency_ms: latencyMs
    });
  }

  async findByOrderId(orderId) {
    const { data } = await this.findAll({ filters: { order_id: orderId } });
    return data || [];
  }
}
