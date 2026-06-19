## Why

The transaction failure is a symptom of broader D1/API reliability problems, not only a transaction insert defect.

The development runtime is configured with `remote: true` for D1, so local Astro/Miniflare requests are proxied over the network to the deployed development database. The audit log records 8-48 second API calls followed by `Network connection lost` failures across stats, users, categories, and transactions. Cloudflare documents that local D1 is the default development mode and that `remote: true` explicitly opts into remote data.

A second confirmed failure occurs when concurrent default-category seeding hits the legacy unique `categories.slug` constraint. The repository intends to recover, but assumes thrown D1 values satisfy the local `Error` prototype.

The audit also found missing user-column migrations, request-time schema mutation, uncaught repository errors at API boundaries, and OpenAPI/runtime drift for transactions and stats.

## What Changes

- Use local D1 for normal development and provide an explicit remote-development command for intentional testing against deployed development data
- Make checked-in migrations the source of truth for all columns currently required by Drizzle
- Keep compatibility checks read-only during normal requests; do not depend on request-time DDL for a valid deployment
- Introduce consistent D1 error normalization and JSON API error handling with request IDs
- Make default-category seeding idempotent under concurrent requests and cross-realm D1 errors
- Preserve strict handling for genuine constraint, schema, authentication, and network failures
- Align transaction and stats DTOs, route metadata, runtime validation, and response shapes
- Handle D1 failures consistently in auth middleware, settings, chat preflight, categories, transactions, and stats
- Add focused repository, API contract, and route-level regression coverage

## Capabilities

### New Capabilities
- `d1-api-reliability`: Development binding policy, database error classification, and consistent API failure contracts for D1-backed routes

### Modified Capabilities
- `d1-schema`: Migrations include every application-required column and index
- `category-repository`: Default seeding is race-safe while custom category duplicates remain strict
- `user-repository`: Schema compatibility and uniqueness errors work with D1 error-shaped values
- `auth-middleware`: Database outages do not escape as framework errors or masquerade as invalid sessions
- `transaction-api`: Runtime and documented request/response contracts agree
- `stats-api-integration`: Runtime and documented stats fields agree and failures remain retryable
- `ai-chat-service`: Database failures before and during streaming use the correct API/SSE error channel
- `api-client`: Database service failures retain status, code, and request ID for UI retry handling

## Impact

- **Configuration**: `wrangler.jsonc`, development scripts, and local migration workflow
- **Migrations**: new forward-only migration for missing user columns and any verified index drift
- **Database layer**: shared D1 error utilities plus user, category, transaction, goal, and schema-readiness paths
- **API layer**: auth, settings, categories, chat, stats, and transactions
- **Contracts**: transaction and stats DTO/OpenAPI definitions consolidated with runtime handlers
- **Tests**: repository errors, concurrent seeding, API error envelopes, and D1-backed route smoke tests
- **No destructive data migration**
- **Receipts/R2**: excluded except for shared authentication behavior
