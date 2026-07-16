/**
 * Ravora Backend V1 — Environment Configuration
 * Validates and exports all required environment variables at startup.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root if present
const rootDir = path.resolve(__dirname, '../..');
const envPath = path.join(rootDir, '.env');

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) return;
    const key = trimmed.substring(0, eqIdx).trim();
    let val = trimmed.substring(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = val;
    }
  });
}

const env = {
  // Server
  PORT: parseInt(process.env.BACKEND_PORT || process.env.PORT || '3001', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Supabase
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'ravora_jwt_secret_key_2026',

  // Encryption (for API keys)
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || 'ravora_default_encryption_key_32b',

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),

  // Feature flags
  ENABLE_WEBSOCKETS: process.env.ENABLE_WEBSOCKETS !== 'false',
  ENABLE_JOBS: process.env.ENABLE_JOBS !== 'false',
};

/**
 * Validates that critical environment variables are set.
 * Logs warnings for missing optional config.
 */
export function validateEnvironment() {
  const warnings = [];
  const errors = [];

  if (!env.SUPABASE_URL || env.SUPABASE_URL.includes('your-project-id')) {
    warnings.push('SUPABASE_URL is not configured — running in sandbox mode');
  }

  if (!env.SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY.includes('your_anon')) {
    warnings.push('SUPABASE_ANON_KEY is not configured — running in sandbox mode');
  }

  if (!env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY.includes('your_service')) {
    warnings.push('SUPABASE_SERVICE_ROLE_KEY is not configured — admin operations unavailable');
  }

  if (env.JWT_SECRET === 'ravora_jwt_secret_key_2026') {
    warnings.push('Using default JWT_SECRET — set a secure value in production');
  }

  warnings.forEach(w => console.warn(`[Config] ⚠ ${w}`));
  errors.forEach(e => console.error(`[Config] ✗ ${e}`));

  if (errors.length > 0) {
    throw new Error(`[Config] ${errors.length} critical configuration error(s). Fix before starting.`);
  }

  console.log('[Config] ✓ Environment validated');
  return env;
}

export default env;
