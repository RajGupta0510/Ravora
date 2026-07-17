/**
 * Ravora Backend V1 — Auth Service
 * Handles authentication operations via Supabase Auth.
 */

import { getSupabaseAdmin, isConfigured } from '../config/database.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { AuditLogRepository } from '../repositories/AuditLogRepository.js';
import { logger } from '../utils/logger.js';
import { ApiError } from '../utils/ApiError.js';

const userRepo = new UserRepository();
const auditRepo = new AuditLogRepository();

export const AuthService = {
  /**
   * Get the authenticated user's profile, creating one if it doesn't exist.
   */
  async getOrCreateProfile(userId, authUser) {
    let profile = await userRepo.findByUserId(userId);

    if (!profile) {
      profile = await userRepo.create({
        id: userId,
        email: authUser.email || null,
        phone: authUser.phone || null,
        full_name: authUser.user_metadata?.full_name || 'Ravora Member',
      });
      logger.info('AuthService', `Created profile for user ${userId}`);
    }

    return profile;
  },

  /**
   * Update last login timestamp.
   */
  async recordLogin(userId, ipAddress = null) {
    await userRepo.updateLastLogin(userId);
    await auditRepo.log(userId, 'login', 'auth', null, null, ipAddress);
  },

  /**
   * Get user by Supabase token (for middleware).
   */
  async getUserFromToken(token) {
    const isProduction = process.env.NODE_ENV === 'production';
    if (!isConfigured && !isProduction) {
      if (token.startsWith('mock_jwt_token_')) {
        const userId = token.replace('mock_jwt_token_', '');
        return { id: userId, email: `sandbox_${userId}@ravora.dev` };
      }
      return null;
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return null;
    return user;
  },
};
