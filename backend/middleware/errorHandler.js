/**
 * Ravora Backend V1 — Centralized Error Handler
 */

import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { logger } from '../utils/logger.js';

/**
 * Express error-handling middleware.
 * Must be registered LAST after all routes.
 */
export const errorHandler = (err, req, res, _next) => {
  // Already an ApiError — use its properties directly
  if (err instanceof ApiError) {
    return ApiResponse.error(res, err.statusCode, err.message, err.code, err.details);
  }

  // Supabase-specific errors
  if (err.code && typeof err.code === 'string' && err.code.startsWith('PGRST')) {
    logger.error('Database', 'Supabase PostgREST error', { code: err.code, message: err.message });
    return ApiResponse.error(res, 400, 'Database query error', 'DATABASE_ERROR');
  }

  // Validation errors (from express-validator or similar)
  if (err.name === 'ValidationError') {
    return ApiResponse.error(res, 400, err.message, 'VALIDATION_ERROR', err.details || null);
  }

  // JSON parse errors
  if (err.type === 'entity.parse.failed') {
    return ApiResponse.error(res, 400, 'Invalid JSON in request body', 'PARSE_ERROR');
  }

  // Unknown errors — log and return generic response
  logger.error('ErrorHandler', 'Unhandled error', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  return ApiResponse.error(res, 500, 'An unexpected error occurred', 'INTERNAL_ERROR');
};
