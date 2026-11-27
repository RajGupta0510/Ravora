# Ravora threat model (draft)

## What Ravora is

An AI-assisted crypto trading terminal. A React/Vite single-page app (`src/`, `components/`) talks to an Express API (`server.js`, `src/controllers`, `src/services`) backed by SQLite (`ravora.db`). A second, larger service tree (`backend/`) holds AI providers, exchange adapters, an execution queue and background workers. Authentication uses Supabase and locally issued JWTs. Today users trade in a simulated paper account; connecting a real exchange and live order execution are planned.

## Security goals

1. Only an authenticated user can read or change their own profile, portfolio, paper positions, notifications and settings.
2. Exchange API keys are never stored or logged in plain text, and Ravora never holds user funds. Keys with withdrawal permission must be rejected.
3. No endpoint executes caller-supplied commands, queries or code.
4. Secrets (JWT secret, Supabase keys, AI provider keys, exchange credentials) come from the environment and never from source defaults.
5. Trade execution must respect the user's risk limits and cannot be triggered on behalf of another user.

## In scope

- `server.js`, `src/controllers/*`, `src/middleware/*`, `src/services/*`, `src/database.js`, `src/utils/*`
- `backend/*` (routes, controllers, execution, exchange, ai, repositories, middleware)
- `supabase/migrations/*` and `backend/database/migrations/*`
- The frontend only where it handles tokens, redirects or untrusted HTML

## Out of scope

- Third-party services (Supabase, exchanges, AI providers, TradingView widget) and their own bugs
- The legacy static pages under `app/` and `dist_backup/`, which are not served in production
- Denial of service by volume alone, and anything needing a compromised host or developer machine
- Findings in `node_modules/`

## Attacker model

An unauthenticated remote user; an authenticated user attacking other users' data; a user supplying malicious input to AI prompts, exchange connection forms or symbol and quantity fields.

## Severity guidance

- **Critical/High:** authentication bypass, access to another user's data or keys, remote code or command execution, SQL injection, secret disclosure, forged order execution.
- **Medium:** missing rate limits on login, OTP or password reset; weak token handling; information leaks in error messages; unsafe defaults that matter only when configuration is wrong.
- **Low:** hardening gaps with no demonstrated impact (headers, logging detail).
