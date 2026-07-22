import { ExecutionService } from '../services/ExecutionService.js';
import { RiskManager } from '../risk/RiskManager.js';
import { ApiError } from '../../utils/ApiError.js';

export const OrderController = {
  /**
   * Place a new order
   */
  async placeOrder(req, res, next) {
    try {
      const userId = req.user.id;
      const order = await ExecutionService.placeOrder(userId, req.body);
      return res.status(201).json({
        success: true,
        data: order
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Cancel an active order
   */
  async cancelOrder(req, res, next) {
    try {
      const userId = req.user.id;
      const orderId = req.params.id;
      const order = await ExecutionService.cancelOrder(userId, orderId);
      return res.json({
        success: true,
        data: order
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get specific order details
   */
  async getOrder(req, res, next) {
    try {
      const userId = req.user.id;
      const orderId = req.params.id;
      const order = await ExecutionService.getOrder(userId, orderId);
      return res.json({
        success: true,
        data: order
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get all active/open orders
   */
  async getOpenOrders(req, res, next) {
    try {
      const userId = req.user.id;
      const openOrders = await ExecutionService.getOpenOrders(userId);
      return res.json({
        success: true,
        data: openOrders
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get historical orders (completed, cancelled, failed)
   */
  async getOrderHistory(req, res, next) {
    try {
      const userId = req.user.id;
      const { limit, offset, side, symbol, status } = req.query;

      const filters = {};
      if (side) filters.side = side;
      if (symbol) filters.symbol = symbol.toUpperCase();
      if (status) filters.status = status;

      const options = {
        filters,
        limit: limit ? parseInt(limit, 10) : 25,
        offset: offset ? parseInt(offset, 10) : 0
      };

      const { data: orders, count } = await ExecutionService.getOrderHistory(userId, options);
      return res.json({
        success: true,
        data: orders,
        count
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get trade executions history (fills)
   */
  async getExecutions(req, res, next) {
    try {
      const userId = req.user.id;
      const { limit, offset } = req.query;

      const options = {
        limit: limit ? parseInt(limit, 10) : 25,
        offset: offset ? parseInt(offset, 10) : 0
      };

      const { data: executions, count } = await ExecutionService.getExecutions(userId, options);
      return res.json({
        success: true,
        data: executions,
        count
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Toggle global emergency trading halt (Admin action)
   */
  async toggleEmergencyHalt(req, res, next) {
    try {
      const { status } = req.body;
      if (status === undefined) throw ApiError.badRequest('status is required (true/false)');
      
      RiskManager.setEmergencyHalt(status);
      return res.json({
        success: true,
        data: {
          halted: RiskManager.isHalted()
        }
      });
    } catch (err) {
      next(err);
    }
  }
};
