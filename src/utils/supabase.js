import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import crypto from 'crypto';

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

// Local mock database to support Sandbox Fallback Mode
const mockUsers = {};
const mockOtps = {};
const mockProfiles = {};

const requestHttps = (url, options, bodyData = '') => {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });
    req.on('error', (err) => reject(err));
    if (bodyData) {
      req.write(bodyData);
    }
    req.end();
  });
};

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

  const url = `${SUPABASE_URL}/auth/v1/signup`;
  const body = JSON.stringify({
    email,
    password,
    options: { data: { full_name: fullName } }
  });

  const options = {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Content-Type': 'application/json'
    }
  };

  try {
    const res = await requestHttps(url, options, body);
    const data = JSON.parse(res.body);
    if (res.statusCode >= 400) {
      return { data: null, error: new Error(data.msg || data.error_description || 'Signup failed') };
    }
    return { data, error: null };
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

  const url = `${SUPABASE_URL}/auth/v1/signup`;
  const body = JSON.stringify({
    phone,
    password,
    options: { data: { full_name: fullName } }
  });

  const options = {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Content-Type': 'application/json'
    }
  };

  try {
    const res = await requestHttps(url, options, body);
    const data = JSON.parse(res.body);
    if (res.statusCode >= 400) {
      return { data: null, error: new Error(data.msg || data.error_description || 'Phone signup failed') };
    }
    return { data, error: null };
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

  const url = `${SUPABASE_URL}/auth/v1/token?grant_type=password`;
  const body = JSON.stringify({
    email,
    phone,
    password
  });

  const options = {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Content-Type': 'application/json'
    }
  };

  try {
    const res = await requestHttps(url, options, body);
    const data = JSON.parse(res.body);
    if (res.statusCode >= 400) {
      return { data: null, error: new Error(data.msg || data.error_description || 'Authentication failed') };
    }
    return { data: { session: { access_token: data.access_token }, user: data.user }, error: null };
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

  const url = `${SUPABASE_URL}/auth/v1/otp`;
  const body = JSON.stringify({
    email,
    phone,
    create_user: true
  });

  const options = {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Content-Type': 'application/json'
    }
  };

  try {
    const res = await requestHttps(url, options, body);
    const data = JSON.parse(res.body);
    if (res.statusCode >= 400) {
      return { data: null, error: new Error(data.msg || data.error_description || 'Failed to dispatch OTP') };
    }
    return { data: { otpCode }, error: null };
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

  const url = `${SUPABASE_URL}/auth/v1/verify`;
  const body = JSON.stringify({
    email,
    phone,
    token,
    type
  });

  const options = {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Content-Type': 'application/json'
    }
  };

  try {
    const res = await requestHttps(url, options, body);
    const data = JSON.parse(res.body);
    if (res.statusCode >= 400) {
      return { data: null, error: new Error(data.msg || data.error_description || 'OTP validation failed') };
    }
    return { data: { session: { access_token: data.access_token }, user: data.user }, error: null };
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

  const url = `${SUPABASE_URL}/auth/v1/user`;
  const options = {
    method: 'GET',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${token}`
    }
  };

  try {
    const res = await requestHttps(url, options);
    const data = JSON.parse(res.body);
    if (res.statusCode >= 400) {
      return { data: { user: null }, error: new Error(data.msg || 'JWT validation failed') };
    }
    return { data: { user: data }, error: null };
  } catch (err) {
    return { data: { user: null }, error: err };
  }
};

/**
 * Profiles Database Manager: Upsert user profiles
 */
export const upsertProfile = async (profile) => {
  const { id, name, email, phone, provider } = profile;

  if (!isConfigured) {
    console.log('[Supabase DB Sandbox] Upserting profile for user:', id);
    mockProfiles[id] = {
      id,
      name,
      email,
      phone,
      provider,
      created_at: mockProfiles[id]?.created_at || new Date().toISOString(),
      last_login: new Date().toISOString()
    };
    return { data: mockProfiles[id], error: null };
  }

  const url = `${SUPABASE_URL}/rest/v1/profiles`;
  const body = JSON.stringify({
    id,
    name,
    email,
    phone,
    provider,
    last_login: new Date().toISOString()
  });

  const options = {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates,return=representation'
    }
  };

  try {
    const res = await requestHttps(url, options, body);
    const data = JSON.parse(res.body);
    if (res.statusCode >= 400) {
      return { data: null, error: new Error(data.message || 'Profile database write failed') };
    }
    return { data: data[0], error: null };
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

  const url = `${SUPABASE_URL}/rest/v1/profiles?id=eq.${id}&select=*`;
  const options = {
    method: 'GET',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    }
  };

  try {
    const res = await requestHttps(url, options);
    const data = JSON.parse(res.body);
    if (res.statusCode >= 400) {
      return { data: null, error: new Error(data.message || 'Failed to fetch profile') };
    }
    return { data: data[0] || null, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
};
