/**
 * Ravora Backend V1 — Rate Limiter
 * In-memory sliding window rate limiter (no Redis dependency).
 */

import { ApiError } from '../utils/ApiError.js';

const store = new Map();

// Cleanup stale entries every 60 seconds
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now - entry.windowStart > entry.windowMs * 2) {
      store.delete(key);
    }
  }
}, 60_000);

/**
 * Creates a rate limiting middleware.
 * @param {{ windowMs: number, max: number }} options
 */
export function rateLimiter({ windowMs = 60_000, max = 100 } = {}) {
  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();

    let entry = store.get(key);
    if (!entry || now - entry.windowStart > windowMs) {
      entry = { windowStart: now, count: 0, windowMs };
      store.set(key, entry);
    }

    entry.count++;

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - entry.count));
    res.setHeader('X-RateLimit-Reset', new Date(entry.windowStart + windowMs).toISOString());

    if (entry.count > max) {
      return next(ApiError.tooManyRequests('Rate limit exceeded. Try again later.'));
    }

    next();
  };
}
