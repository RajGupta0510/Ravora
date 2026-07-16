/**
 * Ravora Backend V1 — Settings Service
 */

import { SettingsRepository } from '../repositories/SettingsRepository.js';
import { AuditLogRepository } from '../repositories/AuditLogRepository.js';
import { ApiError } from '../utils/ApiError.js';

const settingsRepo = new SettingsRepository();
const auditRepo = new AuditLogRepository();

export const SettingsService = {
  async getSettings(userId) {
    const settings = await settingsRepo.findByUserId(userId);
    if (!settings) {
      // Create default settings
      return settingsRepo.create({
        user_id: userId,
        auto_hedge_enabled: true,
        notifications_enabled: true,
        execution_mode: 'advisory',
        theme: 'dark',
      });
    }
    return settings;
  },

  async updateSettings(userId, updates) {
    const allowed = ['auto_hedge_enabled', 'notifications_enabled', 'execution_mode', 'theme'];
    const filtered = {};
    for (const key of allowed) {
      if (updates[key] !== undefined) filtered[key] = updates[key];
    }

    if (Object.keys(filtered).length === 0) {
      throw ApiError.badRequest('No valid settings fields provided');
    }

    const settings = await settingsRepo.upsertForUser(userId, filtered);
    await auditRepo.log(userId, 'update_settings', 'user_settings', settings.id);
    return settings;
  },
};
