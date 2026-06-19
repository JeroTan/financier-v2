# D1 Migration Check

Before applying remote migrations, verify Wrangler bindings point to real resources.

1. Create missing KV namespaces per environment:
   - `wrangler kv namespace create TOKEN_REVOCATION --env development`
   - `wrangler kv namespace create RATE_LIMITER --env development`
   - `wrangler kv namespace create SESSION --env development`
   - Repeat with `--env production`.
2. Copy generated namespace IDs into `wrangler.jsonc`.
3. Preview migration status:
   - `wrangler d1 migrations list DB --remote --env development`
   - `wrangler d1 migrations list DB --remote --env production`
4. Check required columns, indexes, and foreign keys are represented by checked-in migrations:
   - `npm run db:check-schema`
5. Apply migrations only after IDs are real:
   - `npm run db:migrate-development`
   - `npm run db:migrate-production`

Note: Some remote D1 databases may predate current `users` columns. Apply checked-in migrations before serving traffic; runtime code now performs read-only readiness validation and fails fast when schema drift remains.
