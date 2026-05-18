## 1. Rate Limiting Middleware

- [ ] 1.1 Create `src/server/middleware/rateLimiter.ts` with KV-based counter logic
- [ ] 1.2 Implement fixed-window rate limiting with configurable TTL
- [ ] 1.3 Implement endpoint category classification (chat, data-write, data-read, settings)
- [ ] 1.4 Implement IP extraction from request headers
- [ ] 1.5 Implement exempt endpoint list (health checks, static assets, auth endpoints)

## 2. Rate Limit Configuration

- [ ] 2.1 Create rate limit config object with dev/prod values per category
- [ ] 2.2 Implement environment detection from `CLOUDFLARE_ENV` (set by cross-env)
- [ ] 2.3 Implement fallback to production limits if env is undefined

## 3. Rate Limit Headers

- [ ] 3.1 Implement `Retry-After` header on 429 responses
- [ ] 3.2 Implement `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` headers
- [ ] 3.3 Wire rate limiter middleware to all API routes

## 4. Integration

- [ ] 4.1 Test rate limiting on chat endpoint
- [ ] 4.2 Test rate limiting on data endpoints
- [ ] 4.3 Test rate limiting on settings endpoint
- [ ] 4.4 Verify exempt endpoints are not rate limited
- [ ] 4.5 Verify 429 responses include correct headers
- [ ] 4.6 Test environment-aware limits (dev vs prod)
