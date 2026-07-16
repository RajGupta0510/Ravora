/**
 * Ravora Backend V1 — Request Logger Middleware
 */

import { logger } from '../utils/logger.js';

/**
 * Logs every incoming request with method, path, status, and duration.
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Override res.end to capture the response
  const originalEnd = res.end.bind(res);
  res.end = function (...args) {
    const duration = Date.now() - start;
    const level = res.statusCode >= 400 ? 'warn' : 'info';
    logger[level]('HTTP', `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`, {
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      duration,
      ip: req.ip,
    });
    originalEnd(...args);
  };

  next();
};
