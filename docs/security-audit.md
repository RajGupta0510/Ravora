# Ravora security audit

Scope: the React frontend, both backends (`server.js` + SQLite, and `backend/` + Supabase, which is what Vercel rewrites `/v1` to on Render), the Supabase migrations and config, and the Docker/Vercel deployment files. Method: code review plus runtime checks against both servers. This is not a penetration test and no hosted Supabase project was inspected.

## Fixed

| # | Severity | Where | Problem | Fix |
| --- | --- | --- | --- | --- |
| 1 | Critical | `backend/routes/index.js` | `GET /api/v1/auth/confirm-user?email=` had no authentication and used the service role to mark any user's email as confirmed. | Route removed. |
| 2 | Critical | `backend/middleware/authorize.js` | Admin check accepted any email containing "admin" or ending `@example.com`, so anyone could register as admin and read `/admin/diagnostics`. | Admin only if `app_metadata.role === 'admin'` (set by service role only). `req.user.role` is derived the same way. |
| 3 | Critical | `backend/routes/order.routes.js` | `POST /orders/halt` let any signed-in user switch the global trading halt on or off for everyone. | Admin only, and `status` must be a boolean. |
| 4 | High | `backend/services/PaperTradingService.js` | A negative `quantity` produced negative margin and credited virtual cash; leverage and side/type were unchecked. | Strict validation: symbol format, type, side, quantity above 0, leverage 1 to 100. |
| 5 | High | `backend/middleware/auth.js` | In non-production without Supabase configured, `mock_jwt_token_<anything>` authenticated as any user. Render does not necessarily set `NODE_ENV`. | Needs explicit `ALLOW_SANDBOX_AUTH=true`; refused in production. |
| 6 | High | `src/utils/supabase.js` | `getUser` accepted `mock_jwt_token_*` even when Supabase was configured. | Mock tokens only in sandbox mode, never in production. |
| 7 | High | `server.js` `POST /v1/auth/social` | Unauthenticated; trusted `providerUserId`/`email` from the body, created local users, upserted Supabase `profiles` rows and echoed a mock token. | Requires a valid access token; identity comes from the token. Legacy `dashboard.js` updated to send it. |
| 8 | High | `server.js` `POST /v1/auth/change-password` | Did not check the current password, did not change the Supabase password, and stored the new password in plain text in SQLite. | Verifies the current password, applies strength rules, updates Supabase Auth via the service role, stores nothing locally. |
| 9 | High | `src/middleware/auth.js` | On an email/phone collision it deleted the other user's row, cascading to their portfolio, trades and history. | Detaches the identifiers instead of deleting. |
| 10 | High | Supabase `005` | `historical_signals` and `pattern_statistics` had `FOR ALL USING (true)` for every role: anyone with the anon key could write. | Migration `008` drops those policies. |
| 11 | High | Supabase `001` | Signed-in users could write their own balances, positions, orders and exchange rows directly through PostgREST, and read their encrypted exchange keys. The frontend never uses direct DB access. | Migration `008` makes those tables read-only for clients and revokes SELECT on the three credential columns. |
| 12 | High | both servers | `Access-Control-Allow-Origin: *` / `cors()` open to every site. | Allowlist (`CORS_ORIGINS`, default the deployed frontend plus local dev origins); blocked origins are logged. |
| 13 | High | `server.js` | Boot ran `git show`, `git status` and `git diff` and wrote the output (source diffs) into the repo on every start. | Removed; the three output files are untracked and ignored. |
| 14 | High | `server.js` | Without `dist/` it served the whole project folder statically (`ravora.db`, `.env`, source). | Fallback only serves the legacy pages. |
| 15 | Medium | both servers | No rate limiting on credential and OTP routes; in-memory limiter on `backend/` shared one counter across all tiers and, behind Render, keyed everything to the proxy IP. | `trust proxy`; keyed limiters (per IP plus per targeted account) on auth routes, tight limits on AI (20/min) and trade/exchange routes (30/min); tiers now have separate counters. |
| 16 | Medium | both servers | No security headers, no HTTPS redirect, `X-Powered-By` exposed. | Nosniff, frame deny, referrer policy, permissions policy, COOP, HSTS and HTTPS redirect in production, CSP on the SPA server and in `vercel.json`. |
| 17 | Medium | `src/components/dashboard/CopilotChat.tsx` | `dangerouslySetInnerHTML` on a server-supplied string (inactive today, but a stored-XSS sink). | Rendered as text. |
| 18 | Medium | `backend/services/ExchangeSyncService.js` | Accepted exchange keys with withdrawal enabled; no type checks on inputs. | Rejects keys that report withdrawal permission; type and length checks. |
| 19 | Medium | `server.js`, controllers | Raw `error.message` returned from several routes; no JSON body limit handling. | Generic messages (user-facing validation text kept), 100 KB body limit, JSON error handler. |
| 20 | Medium | `server.js` paper trading | Leverage and direction unchecked. | Leverage 1 to 100, direction LONG or SHORT. |
| 21 | Medium | `src/utils/*.js` | The `.env` loaders overwrote variables set by the host. | Existing environment variables win. |
| 22 | Medium | boot | Default `JWT_SECRET` / `ENCRYPTION_KEY` (the exchange-key encryption key) are in the source. | In production the server refuses to start with defaults, short values, missing Supabase, or sandbox auth on. |
| 23 | Low | `backend` WebSocket | 100 MB default frame size. | 16 KB cap. |
| 24 | Low | `Dockerfile` | Ran as root and had a typo; the new shared middleware is copied in. | `USER node`, fixed. |
| 25 | Low | `supabase/config.toml` (local) | Min password 6, no confirmations. | Min 8, upper/lower/digit required, email confirmations and secure password change on. |
| 26 | Dependencies | `npm audit fix --omit=dev` | Critical `proxy-addr`, high `body-parser` and `tar`/`undici` advisories. | Updated within semver. |

