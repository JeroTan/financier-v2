## 1. Establish reproducible D1 environments

- [ ] 1.1 Make local D1 the default for normal development
- [ ] 1.2 Add an explicit remote-development command for intentional deployed-D1 testing
- [ ] 1.3 Add local D1 migration and seed commands
- [ ] 1.4 Document the local, remote-development, and production database workflows

## 2. Make migrations authoritative

- [ ] 2.1 Add a forward migration for `users.password_salt` and `users.refresh_token`
- [ ] 2.2 Verify all Drizzle columns, foreign keys, constraints, and indexes against migrations
- [ ] 2.3 Replace request-time schema mutation with a read-only readiness check or remove it after migration verification
- [ ] 2.4 Add a migration/schema drift check to CI or the build workflow

## 3. Normalize D1 failures

- [ ] 3.1 Add shared message/metadata extraction for native and cross-realm thrown values
- [ ] 3.2 Classify unique, duplicate-column, transient transport, and unknown database failures
- [ ] 3.3 Ensure unrelated failures are never suppressed as benign conflicts
- [ ] 3.4 Add unit tests for observed D1 and SQLite error formats

## 4. Harden repositories

- [ ] 4.1 Make default-category seeding idempotent under concurrent requests
- [ ] 4.2 Preserve strict duplicate handling for custom categories and user registration
- [ ] 4.3 Verify repository mutation methods report missing rows instead of unconditional success
- [ ] 4.4 Require user ownership for externally reachable transaction/category/goal lookups
- [ ] 4.5 Add repository tests using a local D1-compatible harness

## 5. Standardize D1-backed API errors

- [ ] 5.1 Add a shared route wrapper or mapper for JSON database errors and request IDs
- [ ] 5.2 Apply it to auth, settings, categories, transactions, and stats
- [ ] 5.3 Return service unavailable for database transport failures instead of unauthorized or framework HTML errors
- [ ] 5.4 Handle chat database failures before streaming as JSON and after streaming as SSE errors
- [ ] 5.5 Verify protected page middleware handles D1 outages without redirecting users as if their session were invalid

## 6. Reconcile API contracts

- [ ] 6.1 Consolidate transaction runtime, DTO, and OpenAPI schemas
- [ ] 6.2 Consolidate stats runtime, DTO, OpenAPI, and frontend field names
- [ ] 6.3 Remove duplicate route metadata definitions
- [ ] 6.4 Add contract tests for transaction create/list and stats responses
- [ ] 6.5 Verify API client preserves status, error code, and request ID

## 7. Verify all active D1 workflows

- [ ] 7.1 Run unit tests and `npm run check`
- [ ] 7.2 Run migrations against a clean local D1 database
- [ ] 7.3 Smoke-test register, login, refresh, logout, and Google-linked user lookup
- [ ] 7.4 Smoke-test settings read/password/preferences/unlink operations
- [ ] 7.5 Smoke-test categories list/create and concurrent default seeding
- [ ] 7.6 Smoke-test transaction create/list/filter and stats aggregation
- [ ] 7.7 Smoke-test AI chat normal and confirmed-transaction database paths
- [ ] 7.8 Run explicit remote-development smoke tests and verify failures return stable retryable errors
