import { logger } from '../utils/logger.js';

export const requestMetrics = {
  totalRequests: 0,
  errorRequests: 0,
  statusCodes: {},
  latencySum: 0,
  latencyCount: 0
};

/**
 * Logs every incoming request with method, path, status, and duration.
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  requestMetrics.totalRequests++;

  const originalEnd = res.end.bind(res);
  res.end = function (...args) {
    const duration = Date.now() - start;
    requestMetrics.latencySum += duration;
    requestMetrics.latencyCount++;

    const status = res.statusCode;
    requestMetrics.statusCodes[status] = (requestMetrics.statusCodes[status] || 0) + 1;
    if (status >= 400) {
      requestMetrics.errorRequests++;
    }

    const level = status >= 400 ? 'warn' : 'info';
    logger[level]('HTTP', `${req.method} ${req.originalUrl} ${status} ${duration}ms`, {
      method: req.method,
      path: req.originalUrl,
      status,
      duration,
      ip: req.ip,
    });
    originalEnd(...args);
  };

  next();
};
