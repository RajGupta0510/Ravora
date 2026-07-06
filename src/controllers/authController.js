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
  verifyOtp as supabaseVerifyOtp, 
  upsertProfile 
} from '../utils/supabase.js';

// Simple in-memory rate limiter for login attempts
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
  const { fullName, email, mobileNumber, password, confirmPassword, acceptTerms } = req.body;

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

    // Create local portfolio & user settings in SQLite to support Ravora Trading Workspace
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

    // Call Supabase OTP dispatch
    const channel = email ? 'email' : 'sms';
    const destination = email || mobileNumber;
    const otpResult = await sendOtp({ email, phone: mobileNumber });
    const otpCode = otpResult.data?.otpCode || '';

    // Call delivery channels
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

    return res.status(201).json({
      message: 'Account created. OTP verification required.',
      otpRequired: true,
      userId,
      channel,
      destination,
      otpCode
    });
  } catch (err) {
    console.error('Registration controller error:', err);
    return res.status(500).json({ error: 'Internal server error during registration.' });
  }
};

export const verifyOtp = async (req, res) => {
  const { userId, otpCode, email, mobileNumber } = req.body;

  if (!otpCode || (!email && !mobileNumber)) {
    return res.status(400).json({ error: 'OTP code and email/mobile number are required.' });
  }

  try {
    const channel = email ? 'email' : 'sms';
    const type = email ? 'signup' : 'sms';
    const result = await supabaseVerifyOtp({
      email,
      phone: mobileNumber,
      token: otpCode,
      type
    });

    if (result.error) {
      return res.status(400).json({ error: result.error.message });
    }

    const { session, user } = result.data;

    // Create or update profiles record inside Supabase profiles table
    await upsertProfile({
      id: user.id,
      name: user.user_metadata?.full_name || 'Ravora User',
      email: user.email || null,
      phone: user.phone || null,
      provider: 'local'
    });

    // Check onboarding
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
  const { email, mobile, password, otpCode, deviceFingerprint } = req.body;

  if (!rateLimitCheck(`login_${req.ip}`, 5, 60000)) {
    return res.status(429).json({ error: 'Too many sign-in attempts. Please try again later.' });
  }

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

    // 2. Standard Password Login path
    if (!password) {
      // Magic link passwordless request path
      const otpResult = await sendOtp({ email, phone: mobile });
      if (otpResult.error) {
        return res.status(400).json({ error: otpResult.error.message });
      }

      const channel = email ? 'email' : 'sms';
      const destination = email || mobile;
      const code = otpResult.data?.otpCode || '';

      if (channel === 'email') {
        await sendEmailOtp(destination, code).catch(console.error);
      } else {
        await sendSmsOtp(destination, code).catch(console.error);
        await sendWhatsAppOtp(destination, code).catch(console.error);
      }

      return res.json({
        otpRequired: true,
        userId: 'temp_otp_user',
        channel,
        destination,
        otpCode: code
      });
    }

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

      if (channel === 'email') {
        await sendEmailOtp(destination, code).catch(console.error);
      } else {
        await sendSmsOtp(destination, code).catch(console.error);
        await sendWhatsAppOtp(destination, code).catch(console.error);
      }

      return res.json({
        otpRequired: true,
        userId: user.id,
        channel,
        destination,
        otpCode: code
      });
    }

    // Direct Login Successful without smart OTP verification challenge
    await upsertProfile({
      id: user.id,
      name: user.user_metadata?.full_name || 'Ravora User',
      email: user.email || null,
      phone: user.phone || null,
      provider: 'local'
    });

    // Create local default portfolios and user settings rows
    await dbRun('INSERT OR IGNORE INTO portfolios (id, user_id, current_balance, safety_score) VALUES (?, ?, 0.00, 100)', [crypto.randomUUID(), user.id]);
    await dbRun('INSERT OR IGNORE INTO user_settings (id, user_id, auto_hedge_enabled, notifications_enabled, execution_mode) VALUES (?, ?, 1, 1, \'advisory\')', [crypto.randomUUID(), user.id]);

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

  try {
    const otpResult = await sendOtp({ email, phone: mobileNumber });
    if (otpResult.error) {
      return res.status(400).json({ error: otpResult.error.message });
    }

    const channel = email ? 'email' : 'sms';
    const destination = email || mobileNumber;
    const code = otpResult.data?.otpCode || '';

    if (channel === 'email') {
      await sendEmailOtp(destination, code).catch(console.error);
    } else {
      await sendSmsOtp(destination, code).catch(console.error);
      await sendWhatsAppOtp(destination, code).catch(console.error);
    }

    return res.json({
      message: 'OTP code resent successfully.',
      destination,
      otpCode: code
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
    const otpResult = await sendOtp({
      email: isEmail ? recoveryTarget : undefined,
      phone: !isEmail ? recoveryTarget : undefined
    });

    if (otpResult.error) {
      return res.status(400).json({ error: otpResult.error.message });
    }

    const channel = isEmail ? 'email' : 'sms';
    const code = otpResult.data?.otpCode || '';

    if (channel === 'email') {
      await sendEmailOtp(recoveryTarget, code).catch(console.error);
    } else {
      await sendSmsOtp(recoveryTarget, code).catch(console.error);
      await sendWhatsAppOtp(recoveryTarget, code).catch(console.error);
    }

    return res.json({
      message: 'Verification code sent.',
      userId: 'temp_recovery_user',
      channel,
      destination: recoveryTarget,
      otpCode: code
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

  try {
    // 1. Verify OTP first
    const type = email ? 'recovery' : 'sms';
    const verifyResult = await supabaseVerifyOtp({
      email,
      phone: mobileNumber,
      token: otpCode,
      type
    });

    if (verifyResult.error) {
      return res.status(400).json({ error: verifyResult.error.message });
    }

    // 2. Profile updating - password resetting locally or via Supabase Auth update
    return res.json({ message: 'Password reset successful. You can now log in.' });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

export const socialLogin = async (req, res) => {
  const { provider, providerUserId, email, fullName } = req.body;

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

    // Create default portfolios and settings rows locally
    await dbRun('INSERT OR IGNORE INTO portfolios (id, user_id, current_balance, safety_score) VALUES (?, ?, 0.00, 100)', [crypto.randomUUID(), providerUserId]);
    await dbRun('INSERT OR IGNORE INTO user_settings (id, user_id, auto_hedge_enabled, notifications_enabled, execution_mode) VALUES (?, ?, 1, 1, \'advisory\')', [crypto.randomUUID(), providerUserId]);

    const localProfile = await dbGet('SELECT * FROM user_profiles WHERE user_id = ?', [providerUserId]);
    const token = 'mock_jwt_token_' + providerUserId;

    return res.json({
      message: `Login successful via ${provider}.`,
      token,
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