Logging: security events are now written as one JSON line each (`"security":true`) for CORS blocks, rate limits, failed token checks, admin denials and unhandled errors. No tokens or passwords are logged.

## Verified by running it

- `server.js` on a test port: headers present; evil-origin preflight 403 and no CORS header; allowed origin OK; `/ravora.db`, `/.env`, `/server.js` return the SPA page, not file content; `/v1/portfolio` 401; `/v1/auth/social` 401 without a token; mock token 401; login flooding returns 429; malformed JSON 400; 200 KB body 413; no CSP violations on `/` and `/auth/register` in a browser.
- `backend/index.js` in sandbox mode: `confirm-user` gone, `halt` and `diagnostics` 403 for a user named "admin", negative quantity and leverage 400, evil-origin gets no CORS header.
- Type-check and `vite build` pass; all changed server files parse.

## Not fixed or not verified

- **Real signed-in flows were not exercised** (needs live Supabase tokens): admin role grant, authenticated trading calls, social sign-in with a real token, password change, delete account.
- **Migration `008` has not been run.** Apply it to the hosted project and re-test the app; it assumes the API is the only writer, which matches the code.
- **No CAPTCHA.** Needs a provider (Turnstile or hCaptcha) and keys; Supabase supports it under Auth > Attack Protection. Rate limits are the only bot control for now.
- **Account enumeration:** `/auth/check-account` reveals whether an email exists (the sign-in screen relies on it). It is rate limited (10/min/IP) but still an oracle.
- **Remaining dependency advisories:** `zod` (high, used in browser form validation; upgrade to 4.x is breaking), `express`/`qs` and `react-router(-dom)` (moderate; need a major upgrade). Review `npm audit` after each.
- **`node_modules/` and `dist_backup/` are committed to git** (about 1,200 files). Not changed here. Remove with `git rm -r --cached` and add to `.gitignore`.
- **Two backends exist** (`server.js` and `backend/`) with overlapping features and different auth glue. Retire the one you do not deploy.
- **Tokens live in `localStorage`** (Supabase default and `ravora_token`), so any XSS would expose them. The CSP and the sink removal reduce that risk; httpOnly cookies would need an auth redesign.
- **CSP uses `style-src 'unsafe-inline'`** because the dashboard relies on inline styles. If Supabase uses a custom domain, set `CONTENT_SECURITY_POLICY` (or edit `vercel.json`) to include it.
- **WebSocket token travels in the query string** (`/ws?token=`); proxies may log it.
- **In-memory rate limiting** resets on restart and is per instance. Use Redis if you scale out.
- **No intrusion alerting is wired.** The JSON security log lines need a log drain with alert rules; no error tracker (Sentry or similar) is installed.
- No webhooks, file uploads or storage buckets exist in the code, so those checks do not apply yet. Add signature verification and private buckets when they are introduced.

## Manual configuration checklist

1. Render env: `NODE_ENV=production`, `JWT_SECRET` and `ENCRYPTION_KEY` (random, 32+ chars; rotating `ENCRYPTION_KEY` makes stored exchange credentials unreadable, so re-connect exchanges), real `SUPABASE_*` values, `CORS_ORIGINS=https://ravoraa.vercel.app` (and any other frontend origin). Do not set `ALLOW_SANDBOX_AUTH`.
2. Supabase: run `008_security_hardening.sql`; grant admins with raw app metadata `{"role":"admin"}`; confirm the service-role key exists only on the server; in Auth settings enable email confirmation, minimum password length 8 with complexity, CAPTCHA, and review rate limits.
3. Rotate `SUPABASE_SERVICE_ROLE_KEY` and any provider keys if the repository was ever public or shared; none were found in tracked files, but `.env` exists locally.
4. Add a log drain and alerts on `"security":true` events; add error tracking.
5. Have someone test admin-only endpoints and the sign-in flows on staging after deploying.
