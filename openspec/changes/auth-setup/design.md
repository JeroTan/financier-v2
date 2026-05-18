## Context

Financier requires secure user authentication to isolate each user's financial data. The PRD specifies JWT-based auth with RS256 asymmetric signing, short-lived access tokens (15-30 min), refresh tokens, Google OAuth, and email/password registration. The codebase already has crypto utilities in `src/lib/crypto/` (jwt.ts, session-token.ts, password.ts, hash.ts) but no auth routes, middleware, or user management endpoints.

## Goals / Non-Goals

**Goals:**
- JWT auth with RS256 asymmetric key signing
- Email/password registration and login
- Google OAuth 2.0 flow with account linking
- Auth middleware for protecting API routes
- Token revocation via Workers KV
- Rate limiting on auth endpoints
- User settings: password change, account preferences

**Non-Goals:**
- Multi-factor authentication (MFA)
- Social login beyond Google
- Admin panel or role-based access control
- Password reset via email (MVP: users can change password after login)

## Decisions

### 1. RS256 JWT Signing

**Decision**: Use RS256 asymmetric signing with a key pair stored in Cloudflare Secrets Store.

**Rationale**: Asymmetric keys allow token verification without exposing the private key. The public key can be shared if needed for future service-to-service auth.

**Alternatives considered**:
- HS256: Simpler but requires shared secret, harder to rotate
- EdDSA: Newer but less widely supported

### 2. Token Storage

**Decision**: Store access tokens in memory (client-side JS) and refresh tokens in HttpOnly, Secure cookies.

**Rationale**: HttpOnly cookies prevent XSS theft of refresh tokens. Access tokens in memory are lost on page refresh but can be refreshed automatically.

**Alternatives considered**:
- Both tokens in localStorage: Vulnerable to XSS
- Both in cookies: CSRF risk, requires CSRF protection

### 3. Token Revocation

**Decision**: Use Workers KV as a token revocation list (blocklist). On logout, add the refresh token to the blocklist with an expiry matching the token's TTL.

**Rationale**: KV is fast, edge-distributed, and perfect for a simple blocklist. The expiry ensures the blocklist doesn't grow indefinitely.

### 4. Rate Limiting

**Decision**: Implement rate limiting at the Worker level using KV counters. 5 attempts per 15 minutes per IP for login/register.

**Rationale**: KV counters are simple and effective. Per-IP prevents brute force without requiring user identification.

### 5. Google OAuth Flow

**Decision**: Use the standard OAuth 2.0 authorization code flow. On first login with Google, create a user record. On subsequent logins, link to existing user if email matches.

**Rationale**: Standard flow, well-documented, secure. Email matching allows linking Google login to an existing email/password account.

## Risks / Trade-offs

| Risk | Impact | Mitigation |
|------|--------|------------|
| JWT private key compromise | Critical | Store in Cloudflare Secrets Store, rotate regularly, short token TTL |
| Refresh token theft via XSS | High | HttpOnly cookies prevent JS access |
| KV rate limit bypass (shared IP) | Low | Acceptable for personal app — add per-user limits if needed |
| Google OAuth downtime | Medium | Fallback to email/password login |
| No password reset flow | Medium | Users can contact support or re-register. Add email reset in Phase 2. |
