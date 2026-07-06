import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Manually parse .env if it exists in the root directory to populate process.env
const rootDir = path.resolve(__dirname, '../../..');
const envPath = path.join(rootDir, '.env');
if (fs.existsSync(envPath)) {
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split(/\r?\n/).forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const firstEq = trimmed.indexOf('=');
      if (firstEq === -1) return;
      const key = trimmed.substring(0, firstEq).trim();
      let val = trimmed.substring(firstEq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    });
  } catch (err) {
    console.error('[Supabase Config] Failed to read .env file:', err);
  }
}

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const isConfigured = SUPABASE_URL && SUPABASE_ANON_KEY;

let supabase = null;
let supabaseAdmin = null;

if (isConfigured) {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  if (SUPABASE_SERVICE_ROLE_KEY) {
    supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  } else {
    supabaseAdmin = supabase;
  }
}

// Local mock database to support Sandbox Fallback Mode
const mockUsers = {};
const mockOtps = {};
const mockProfiles = {};

export const getSupabaseConfig = () => {
  return {
    supabaseUrl: SUPABASE_URL || 'http://localhost:3000/mock-supabase',
    supabaseAnonKey: SUPABASE_ANON_KEY || 'mock-anon-key'
  };
};

/**
 * Supabase Auth: Sign Up with Email and Password
 */
export const signUpWithEmail = async (email, password, fullName) => {
  if (!isConfigured) {
    console.log('[Supabase Auth Sandbox] Registering email:', email);
    const userId = crypto.randomUUID();
    mockUsers[userId] = { id: userId, email, fullName, password, verified: false };
    return { data: { user: { id: userId, email } }, error: null };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    });
    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
};

/**
 * Supabase Auth: Sign Up with Phone and Password
 */
export const signUpWithPhone = async (phone, password, fullName) => {
  if (!isConfigured) {
    console.log('[Supabase Auth Sandbox] Registering phone:', phone);
    const userId = crypto.randomUUID();
    mockUsers[userId] = { id: userId, phone, fullName, password, verified: false };
    return { data: { user: { id: userId, phone } }, error: null };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      phone,
      password,
      options: {
        data: { full_name: fullName }
      }
    });
    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
};

/**
 * Supabase Auth: Sign In with Email/Phone and Password
 */
export const signInWithPassword = async ({ email, phone, password }) => {
  if (!isConfigured) {
    console.log('[Supabase Auth Sandbox] Sign-in attempt:', email || phone);
    const user = Object.values(mockUsers).find(u => u.email === email || u.phone === phone);
    if (!user || user.password !== password) {
      return { data: null, error: new Error('Invalid login credentials') };
    }
    const token = 'mock_jwt_token_' + user.id;
    return { data: { session: { access_token: token }, user: { id: user.id, email: user.email, phone: user.phone } }, error: null };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      phone,
      password
    });
    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
};

/**
 * Supabase Auth: Send passwordless OTP code
 */
export const sendOtp = async ({ email, phone }) => {
  const target = email || phone;
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  mockOtps[target] = { code: otpCode, expires: Date.now() + 5 * 60 * 1000 };

  if (!isConfigured) {
    console.log(`[Supabase Auth Sandbox OTP] Target: ${target} | Code: ${otpCode}`);
    return { data: { otpCode }, error: null };
  }

  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      phone,
      options: {
        shouldCreateUser: true
      }
    });
    return { data: { otpCode }, error };
  } catch (err) {
    return { data: null, error: err };
  }
};

/**
 * Supabase Auth: Resend OTP Code
 */
export const resendOtpSupabase = async ({ type, email, phone }) => {
  const target = email || phone;
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  mockOtps[target] = { code: otpCode, expires: Date.now() + 5 * 60 * 1000 };

  if (!isConfigured) {
    console.log(`[Supabase Auth Sandbox Resend OTP] Target: ${target} | Code: ${otpCode}`);
    return { data: { otpCode }, error: null };
  }

  try {
    const { data, error } = await supabase.auth.resend({
      type, // 'signup', 'sms', 'magiclink', 'recovery'
      email,
      phone
    });
    return { data: { otpCode }, error };
  } catch (err) {
    return { data: null, error: err };
  }
};

