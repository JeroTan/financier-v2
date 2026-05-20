## Why

The PRD specifies rate limiting on auth endpoints, but all API endpoints (chat, transactions, stats, settings) need protection against abuse. Without general rate limiting, a malicious actor could flood the AI chat endpoint (costly in tokens), spam transaction creation, or scrape stats data. The `auth-setup` change covers auth-specific rate limiting; this change covers all other API endpoints.

## What Changes

- Implement a general-purpose rate limiting middleware using Workers KV (`RATE_LIMITER` namespace)
- Apply rate limits per-IP for public endpoints and per-user for authenticated endpoints
- Configure different rate limits per endpoint category (chat, data, settings)
- Return 429 Too Many Requests with Retry-After header when limits exceeded
- Configure rate limits via environment-aware settings (development vs production)

## Capabilities

### New Capabilities
- `rate-limiting-middleware`: General rate limiting middleware using KV counters with configurable limits per endpoint
- `rate-limit-config`: Rate limit configuration per endpoint category with development/production overrides
- `rate-limit-headers`: 429 response with Retry-After header and rate limit info

### Modified Capabilities
<!-- No existing specs to modify -->

## Impact

- New middleware in `src/server/middleware/rateLimiter.ts`
- Uses `RATE_LIMITER` KV namespace (added to `wrangler.jsonc`)
- Applied to all API routes except health checks and static assets
- Depends on `cross-env` / `CLOUDFLARE_ENV` pattern from `package.json` for environment-aware limits
- Complements `auth-setup` which handles auth-specific rate limiting
