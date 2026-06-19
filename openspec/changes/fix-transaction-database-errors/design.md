## Context

### Audited D1 paths

| Surface | D1 path | Confirmed or observed issue |
|---|---|---|
| Auth register/login/refresh/logout/OAuth | `UserRepository` | D1 failures escape handlers; registration has a read-then-insert uniqueness race |
| Protected API/page auth | `authMiddleware` / middleware | User lookup failures become framework errors; logs show repeated failures during network loss |
| Settings | `UserRepository` | Repository failures are uncaught; service update methods do not verify affected rows consistently |
| Categories | `CategoryRepository` | Confirmed slug uniqueness race; repeated schema introspection; remote network-loss failures |
| Transactions | `TransactionRepository` + category seeding | Writes can fail before insert; list/count failures escape; request and OpenAPI schemas differ |
| Stats | transaction aggregation | Query failures escape; OpenAPI field names differ from runtime/client fields |
| Chat | user/category/transaction repositories | User lookup occurs before stream error handling; confirmed framework 500 in logs |
| Goals | `GoalRepository` | No active API caller; still shares migration/readiness risks |
| Receipts | auth lookup, then R2 | D1 involvement is indirect; R2/form parsing is outside this change |

### Confirmed root causes

1. The development D1 binding has `remote: true`. Local Worker code therefore proxies D1 calls to the deployed database. Logs show high latency and `Network connection lost` across unrelated queries, confirming an environment-wide transport problem rather than malformed SQL.
2. Default-category seeding can race and hit `categories.slug` uniqueness. Cross-realm D1 errors bypass `instanceof Error` checks.
3. The checked-in initial migration lacks `password_salt` and `refresh_token`, while application queries always select them. Runtime `ALTER TABLE` logic hides migration drift and repeats the same cross-realm error assumption.
4. D1-backed handlers generally do not catch repository failures, so documented JSON error responses are replaced by Astro framework errors.
5. Transaction and stats OpenAPI schemas are maintained separately from runtime schemas and have diverged.

## Goals / Non-Goals

**Goals:**
- Reliable local development without accidental dependence on remote D1 connectivity
- Explicit opt-in remote-development workflow
- Forward-only migrations that match Drizzle schemas
- Stable error classification independent of runtime realm
- Consistent JSON or SSE errors with request IDs
- Idempotent default seeding and strict non-idempotent writes
- One source of truth for transaction and stats contracts
- Regression tests covering every active D1-backed API family

**Non-Goals:**
- Hide or indefinitely retry remote service outages
- Retry non-idempotent writes without an idempotency key
- Redesign the finance data model
- Add a goals API
- Fix receipt multipart/R2 failures
- Change production D1 data destructively

## Decisions

1. **Local D1 is the default for `npm run dev`.** Remove the development binding's forced remote mode. Add an explicit remote-development script/config path for intentional integration testing. Local migrations must run before local route tests.

2. **Migrations own schema evolution.** Add a forward migration for missing user columns and verify all Drizzle-required columns/indexes. Runtime readiness may validate schema and provide a clear deployment error, but normal requests must not be the primary migration mechanism.

3. **Use one database error normalizer.** Safely extract `message`, cause/code metadata, and classify unique, duplicate-column, transient transport, and unknown failures without relying on `instanceof Error`.

4. **Retry policy is operation-aware.** Do not retry writes automatically. For transient read failures, return a stable service-unavailable error and let existing UI retry controls initiate a new request. The explicit local D1 default removes the observed development transport failure.

5. **API boundaries own public error responses.** Repository errors remain technical; handlers map them to stable JSON envelopes with `X-Request-ID`. Authentication database failures return service unavailable, not unauthorized. Once an SSE stream starts, chat emits an SSE error event.

6. **Consolidate route contracts.** Export shared Zod schemas used by runtime validation and OpenAPI registration. Preserve current frontend field names: stats uses `totalIncome`, `totalExpenses`, and `net`; transaction responses use the actual persisted transaction shape.

7. **Preserve user isolation.** Every user-owned lookup exposed through an API or tool must include `userId`; repository helpers that fetch by ID alone must not be exposed without an ownership constraint.

## Risks / Trade-offs

- Local D1 uses separate data from deployed development D1; seed fixtures and migration scripts are required for reproducible testing.
- Replacing request-time repair with migrations requires deployment discipline.
- Error classification still depends on D1/SQLite identifiers, so representative messages are locked into tests.
- Contract consolidation may reveal frontend assumptions; route smoke tests must cover all consumers before removal of duplicate schemas.
