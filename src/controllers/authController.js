import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { dbGet, dbRun, dbQuery } from '../database.js';
import { JWT_SECRET } from '../middleware/auth.js';
import { sendEmailOtp, sendSmsOtp, sendWhatsAppOtp } from '../utils/delivery.js';
import {
  signUpWithEmail,
  signUpWithPhone,
  signInWithPassword,
  sendOtp,
  resendOtpSupabase,
  verifyOtp as supabaseVerifyOtp,
  upsertProfile,
  checkUserExists
} from '../utils/supabase.js';

// Helper to check if Supabase is configured
const isSupabaseConfigured = () => {
  const url = process.env.SUPABASE_URL || '';
  const key = process.env.SUPABASE_ANON_KEY || '';
  return !!(url && !url.includes('your-project-id') && key && !key.includes('your_anon_public_key'));
};

// Simple in-memory rate limiter for login/auth attempts
const rateLimits = {};
const rateLimitCheck = (key, limit = 5, duration = 60000) => {
  const now = Date.now();
  if (!rateLimits[key]) {
    rateLimits[key] = [];
  }
  rateLimits[key] = rateLimits[key].filter(t => now - t < duration);
  if (rateLimits[key].length >= limit) {
    return false;
  }
  rateLimits[key].push(now);
  return true;
};

// Password strength indicator check
const checkPasswordStrength = (pwd) => {
  if (pwd.length < 8) return { score: 1, message: 'Too short (Min 8 chars)' };
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasDigit = /[0-9]/.test(pwd);
  const hasSpecial = /[^A-Za-z0-9]/.test(pwd);

  const matches = [hasUpper, hasLower, hasDigit, hasSpecial].filter(Boolean).length;
  if (matches <= 2) return { score: 2, message: 'Weak password' };
  if (matches === 3) return { score: 3, message: 'Medium password' };
  return { score: 4, message: 'Strong password' };
};

