import { ApiError } from '../utils/ApiError.js';
import { securityLog, clientIp } from '../../src/middleware/security.js';

/**
 * Admin access is granted only by the `role` claim in the Supabase user's app_metadata, which only the
 * service role can set (users can edit user_metadata, so that field is never trusted). The previous check
 * also admitted any address containing "admin" or ending in @example.com, which anyone could register.
 *
 * To make someone an admin: Supabase dashboard > Authentication > Users > raw app_meta_data: {"role":"admin"}.
 */
export const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  securityLog('admin_denied', { userId: req.user?.id, path: req.originalUrl, ip: clientIp(req) });
  return next(ApiError.forbidden('Access denied. Admin role required.'));
};
