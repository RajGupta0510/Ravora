/**
 * Ravora Backend V1 — Settings Controller
 */

import { SettingsService } from '../services/SettingsService.js';

export const SettingsController = {
  async getSettings(req, res, next) {
    try {
      const settings = await SettingsService.getSettings(req.user.id);
      return res.json({
        autoHedgeEnabled: settings ? !!settings.auto_hedge_enabled : true,
        notificationsEnabled: settings ? !!settings.notifications_enabled : true,
        executionMode: settings ? settings.execution_mode : 'advisory'
      });
    } catch (err) { next(err); }
  },

  async updateSettings(req, res, next) {
    try {
      const { executionMode, autoHedgeEnabled, notificationsEnabled } = req.body;
      const updates = {};
      if (executionMode !== undefined) updates.execution_mode = executionMode;
      if (autoHedgeEnabled !== undefined) updates.auto_hedge_enabled = autoHedgeEnabled;
      if (notificationsEnabled !== undefined) updates.notifications_enabled = notificationsEnabled;

      await SettingsService.updateSettings(req.user.id, updates);
      return res.json({ success: true, message: 'Settings updated successfully.' });
    } catch (err) { next(err); }
  },
};
