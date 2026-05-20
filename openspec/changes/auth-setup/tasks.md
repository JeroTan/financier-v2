## 1. Project Setup

- [x] 1.1 Generate RS256 key pair for JWT signing
- [x] 1.2 Store private key in Cloudflare Secrets Store
- [x] 1.3 Store public key in Cloudflare Secrets Store or embed in worker
- [x] 1.4 Add Workers KV namespace for token revocation list to `wrangler.jsonc`
- [x] 1.5 Create directory structure: `src/server/auth/`, `src/server/middleware/`

## 2. JWT Auth

- [x] 2.1 Implement JWT creation with RS256 signing in `src/lib/crypto/jwt.ts`
- [x] 2.2 Implement JWT validation with public key verification
- [x] 2.3 Implement refresh token generation and storage
- [x] 2.4 Implement token revocation via Workers KV blocklist

## 3. Email/Password Auth

- [x] 3.1 Implement password hashing utility (already exists in `src/lib/crypto/password.ts`)
- [x] 3.2 Create POST `/api/auth/register` endpoint
- [x] 3.3 Create POST `/api/auth/login` endpoint
- [x] 3.4 Create POST `/api/auth/logout` endpoint
- [x] 3.5 Create POST `/api/auth/refresh` endpoint
- [x] 3.6 Add Zod validation for registration and login request bodies

## 4. Google OAuth

- [x] 4.1 Create Google OAuth client configuration
- [x] 4.2 Create GET `/api/auth/google` endpoint for OAuth redirect
- [x] 4.3 Create GET `/api/auth/google/callback` endpoint for OAuth callback
- [x] 4.4 Implement user creation on first OAuth login
- [x] 4.5 Implement account linking by email matching
- [x] 4.6 Implement Google account unlinking in settings

## 5. Auth Middleware

- [x] 5.1 Create `authMiddleware` in `src/server/middleware/auth.ts`
- [x] 5.2 Implement JWT extraction from Authorization header
- [x] 5.3 Implement JWT validation and user context attachment
- [x] 5.4 Apply middleware to protected API routes

## 6. Rate Limiting

- [x] 6.1 Implement rate limiter using KV counters in `src/server/middleware/rateLimiter.ts`
- [x] 6.2 Apply 5 attempts/15 min limit to login endpoint
- [x] 6.3 Apply 3 attempts/15 min limit to registration endpoint
- [x] 6.4 Implement 429 response with Retry-After header

## 7. User Settings

- [x] 7.1 Create GET `/api/settings` endpoint for user profile
- [x] 7.2 Create PUT `/api/settings/password` endpoint for password change
- [x] 7.3 Create PUT `/api/settings/preferences` endpoint for theme preference
- [x] 7.4 Create POST `/api/settings/unlink-google` endpoint for unlinking

## 8. Integration

- [x] 8.1 Wire auth middleware to all protected API routes
- [x] 8.2 Add CORS configuration restricted to app domain
- [x] 8.3 Add request ID tracking to auth responses
- [ ] 8.4 Test full auth flow: register → login → protected route → logout → refresh

## 9. OpenAPI Documentation

- [x] 9.1 Add `routeDetail()` to POST `/api/auth/register` — summary, tags, body schema, response schema, error codes
- [x] 9.2 Add `routeDetail()` to POST `/api/auth/login` — summary, tags, body schema, response schema, error codes
- [x] 9.3 Add `routeDetail()` to POST `/api/auth/logout` — summary, tags, auth required, response schema
- [x] 9.4 Add `routeDetail()` to POST `/api/auth/refresh` — summary, tags, response schema, error codes
- [x] 9.5 Add `routeDetail()` to GET `/api/auth/google` — summary, tags, public, redirect response
- [x] 9.6 Add `routeDetail()` to GET `/api/auth/google/callback` — summary, tags, public, query params, response
- [x] 9.7 Add `routeDetail()` to GET `/api/settings` — summary, tags, auth required, response schema
- [x] 9.8 Add `routeDetail()` to PUT `/api/settings/password` — summary, tags, body schema, response, error codes
- [x] 9.9 Add `routeDetail()` to PUT `/api/settings/preferences` — summary, tags, body schema, response
- [x] 9.10 Add `routeDetail()` to POST `/api/settings/unlink-google` — summary, tags, auth required
