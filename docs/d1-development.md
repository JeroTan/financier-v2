# D1 and Cloudflare development workflow

## Source of truth

All Cloudflare-backed resources in this project must use remote Cloudflare bindings by default, including D1, KV, R2, Workers AI, and Cloudflare session storage.

This overrides any earlier local-D1 guidance. Local D1 is not the default development mode for this project.

## Normal development

Normal development uses deployed development Cloudflare resources through remote bindings.

```bash
npm run dev
```

Writes from `npm run dev` affect the deployed development resources configured in `wrangler.jsonc` under `env.development`.

Remote binding flags in `wrangler.jsonc` are intentional. Do not remove them to make development local-only.

## Local D1 scripts

The local D1 scripts exist only as emergency/debug tooling. Do not use them as the standard workflow unless the task explicitly says to isolate a Miniflare-local D1 issue.

```bash
npm run db:migrate-local
npm run db:seed-local
```

## Remote development

Use `npm run dev:remote` when testing the built Worker in Wrangler remote preview mode:

```bash
npm run dev:remote
```

This command builds the development Worker and starts Wrangler in remote mode. Writes affect deployed development resources.

## Deployed migrations

Apply migrations explicitly before deploying code that requires them:

```bash
npm run db:check-schema
npm run db:migrate-development
npm run db:migrate-production
```

Do not use normal API requests as the migration mechanism. API requests validate required tables and columns read-only; they do not create or alter schema.