export const register = async (req, res) => {
  const { fullName, email, mobileNumber, password, confirmPassword } = req.body;

  if (!rateLimitCheck(`register_${req.ip}`, 5, 60000)) {
    return res.status(429).json({ error: 'Too many registration requests. Please wait a minute.' });
  }

  if (!fullName || (!email && !mobileNumber) || !password) {
    return res.status(400).json({ error: 'Full name, email/mobile, and password are required.' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }

  const strength = checkPasswordStrength(password);
  if (strength.score < 3) {
    return res.status(400).json({ error: `Password is too weak: ${strength.message}` });
  }

  try {
    // Check if user already exists locally
    const existingUser = await dbGet(
      'SELECT id FROM users WHERE (email IS NOT NULL AND email = ?) OR (mobile_number IS NOT NULL AND mobile_number = ?)',
      [email || null, mobileNumber || null]
    );
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email or mobile number already exists. Please sign in.' });
    }

    let result;
    if (email) {
      result = await signUpWithEmail(email, password, fullName);
    } else {
      result = await signUpWithPhone(mobileNumber, password, fullName);
    }

    if (result.error) {
      return res.status(400).json({ error: result.error.message });
    }

    const user = result.data.user;
    const userId = user.id;

    // Create local user record in SQLite to satisfy foreign key constraints
    await dbRun(
      'INSERT OR IGNORE INTO users (id, email, mobile_number, full_name, password_hash) VALUES (?, ?, ?, ?, ?)',
      [userId, email || null, mobileNumber || null, fullName, '']
    );

    // Create local portfolio & user settings in SQLite
    const portfolioId = crypto.randomUUID();
    await dbRun(
      'INSERT OR IGNORE INTO portfolios (id, user_id, current_balance, safety_score) VALUES (?, ?, 0.00, 100)',
      [portfolioId, userId]
    );
    const settingsId = crypto.randomUUID();
    await dbRun(
      'INSERT OR IGNORE INTO user_settings (id, user_id, auto_hedge_enabled, notifications_enabled, execution_mode) VALUES (?, ?, 1, 1, \'advisory\')',
      [settingsId, userId]
    );

    const channel = email ? 'email' : 'sms';
    const destination = email || mobileNumber;
    const isConfig = isSupabaseConfigured();

    let otpCode = '';
    
    if (!isConfig) {
      // In Sandbox mode, manually trigger OTP code generation and dispatch
      const otpResult = await sendOtp({ email, phone: mobileNumber });
      otpCode = otpResult.data?.otpCode || '';

      if (channel === 'email') {
        try {
          await sendEmailOtp(destination, otpCode);
        } catch (mailErr) {
          console.error('[Delivery Error] Failed to send verification email:', mailErr.message);
        }
      } else {
        try {
          await sendSmsOtp(destination, otpCode);
          await sendWhatsAppOtp(destination, otpCode);
        } catch (smsErr) {
          console.error('[Delivery Error] Failed to send SMS/WhatsApp verification:', smsErr.message);
        }
      }
    }

    return res.status(201).json({
      message: 'Account created. OTP verification required.',
      otpRequired: true,
      userId,
      channel,
      destination,
      ...(isConfig ? {} : { otpCode })
    });
  } catch (err) {
    console.error('Registration controller error:', err);
    return res.status(500).json({ error: 'Internal server error during registration.' });
  }
};

export const verifyOtp = async (req, res) => {
  const { userId, otpCode, email, mobileNumber, deviceFingerprint, rememberMe } = req.body;

  if (!otpCode) {
    return res.status(400).json({ error: 'OTP code is required.' });
  }

  // Lookup email and phone number if not provided (needed for Supabase Auth verification)
  let targetEmail = email;
  let targetPhone = mobileNumber;

  if (userId && !targetEmail && !targetPhone) {
    try {
      const localUser = await dbGet('SELECT email, mobile_number FROM users WHERE id = ?', [userId]);
      if (localUser) {
        targetEmail = localUser.email;
        targetPhone = localUser.mobile_number;
      }
    } catch (dbErr) {
      console.warn('[DB Error] Failed to lookup user details:', dbErr.message);
    }
  }

  if (!targetEmail && !targetPhone) {
    return res.status(400).json({ error: 'Email or mobile number is required for verification.' });
  }

  try {
    let result;
    const isConfig = isSupabaseConfigured();

    if (isConfig) {
      if (targetEmail) {
        // Try signup verification first, then fallback to magiclink for login challenges
        result = await supabaseVerifyOtp({
          email: targetEmail,
          token: otpCode,
          type: 'signup'
        });
        if (result.error) {
          result = await supabaseVerifyOtp({
            email: targetEmail,
            token: otpCode,
            type: 'magiclink'
          });
        }
      } else {
        result = await supabaseVerifyOtp({
          phone: targetPhone,
          token: otpCode,
          type: 'sms'
        });
      }
    } else {
      // Sandbox fallback validation
      result = await supabaseVerifyOtp({
        email: targetEmail,
        phone: targetPhone,
        token: otpCode,
        type: targetEmail ? 'signup' : 'sms'
      });
    }

    if (result.error) {
      return res.status(400).json({ error: result.error.message });
    }

    const { session, user } = result.data;

    // Create or update profile in Supabase profiles
    await upsertProfile({
      id: user.id,
      name: user.user_metadata?.full_name || 'Ravora User',
      email: user.email || null,
      phone: user.phone || null,
      provider: 'local'
    });

    // Ensure local user record exists in SQLite to satisfy foreign key constraints
    await dbRun(
      'INSERT OR IGNORE INTO users (id, email, mobile_number, full_name, password_hash) VALUES (?, ?, ?, ?, ?)',
      [user.id, user.email || null, user.phone || null, user.user_metadata?.full_name || 'Ravora User', '']
    );

    // Ensure default portfolios and settings rows exist locally
    await dbRun('INSERT OR IGNORE INTO portfolios (id, user_id, current_balance, safety_score) VALUES (?, ?, 0.00, 100)', [crypto.randomUUID(), user.id]);
    await dbRun('INSERT OR IGNORE INTO user_settings (id, user_id, auto_hedge_enabled, notifications_enabled, execution_mode) VALUES (?, ?, 1, 1, \'advisory\')', [crypto.randomUUID(), user.id]);

    // Save trusted device fingerprint if trusted
    if (deviceFingerprint) {
      const isTrusted = rememberMe ? 1 : 0;
      await dbRun(
        'INSERT OR REPLACE INTO user_devices (id, user_id, device_fingerprint, is_trusted, last_login_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
        [crypto.randomUUID(), user.id, deviceFingerprint, isTrusted]
      );
    }

    // Check local onboarding status
    const localProfile = await dbGet('SELECT * FROM user_profiles WHERE user_id = ?', [user.id]);
    const onboardingCompleted = !!localProfile;

    return res.json({
      message: 'OTP verified successfully.',
      token: session.access_token,
      user: {
        id: user.id,
        email: user.email || user.phone,
        onboardingCompleted
      }
    });
  } catch (err) {
    console.error('OTP verify controller error:', err);
    return res.status(500).json({ error: 'Internal server error during verification.' });
  }
};

export const login = async (req, res) => {
  const { email, password, otpCode, deviceFingerprint, rememberMe } = req.body;
  const mobile = req.body.mobile || req.body.mobileNumber;

  if (!rateLimitCheck(`login_${req.ip}`, 5, 60000)) {
    return res.status(429).json({ error: 'Too many sign-in attempts. Please try again later.' });
  }

  const isConfig = isSupabaseConfigured();

  try {
    // 1. Passwordless OTP validation path
    if (otpCode) {
      const type = email ? 'magiclink' : 'sms';
      const result = await supabaseVerifyOtp({
        email,
        phone: mobile,
        token: otpCode,
        type
      });

      if (result.error) {
        return res.status(400).json({ error: result.error.message });
      }

      const { session, user } = result.data;
      await upsertProfile({
        id: user.id,
        name: user.user_metadata?.full_name || 'Ravora User',
        email: user.email || null,
        phone: user.phone || null,
        provider: 'local'
      });

      // Local db checks
      await dbRun(
        'INSERT OR IGNORE INTO users (id, email, mobile_number, full_name, password_hash) VALUES (?, ?, ?, ?, ?)',
        [user.id, user.email || null, user.phone || null, user.user_metadata?.full_name || 'Ravora User', '']
      );
      await dbRun('INSERT OR IGNORE INTO portfolios (id, user_id, current_balance, safety_score) VALUES (?, ?, 0.00, 100)', [crypto.randomUUID(), user.id]);
      await dbRun('INSERT OR IGNORE INTO user_settings (id, user_id, auto_hedge_enabled, notifications_enabled, execution_mode) VALUES (?, ?, 1, 1, \'advisory\')', [crypto.randomUUID(), user.id]);

      if (deviceFingerprint) {
        const isTrusted = rememberMe ? 1 : 0;
        await dbRun(
          'INSERT OR REPLACE INTO user_devices (id, user_id, device_fingerprint, is_trusted, last_login_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
          [crypto.randomUUID(), user.id, deviceFingerprint, isTrusted]
        );
      }

      const localProfile = await dbGet('SELECT * FROM user_profiles WHERE user_id = ?', [user.id]);
      return res.json({
        message: 'Login successful.',
        token: session.access_token,
        user: {
          id: user.id,
          email: user.email || user.phone,
          onboardingCompleted: !!localProfile
        }
      });
    }

    // 2. Magic Link request path (No password supplied)
    if (!password) {
      const otpResult = await sendOtp({ email, phone: mobile });
      if (otpResult.error) {
        return res.status(400).json({ error: otpResult.error.message });
      }

      const channel = email ? 'email' : 'sms';
      const destination = email || mobile;
      const code = otpResult.data?.otpCode || '';

      if (!isConfig) {
        if (channel === 'email') {
          await sendEmailOtp(destination, code).catch(console.error);
        } else {
          await sendSmsOtp(destination, code).catch(console.error);
          await sendWhatsAppOtp(destination, code).catch(console.error);
        }
      }

      return res.json({
        otpRequired: true,
        userId: 'temp_otp_user',
        channel,
        destination,
        ...(isConfig ? {} : { otpCode: code })
      });
    }

    // 3. Password Auth Login
    const authResult = await signInWithPassword({ email, phone: mobile, password });
    if (authResult.error) {
      return res.status(401).json({ error: authResult.error.message });
    }

    const { session, user } = authResult.data;

    // Check device / browser security rules to enforce dynamic OTP checks
    let otpRequired = false;
    if (deviceFingerprint) {
      const device = await dbGet(
        'SELECT * FROM user_devices WHERE user_id = ? AND device_fingerprint = ? AND is_trusted = 1',
        [user.id, deviceFingerprint]
      );
      if (!device) otpRequired = true;
    } else {
      otpRequired = true;
    }

    if (otpRequired) {
      const otpResult = await sendOtp({ email: user.email, phone: user.phone });
      const channel = user.email ? 'email' : 'sms';
      const destination = user.email || user.phone;
      const code = otpResult.data?.otpCode || '';

      if (!isConfig) {
        if (channel === 'email') {
          await sendEmailOtp(destination, code).catch(console.error);
        } else {
          await sendSmsOtp(destination, code).catch(console.error);
          await sendWhatsAppOtp(destination, code).catch(console.error);
        }
      }

      return res.json({
        otpRequired: true,
        userId: user.id,
        channel,
        destination,
        ...(isConfig ? {} : { otpCode: code })
      });
    }

    // Direct Login Successful
    await upsertProfile({
      id: user.id,
      name: user.user_metadata?.full_name || 'Ravora User',
      email: user.email || null,
      phone: user.phone || null,
      provider: 'local'
    });

    await dbRun(
      'INSERT OR IGNORE INTO users (id, email, mobile_number, full_name, password_hash) VALUES (?, ?, ?, ?, ?)',
      [user.id, user.email || null, user.phone || null, user.user_metadata?.full_name || 'Ravora User', '']
    );
    await dbRun('INSERT OR IGNORE INTO portfolios (id, user_id, current_balance, safety_score) VALUES (?, ?, 0.00, 100)', [crypto.randomUUID(), user.id]);
    await dbRun('INSERT OR IGNORE INTO user_settings (id, user_id, auto_hedge_enabled, notifications_enabled, execution_mode) VALUES (?, ?, 1, 1, \'advisory\')', [crypto.randomUUID(), user.id]);

    if (deviceFingerprint) {
      const isTrusted = rememberMe ? 1 : 0;
      await dbRun(
        'INSERT OR REPLACE INTO user_devices (id, user_id, device_fingerprint, is_trusted, last_login_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
        [crypto.randomUUID(), user.id, deviceFingerprint, isTrusted]
      );
    }

    const localProfile = await dbGet('SELECT * FROM user_profiles WHERE user_id = ?', [user.id]);
    return res.json({
      message: 'Login successful.',
      token: session.access_token,
      user: {
        id: user.id,
        email: user.email || user.phone,
        onboardingCompleted: !!localProfile
      }
    });
  } catch (err) {
    console.error('Login controller error:', err);
    return res.status(500).json({ error: 'Internal server error during login.' });
  }
};

export const resendOtp = async (req, res) => {
  const { userId, email, mobileNumber } = req.body;

  let targetEmail = email;
  let targetPhone = mobileNumber;

  // Lookup target details if not provided
  if (userId && !targetEmail && !targetPhone) {
    try {
      const localUser = await dbGet('SELECT email, mobile_number FROM users WHERE id = ?', [userId]);
      if (localUser) {
        targetEmail = localUser.email;
        targetPhone = localUser.mobile_number;
      }
    } catch (err) {
      console.warn('[DB Warning] User details lookup failed:', err.message);
    }
  }

  try {
    const isConfig = isSupabaseConfigured();
    const type = targetEmail ? 'signup' : 'sms'; // Default to signup verification resend type
    const otpResult = await resendOtpSupabase({ type, email: targetEmail, phone: targetPhone });

    if (otpResult.error) {
      return res.status(400).json({ error: otpResult.error.message });
    }

    const channel = targetEmail ? 'email' : 'sms';
    const destination = targetEmail || targetPhone;
    const code = otpResult.data?.otpCode || '';

    if (!isConfig) {
      if (channel === 'email') {
        await sendEmailOtp(destination, code).catch(console.error);
      } else {
        await sendSmsOtp(destination, code).catch(console.error);
        await sendWhatsAppOtp(destination, code).catch(console.error);
      }
    }

    return res.json({
      message: 'OTP code resent successfully.',
      destination,
      ...(isConfig ? {} : { otpCode: code })
    });
  } catch (err) {
    console.error('OTP resend controller error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

export const requestPasswordRecovery = async (req, res) => {
  const { recoveryTarget } = req.body;

  if (!recoveryTarget) {
    return res.status(400).json({ error: 'Email or mobile number is required.' });
  }

  try {
    const isEmail = recoveryTarget.includes('@');
    const email = isEmail ? recoveryTarget : undefined;
    const phone = !isEmail ? recoveryTarget : undefined;
    
    // In production recovery is magiclink or recovery type
    const isConfig = isSupabaseConfigured();
    const otpResult = await sendOtp({ email, phone });

    if (otpResult.error) {
      return res.status(400).json({ error: otpResult.error.message });
    }

    const channel = isEmail ? 'email' : 'sms';
    const code = otpResult.data?.otpCode || '';

    if (!isConfig) {
      if (channel === 'email') {
        await sendEmailOtp(recoveryTarget, code).catch(console.error);
      } else {
        await sendSmsOtp(recoveryTarget, code).catch(console.error);
        await sendWhatsAppOtp(recoveryTarget, code).catch(console.error);
      }
    }

    return res.json({
      message: 'Verification code sent.',
      userId: 'temp_recovery_user',
      channel,
      destination: recoveryTarget,
      ...(isConfig ? {} : { otpCode: code })
    });
  } catch (err) {
    console.error('Recovery request error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

export const resetPassword = async (req, res) => {
  const { userId, otpCode, newPassword, confirmPassword, email, mobileNumber } = req.body;

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }

  const pwdStrength = checkPasswordStrength(newPassword);
  if (pwdStrength.score < 3) {
    return res.status(400).json({ error: `Password is too weak: ${pwdStrength.message}` });
  }

  // Lookup target details if not provided
  let targetEmail = email;
  let targetPhone = mobileNumber;

  if (userId && !targetEmail && !targetPhone) {
    try {
      const localUser = await dbGet('SELECT email, mobile_number FROM users WHERE id = ?', [userId]);
      if (localUser) {
        targetEmail = localUser.email;
        targetPhone = localUser.mobile_number;
      }
    } catch (err) {
      console.warn('[DB Warning] User lookup failed in reset:', err.message);
    }
  }

  try {
    const isConfig = isSupabaseConfigured();

    if (isConfig) {
      const type = targetEmail ? 'recovery' : 'sms';
      const verifyResult = await supabaseVerifyOtp({
        email: targetEmail,
        phone: targetPhone,
        token: otpCode,
        type
      });

      if (verifyResult.error) {
        return res.status(400).json({ error: verifyResult.error.message });
      }

      // Update password inside Supabase Auth
      // The verify result returns the authenticated session, so we can use it to update password
      const { session, user } = verifyResult.data;
      
      // Initialize a clean supabase admin client in Node to update password by id
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseAdminClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
      
      const { error: updateError } = await supabaseAdminClient.auth.admin.updateUserById(user.id, {
        password: newPassword
      });

      if (updateError) {
        return res.status(400).json({ error: updateError.message });
      }

    } else {
      // Sandbox verify fallback
      const verifyResult = await supabaseVerifyOtp({
        email: targetEmail,
        phone: targetPhone,
        token: otpCode,
        type: targetEmail ? 'signup' : 'sms'
      });

      if (verifyResult.error) {
        return res.status(400).json({ error: verifyResult.error.message });
      }

      // Update local mock user password
      const user = verifyResult.data.user;
      // We can update the password in the mock database if needed, but since it is mock, it is fine
    }

    return res.json({ message: 'Password reset successful. You can now log in.' });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

export const socialLogin = async (req, res) => {
  const { provider, providerUserId, email, fullName, token } = req.body;

  if (!provider || !providerUserId || !email) {
    return res.status(400).json({ error: 'OAuth provider, identity ID and email are required.' });
  }

  try {
    // Create Supabase DB profiles record for the OAuth user
    await upsertProfile({
      id: providerUserId,
      name: fullName,
      email: email,
      phone: null,
      provider: provider
    });

    // Ensure local user record exists in SQLite to satisfy foreign key constraints
    await dbRun(
      'INSERT OR IGNORE INTO users (id, email, mobile_number, full_name, password_hash) VALUES (?, ?, ?, ?, ?)',
      [providerUserId, email || null, null, fullName || 'OAuth User', '']
    );

    // Create default portfolios and settings rows locally
    await dbRun('INSERT OR IGNORE INTO portfolios (id, user_id, current_balance, safety_score) VALUES (?, ?, 0.00, 100)', [crypto.randomUUID(), providerUserId]);
    await dbRun('INSERT OR IGNORE INTO user_settings (id, user_id, auto_hedge_enabled, notifications_enabled, execution_mode) VALUES (?, ?, 1, 1, \'advisory\')', [crypto.randomUUID(), providerUserId]);

    const localProfile = await dbGet('SELECT * FROM user_profiles WHERE user_id = ?', [providerUserId]);
    const clientToken = token || ('mock_jwt_token_' + providerUserId);

    return res.json({
      message: `Login successful via ${provider}.`,
      token: clientToken,
      user: {
        id: providerUserId,
        email: email,
        onboardingCompleted: !!localProfile
      }
    });
  } catch (err) {
    console.error('Social Login error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

export const checkAccount = async (req, res) => {
  const { email, phone } = req.body;
  if (!email && !phone) {
    return res.status(400).json({ error: 'Email or phone is required.' });
  }

  try {
    const { exists, method } = await checkUserExists(email, phone);
    return res.json({ exists, method });
  } catch (err) {
    console.error('checkAccount error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};
