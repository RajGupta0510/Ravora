import { getUser } from '../utils/supabase.js';
import { dbGet, dbRun } from '../database.js';
import crypto from 'crypto';

export const JWT_SECRET = process.env.JWT_SECRET || 'ravora_jwt_secret_key_2026';

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Access denied. Malformed token.' });
  }

  try {
    const { data: { user }, error } = await getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token.' });
    }

    // Ensure the user exists in SQLite local database
    let localUser = await dbGet('SELECT id FROM users WHERE id = ?', [user.id]);
    if (!localUser) {
      const email = user.email || null;
      const phone = user.phone || null;
      const fullName = user.user_metadata?.full_name || 'Ravora Member';

      // Insert user
      await dbRun(
        'INSERT OR IGNORE INTO users (id, email, mobile_number, full_name, password_hash) VALUES (?, ?, ?, ?, ?)',
        [user.id, email, phone, fullName, '']
      );
    }

    // Ensure the default portfolio record exists
    const localPortfolio = await dbGet('SELECT id FROM portfolios WHERE user_id = ?', [user.id]);
    if (!localPortfolio) {
      const portfolioId = crypto.randomUUID();
      await dbRun(
        'INSERT OR IGNORE INTO portfolios (id, user_id, current_balance, safety_score) VALUES (?, ?, 0.00, 100)',
        [portfolioId, user.id]
      );
    }

    // Ensure default user settings exist
    const localSettings = await dbGet('SELECT id FROM user_settings WHERE user_id = ?', [user.id]);
    if (!localSettings) {
      const settingsId = crypto.randomUUID();
      await dbRun(
        'INSERT OR IGNORE INTO user_settings (id, user_id, auto_hedge_enabled, notifications_enabled, execution_mode) VALUES (?, ?, 1, 1, \'advisory\')',
        [settingsId, user.id]
      );
    }

    req.user = { id: user.id, email: user.email || user.phone };
    next();
  } catch (err) {
    console.error('[verifyToken Error] Syncing user to SQLite:', err);
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};
