## Context

The app uses `cross-env` (v10.1.0) in `package.json` to set `CLOUDFLARE_ENV=development|production`, which selects the matching environment block in `wrangler.jsonc`. This pattern is used for all environment-aware behavior. The `RATE_LIMITER` KV namespace is already added to `wrangler.jsonc` for both dev and production environments. Rate limits should be more permissive in development for testing.

## Goals / Non-Goals

**Goals:**
- General rate limiting middleware for all API endpoints
- Configurable limits per endpoint category
- Environment-aware limits (dev vs production)
- 429 responses with Retry-After headers

**Non-Goals:**
- Auth endpoint rate limiting (covered by `auth-setup`)
- Per-user rate limiting for authenticated endpoints (per-IP only for MVP)
- Advanced rate limiting (sliding window, token bucket)

## Decisions

### 1. Rate Limiting Strategy

**Decision**: Use a fixed-window counter in KV. Each IP + endpoint combination gets a counter with a TTL matching the window duration.

**Rationale**: Simple, efficient, and sufficient for personal app scale. KV's atomic increment operations prevent race conditions.

**Alternatives considered**:
- Sliding window: More accurate but more complex
- Token bucket: Better for burst handling but overkill

### 2. Rate Limit Configuration

**Decision**: Define rate limits in a config object keyed by endpoint pattern, with separate values for development and production.

```
Endpoint Category    | Dev (req/min) | Prod (req/min)
─────────────────────┼───────────────┼───────────────
AI Chat              | 30            | 20
Data (GET)           | 120           | 60
Data (POST/PUT)      | 60            | 30
Settings             | 30            | 15
Auth                 | 5             | 5 (covered by auth-setup)
```

**Rationale**: Different endpoints have different cost profiles. AI chat is expensive (tokens), data reads are cheap, data writes need more protection.

### 3. Environment Detection

**Decision**: Read `CLOUDFLARE_ENV` from the request context to determine rate limit tier. Falls back to production limits if undefined.

**Rationale**: Consistent with the existing `cross-env` pattern used in `package.json` scripts.

## Risks / Trade-offs

| Risk | Impact | Mitigation |
|------|--------|------------|
| Shared IP (NAT, office) blocks legitimate users | Medium | Acceptable for personal app — add per-user limits if needed |
| KV write latency adds to response time | Low | KV is edge-distributed, typically < 10ms |
| Fixed window allows burst at window boundary | Low | Acceptable for personal app scale |
