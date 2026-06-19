# Cloudflare source of truth

## Binding policy

All Cloudflare-backed resources in this project are remote by default.

This includes:

- D1 databases
- KV namespaces
- R2 buckets
- Workers AI
- Cloudflare session storage

Development must use the deployed development Cloudflare resources unless a task explicitly says to debug Miniflare-local behavior.

## Practical rules

- Keep `remote: true` on development Cloudflare bindings in `wrangler.jsonc`.
- Treat `npm run dev` as a remote-Cloudflare-resource workflow.
- Treat `npm run dev:remote` as built Worker remote-preview verification.
- Use `npm run db:migrate-development` for development D1 schema changes.
- Do not make local D1, local KV, or local R2 the default workflow.

## Local-only exception

Local D1 scripts may exist for isolated debugging, but they are not project policy and are not the default path.