/**
 * Supabase Auth: Verify OTP Code
 */
export const verifyOtp = async ({ email, phone, token, type }) => {
  const target = email || phone;

  if (!isConfigured) {
    const active = mockOtps[target];
    if (!active || active.code !== token || active.expires < Date.now()) {
      return { data: null, error: new Error('Invalid or expired verification code') };
    }

    // Find or create user
    let user = Object.values(mockUsers).find(u => u.email === email || u.phone === phone);
    if (!user) {
      const userId = crypto.randomUUID();
      user = { id: userId, email, phone, verified: true };
      mockUsers[userId] = user;
    } else {
      user.verified = true;
    }

    delete mockOtps[target];
    const jwtToken = 'mock_jwt_token_' + user.id;
    return { data: { session: { access_token: jwtToken }, user: { id: user.id, email: user.email, phone: user.phone } }, error: null };
  }

  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      phone,
      token,
      type
    });
    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
};

/**
 * Supabase Auth: Get User Details via JWT Token
 */
export const getUser = async (token) => {
  if (!isConfigured || token.startsWith('mock_jwt_token_')) {
    const userId = token.replace('mock_jwt_token_', '');
    const user = mockUsers[userId];
    if (!user) return { data: { user: null }, error: new Error('Invalid token') };
    return { data: { user: { id: user.id, email: user.email, phone: user.phone } }, error: null };
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    return { data: { user }, error };
  } catch (err) {
    return { data: { user: null }, error: err };
  }
};

/**
 * Profiles Database Manager: Upsert user profiles
 */
export const upsertProfile = async (profile) => {
  const { id, name, email, phone, provider, avatar } = profile;

  if (!isConfigured) {
    console.log('[Supabase DB Sandbox] Upserting profile for user:', id);
    const exists = !!mockProfiles[id];
    if (exists) {
      mockProfiles[id].last_login = new Date().toISOString();
      mockProfiles[id].updated_at = new Date().toISOString();
    } else {
      mockProfiles[id] = {
        id,
        full_name: name,
        email,
        phone,
        provider,
        avatar_url: avatar || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      };
    }
    return { data: mockProfiles[id], error: null };
  }

  try {
    // Check if profile exists
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (existing) {
      // Returning user: update last_login and updated_at only
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .update({
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();
      return { data: data ? data[0] : null, error };
    } else {
      // First-time user: create profile automatically
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .insert({
          id,
          full_name: name,
          email,
          phone,
          provider,
          avatar_url: avatar || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_login: new Date().toISOString()
        })
        .select();
      return { data: data ? data[0] : null, error };
    }
  } catch (err) {
    return { data: null, error: err };
  }
};

/**
 * Profiles Database Manager: Get user profile details
 */
export const getProfile = async (id) => {
  if (!isConfigured) {
    const profile = mockProfiles[id] || null;
    return { data: profile, error: null };
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    return { data: data || null, error };
  } catch (err) {
    return { data: null, error: err };
  }
};

/**
 * Check if user exists in Supabase or Sandbox mock database
 */
export const checkUserExists = async (email, phone) => {
  if (!isConfigured) {
    const user = Object.values(mockUsers).find(u => (email && u.email === email) || (phone && u.phone === phone));
    if (user) {
      return { exists: true, method: user.provider || 'password' };
    }
    return { exists: false };
  }

  try {
    const { data: users, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) throw error;
    const user = users.users.find(u => (email && u.email === email) || (phone && u.phone === phone));
    if (user) {
      const identities = user.identities || [];
      const oauthIdentity = identities.find(id => id.provider !== 'email' && id.provider !== 'phone');
      return { exists: true, method: oauthIdentity ? oauthIdentity.provider : 'password' };
    }
    return { exists: false };
  } catch (err) {
    console.error('[Supabase checkUserExists error]', err);
    return { exists: false };
  }
};
