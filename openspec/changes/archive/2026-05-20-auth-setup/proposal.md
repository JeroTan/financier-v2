## Why

Financier requires secure user authentication to isolate each user's financial data. The PRD specifies JWT-based auth with RS256 asymmetric signing, short-lived access tokens (15-30 min), refresh tokens, Google OAuth, and email/password registration. Currently, the auth infrastructure (crypto utilities, session tokens, JWT) exists in `src/lib/crypto/` but no auth routes, middleware, or user management endpoints are implemented.

## What Changes

- Implement JWT authentication with RS256 asymmetric key signing
- Create auth API routes: register, login, logout, refresh token, Google OAuth callback
- Build auth middleware for protecting API routes with JWT validation
- Set up token revocation list using Workers KV
- Implement rate limiting on auth endpoints (per IP/user)
- Create user settings endpoints: change password, link/unlink Google account
- Add appearance preference storage (dark/light mode toggle)

## Capabilities

### New Capabilities
- `jwt-auth`: JWT creation, validation, refresh, and revocation with RS256 signing
- `email-password-auth`: Registration and login with email/password, password hashing and validation
- `google-oauth`: Google OAuth 2.0 flow with account linking and unlinking
- `auth-middleware`: Request authentication middleware that validates JWT and attaches user context
- `auth-rate-limiting`: Rate limiting on auth endpoints to prevent brute force attacks
- `user-settings`: Password change, account preferences, and appearance settings management

### Modified Capabilities
<!-- No existing specs to modify -->

## Impact

- New files in `src/server/auth/`, `src/server/middleware/`, `src/server/controller/`
- New API routes: `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/refresh`, `/api/auth/google`, `/api/settings`
- Depends on `database-schema` for user repository
- Requires Workers KV namespace for token revocation list (`TOKEN_REVOCATION` in `wrangler.jsonc`)
- Requires Google OAuth credentials (Google Cloud Console project)
- Uses `cross-env` / `CLOUDFLARE_ENV` pattern from `package.json` for environment-aware behavior
- All API routes except landing page and auth endpoints require valid JWT
