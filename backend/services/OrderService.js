/**
 * Ravora Backend V1 — Order Service
 */

import { OrderRepository } from '../repositories/OrderRepository.js';
import { AuditLogRepository } from '../repositories/AuditLogRepository.js';
import { ApiError } from '../utils/ApiError.js';

const orderRepo = new OrderRepository();
const auditRepo = new AuditLogRepository();

export const OrderService = {
  async getOrders(userId, options = {}) {
    return orderRepo.findByUserId(userId, options);
  },

  async getOrderById(userId, orderId) {
    const order = await orderRepo.findById(orderId);
    if (!order || order.user_id !== userId) throw ApiError.notFound('Order');
    return order;
  },

  async createOrder(userId, data) {
    const order = await orderRepo.create({
      user_id: userId,
      exchange: data.exchange,
      symbol: data.symbol,
      type: data.type,
      side: data.side,
      quantity: data.quantity,
      price: data.price || null,
      status: 'pending',
    });

    await auditRepo.log(userId, 'create_order', 'orders', order.id);
    return order;
  },

  async cancelOrder(userId, orderId) {
    const order = await this.getOrderById(userId, orderId);
    if (order.status !== 'pending') throw ApiError.badRequest('Only pending orders can be cancelled');

    const cancelled = await orderRepo.cancel(orderId);
    await auditRepo.log(userId, 'cancel_order', 'orders', orderId);
    return cancelled;
  },

  async getPendingOrders(userId) {
    return orderRepo.findPendingByUserId(userId);
  },
};
