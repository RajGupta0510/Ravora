import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { dbGet, dbRun } from '../database.js';
import { JWT_SECRET } from '../middleware/auth.js';

export const register = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    // Check if user exists
    const existingUser = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ error: 'A user with this email already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user ID
    const userId = crypto.randomUUID();

    // Insert user
    await dbRun(
      'INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)',
      [userId, email, passwordHash]
    );

    // Create default portfolio
    const portfolioId = crypto.randomUUID();
    await dbRun(
      'INSERT INTO portfolios (id, user_id, current_balance, safety_score) VALUES (?, ?, ?, ?)',
      [portfolioId, userId, 0.00, 100]
    );

    // Create default settings
    const settingsId = crypto.randomUUID();
    await dbRun(
      'INSERT INTO user_settings (id, user_id, auto_hedge_enabled, notifications_enabled, execution_mode) VALUES (?, ?, ?, ?, ?)',
      [settingsId, userId, 1, 1, 'advisory']
    );

    // Sign JWT
    const token = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({
      token,
      user: {
        id: userId,
        email,
        onboardingCompleted: false
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Internal server error during registration.' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    // Find user
    const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Check if onboarding completed
    const profile = await dbGet('SELECT * FROM user_profiles WHERE user_id = ?', [user.id]);
    const onboardingCompleted = !!profile;

    // Sign JWT
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        onboardingCompleted
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error during login.' });
  }
};
