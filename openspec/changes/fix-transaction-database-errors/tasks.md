## 1. Establish reproducible D1 environments

- [x] 1.1 Keep remote Cloudflare D1 as the default for normal development
- [x] 1.2 Keep an explicit remote-preview command for built Worker verification
- [x] 1.3 Keep local D1 migration and seed commands documented as emergency/debug tooling only
- [x] 1.4 Document remote development and production database workflows

## 2. Make migrations authoritative

- [x] 2.1 Add a forward migration for `users.password_salt` and `users.refresh_token`
- [x] 2.2 Verify all Drizzle columns, foreign keys, constraints, and indexes against migrations
- [x] 2.3 Replace request-time schema mutation with a read-only readiness check or remove it after migration verification
- [x] 2.4 Add a migration/schema drift check to CI or the build workflow

## 3. Normalize D1 failures

- [x] 3.1 Add shared message/metadata extraction for native and cross-realm thrown values
- [x] 3.2 Classify unique, duplicate-column, transient transport, and unknown database failures
- [x] 3.3 Ensure unrelated failures are never suppressed as benign conflicts
- [x] 3.4 Add unit tests for observed D1 and SQLite error formats

## 4. Harden repositories

- [x] 4.1 Make default-category seeding idempotent under concurrent requests
- [x] 4.2 Preserve strict duplicate handling for custom categories and user registration
- [x] 4.3 Verify repository mutation methods report missing rows instead of unconditional success
- [x] 4.4 Require user ownership for externally reachable transaction/category/goal lookups
- [x] 4.5 Add repository tests using a D1-compatible unit harness; runtime Cloudflare bindings stay remote

## 5. Standardize D1-backed API errors

- [x] 5.1 Add a shared route wrapper or mapper for JSON database errors and request IDs
- [x] 5.2 Apply it to auth, settings, categories, transactions, and stats
- [x] 5.3 Return service unavailable for database transport failures instead of unauthorized or framework HTML errors
- [x] 5.4 Handle chat database failures before streaming as JSON and after streaming as SSE errors
- [x] 5.5 Verify protected page middleware handles D1 outages without redirecting users as if their session were invalid

## 6. Reconcile API contracts

- [x] 6.1 Consolidate transaction runtime, DTO, and OpenAPI schemas
- [x] 6.2 Consolidate stats runtime, DTO, OpenAPI, and frontend field names
- [x] 6.3 Remove duplicate route metadata definitions
- [x] 6.4 Add contract tests for transaction create/list and stats responses
- [x] 6.5 Verify API client preserves status, error code, and request ID

## 7. Verify all active D1 workflows

- [x] 7.1 Run unit tests and `npm run check`
- [x] 7.2 Run migrations against deployed development D1 and verify schema readiness
- [x] 7.3 Smoke-test register, login, refresh, logout, and Google-linked user lookup
- [x] 7.4 Smoke-test settings read/password/preferences/unlink operations
- [x] 7.5 Smoke-test categories list/create and concurrent default seeding
- [x] 7.6 Smoke-test transaction create/list/filter and stats aggregation
- [x] 7.7 Smoke-test AI chat normal and confirmed-transaction database paths
- [x] 7.8 Run remote-development smoke tests and verify failures return stable retryable errors
