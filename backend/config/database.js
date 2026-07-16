/**
 * Ravora Backend V1 — Supabase Database Client
 * Initializes Supabase clients (anon + admin) for database operations.
 */

import { createClient } from '@supabase/supabase-js';
import env from './environment.js';

let supabase = null;
let supabaseAdmin = null;

const isConfigured = env.SUPABASE_URL &&
  !env.SUPABASE_URL.includes('your-project-id') &&
  env.SUPABASE_ANON_KEY &&
  !env.SUPABASE_ANON_KEY.includes('your_anon');

/**
 * Initializes Supabase clients.
 * Returns { supabase, supabaseAdmin, isConfigured }
 */
export function initializeDatabase() {
  if (isConfigured) {
    supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    if (env.SUPABASE_SERVICE_ROLE_KEY) {
      supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false }
      });
    } else {
      supabaseAdmin = supabase;
    }

    console.log('[Database] ✓ Supabase connected');
  } else {
    console.warn('[Database] ⚠ Supabase not configured — database operations will fail');
  }

  return { supabase, supabaseAdmin, isConfigured };
}

/**
 * Returns the Supabase client for user-context queries (respects RLS).
 */
export function getSupabase() {
  if (!supabase) {
    throw new Error('[Database] Supabase not initialized. Call initializeDatabase() first.');
  }
  return supabase;
}

/**
 * Returns the admin Supabase client (bypasses RLS).
 * Use only for server-side operations that require elevated permissions.
 */
export function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    throw new Error('[Database] Supabase Admin not initialized. Call initializeDatabase() first.');
  }
  return supabaseAdmin;
}

export { isConfigured };
