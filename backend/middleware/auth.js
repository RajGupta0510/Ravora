/**
 * Ravora Backend V1 — Authentication Middleware
 * Verifies JWT tokens via Supabase Auth.
 */

import { getSupabaseAdmin, isConfigured } from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

/**
 * Express middleware that verifies the Authorization Bearer token.
 * Attaches the authenticated user to req.user.
 */
export const authenticate = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return next(ApiError.unauthorized('Access denied. No token provided.'));
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return next(ApiError.unauthorized('Access denied. Malformed token.'));
  }

  try {
    if (!isConfigured) {
      // Sandbox mode — accept mock tokens
      if (token.startsWith('mock_jwt_token_')) {
        const userId = token.replace('mock_jwt_token_', '');
        req.user = { id: userId, email: `sandbox_${userId}@ravora.dev` };
        return next();
      }
      return next(ApiError.unauthorized('Invalid token in sandbox mode.'));
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return next(ApiError.unauthorized('Invalid or expired token.'));
    }

    req.user = {
      id: user.id,
      email: user.email || user.phone || null,
      role: user.role || 'authenticated',
    };

    next();
  } catch (err) {
    logger.error('Auth', 'Token verification failed', { error: err.message });
    return next(ApiError.unauthorized('Invalid or expired token.'));
  }
};

/**
 * Optional auth — attaches user if token present, otherwise continues.
 */
export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    req.user = null;
    return next();
  }
  return authenticate(req, res, next);
};
