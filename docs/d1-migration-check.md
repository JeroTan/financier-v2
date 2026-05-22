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
4. Apply migrations only after IDs are real:
   - `npm run db:migrate-development`
   - `npm run db:migrate-production`

Note: Some local or remote D1 databases may predate the current `users` columns. `UserRepository` repairs missing `password_salt`, `refresh_token`, `personality`, and `theme` columns before auth queries so stale databases do not block login or signup.
