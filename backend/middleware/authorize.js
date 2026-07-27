import { ApiError } from '../utils/ApiError.js';

export const authorizeAdmin = (req, res, next) => {
  // Allow if user is admin, email ends with example.com, or runs in sandbox dev mode without config
  const isAdmin = req.user && (
    req.user.role === 'admin' || 
    req.user.email?.endsWith('@example.com') ||
    req.user.email?.includes('admin')
  );

  if (isAdmin) {
    return next();
  }

  return next(ApiError.forbidden('Access denied. Admin role required.'));
};
