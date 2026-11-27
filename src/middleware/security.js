/**
 * Shared HTTP hardening used by both servers (server.js and backend/index.js):
 * security headers, a CORS allowlist, keyed rate limiting and a small security event log.
 * No third-party dependencies on purpose.
 */

const isProd = () => process.env.NODE_ENV === 'production';

/* ------------------------------------------------------------------ */
/* Security event log                                                  */
/* ------------------------------------------------------------------ */

/** One JSON line per event so a log drain (Render, Datadog, Logtail ...) can alert on `"security":true`. */
export function securityLog(event, details = {}) {
  const line = { security: true, event, at: new Date().toISOString(), ...details };
  // Never log credentials or tokens; callers pass only identifiers.
  console.warn(JSON.stringify(line));
}

/* ------------------------------------------------------------------ */
/* Client IP                                                           */
/* ------------------------------------------------------------------ */

export const clientIp = (req) => req.ip || req.socket?.remoteAddress || 'unknown';

/* ------------------------------------------------------------------ */
/* Security headers                                                    */
/* ------------------------------------------------------------------ */

const DEFAULT_CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' https://s3.tradingview.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.tradingview.com wss://*.tradingview.com",
  'frame-src https://*.tradingview.com',
  "worker-src 'self' blob:",
  ...(isProd() ? ['upgrade-insecure-requests'] : []),
].join('; ');

export const CONTENT_SECURITY_POLICY = process.env.CONTENT_SECURITY_POLICY || DEFAULT_CSP;

/**
 * @param {{ csp?: boolean }} options  csp: also send a Content-Security-Policy (for HTML-serving servers)
 */
export function securityHeaders({ csp = true } = {}) {
  return (req, res, next) => {
    res.removeHeader('X-Powered-By');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    if (isProd()) {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    if (csp && !req.path.startsWith('/app/')) {
      // The legacy /app pages use inline scripts and are left without a CSP.
      res.setHeader('Content-Security-Policy', CONTENT_SECURITY_POLICY);
    }
    // API responses can carry personal data; keep shared caches away from them.
    if (req.path.startsWith('/v1') || req.path.startsWith('/api')) {
      res.setHeader('Cache-Control', 'no-store');
    }
    next();
  };
}

/** Redirect plain HTTP to HTTPS in production (Render / Vercel set x-forwarded-proto). */
export function requireHttps(req, res, next) {
  if (!isProd()) return next();
  const proto = req.headers['x-forwarded-proto'];
  if (proto && proto !== 'https') {
    if (req.method === 'GET' || req.method === 'HEAD') {
      return res.redirect(308, `https://${req.headers.host}${req.originalUrl}`);
    }
    return res.status(426).json({ error: 'HTTPS required.' });
  }
  next();
}

/* ------------------------------------------------------------------ */
/* CORS allowlist                                                      */
/* ------------------------------------------------------------------ */

const DEV_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5500', 'http://127.0.0.1:5500'];

export function allowedOrigins() {
  const configured = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (configured.length) return configured;
  // Default: the deployed frontend plus local development origins.
  return ['https://ravoraa.vercel.app', ...(isProd() ? [] : DEV_ORIGINS)];
}

export function corsAllowlist() {
  const origins = new Set(allowedOrigins());
  return (req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
      if (origins.has(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Vary', 'Origin');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Max-Age', '600');
      } else if (req.method === 'OPTIONS') {
        securityLog('cors_blocked', { origin, ip: clientIp(req) });
        return res.sendStatus(403);
      }
      // A disallowed origin on a simple request simply gets no CORS headers; the browser blocks the read.
    }
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  };
}

/* ------------------------------------------------------------------ */
/* Rate limiting                                                       */
/* ------------------------------------------------------------------ */

const buckets = new Map();
setInterval(() => {
  const now = Date.now();
  for (const [key, b] of buckets) if (now - b.start > b.windowMs * 2) buckets.delete(key);
}, 60_000).unref();

/**
 * Fixed-window limiter keyed by name + client IP (+ optional extra key, e.g. the email being attacked).
 * @param {{ name: string, windowMs: number, max: number, keyFn?: (req)=>string|undefined }} opts
 */
export function rateLimit({ name, windowMs, max, keyFn }) {
  return (req, res, next) => {
    const extra = keyFn ? keyFn(req) : '';
    const key = `${name}:${clientIp(req)}:${extra || ''}`;
    const now = Date.now();
    let b = buckets.get(key);
    if (!b || now - b.start > windowMs) {
      b = { start: now, count: 0, windowMs };
      buckets.set(key, b);
    }
    b.count += 1;
    res.setHeader('RateLimit-Limit', String(max));
    res.setHeader('RateLimit-Remaining', String(Math.max(0, max - b.count)));
    if (b.count > max) {
      const retry = Math.ceil((b.start + windowMs - now) / 1000);
      res.setHeader('Retry-After', String(retry));
      securityLog('rate_limited', { limiter: name, ip: clientIp(req), path: req.path });
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }
    next();
  };
}

/** Lower-cased identifier from the body, so attackers cannot dodge the limit by rotating IPs for one account. */
export const identifierKey = (req) => {
  const b = req.body || {};
  const v = b.email || b.mobile || b.mobileNumber || b.recoveryTarget || b.userId || '';
  return typeof v === 'string' ? v.toLowerCase().slice(0, 200) : '';
};

/* ------------------------------------------------------------------ */
/* Production configuration guard                                      */
/* ------------------------------------------------------------------ */

const KNOWN_DEFAULTS = ['ravora_jwt_secret_key_2026', 'ravora_default_encryption_key_32b', 'specify_a_long_cryptographically_secure_random_hash_string'];

/** Refuse to boot in production with default secrets or mock authentication. */
export function assertProductionConfig({ supabaseConfigured, secrets = ['JWT_SECRET', 'ENCRYPTION_KEY'] }) {
  if (!isProd()) return;
  const problems = [];
  if (!supabaseConfigured) problems.push('Supabase is not configured, which would enable mock authentication');
  for (const name of secrets) {
    const v = process.env[name];
    if (!v || KNOWN_DEFAULTS.includes(v) || v.length < 32) problems.push(`${name} must be set to a random value of at least 32 characters`);
  }
  if (process.env.ALLOW_SANDBOX_AUTH === 'true') problems.push('ALLOW_SANDBOX_AUTH must not be true in production');
  if (problems.length) {
    throw new Error(`Unsafe production configuration:\n - ${problems.join('\n - ')}`);
  }
}

/**
 * Error text that is safe to show a client. Domain validation errors written for users ("Invalid position size.",
 * "Insufficient USDC balance ...") pass through; anything else (database, network, library errors) is replaced.
 */
const USER_FACING = /^(Invalid |Insufficient |Portfolio not found|Position not found|Trade not found|No active |Opportunity not found|Leverage |Direction |Unsupported )/;
export function publicError(err, fallback = 'Request could not be completed.') {
  const msg = err && typeof err.message === 'string' ? err.message : '';
  return USER_FACING.test(msg) ? msg : fallback;
}
