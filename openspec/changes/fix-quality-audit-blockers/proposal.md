## Why

Quality audit found blockers that prevent Financier from building, testing, authenticating users, rendering core pages, and preserving responsive layout. These fixes are needed before feature work because current code cannot meet existing OpenSpec contracts or ship safely.

## What Changes

- Fix Astro type-check and build errors in layouts, public pages, Swagger docs, and global browser declarations.
- Repair auth routing, request formats, cookie names, access/refresh token use, protected page redirects, and API authorization behavior.
- Restore Tailwind v4 theme compatibility by separating design tokens from Tailwind scale tokens and adding shadcn-compatible aliases used by components.
- Fix landing, app shell, login/register, Swagger, and authenticated page layout so desktop/mobile render without zero-width containers or missing styles.
- Add project quality gates for `npm run check`, `npm test -- --run`, development build, route smoke tests, and responsive visual checks.
- Correct Vitest alias configuration so tests run.
- Correct D1/Drizzle schema and migration metadata so fresh and existing databases migrate without duplicate-column failures.
- Add a D1 users-table repair guard so auth survives stale local or remote databases missing current user columns.
- Normalize Cloudflare runtime configuration, Wrangler bindings, env examples, and deploy names.
- Fix chat SSE parsing and confirmation flow so streamed `message`, `done`, and `error` events drive frontend state reliably.

## Capabilities

### New Capabilities
- `quality-gates`: validation commands, smoke checks, and responsive review required before code is considered healthy.
- `runtime-configuration`: Cloudflare/Wrangler/env binding contract for local, development, and production runtime.

### Modified Capabilities
- `email-password-auth`: auth forms and JSON endpoints must match Astro routes and return usable session state.
- `jwt-auth`: access token, refresh token, cookie, persistence, and revocation behavior must be internally consistent.
- `auth-middleware`: page and API auth must validate correct token source and expose reliable user context.
- `route-protection`: public/protected route behavior must match actual Astro routes and response types.
- `api-client`: browser API calls must use valid auth headers or cookie-backed credentials consistently.
- `page-routing`: app pages must render in `AppLayout` after authentication and import components correctly.
- `landing-page`: public root page must render without `Astro.env` runtime failures.
- `swagger-ui`: API docs page must load Swagger globals without type-check failures.
- `tailwind-design-tokens`: Tailwind theme tokens must not override core spacing scales or omit used color aliases.
- `base-component-styles`: shadcn-derived components must resolve all referenced token classes.
- `app-layout`: desktop and mobile app shell widths, sidebar, and content areas must remain responsive.
- `drizzle-orm-setup`: migration files and journal metadata must be ordered, idempotent where needed, and apply cleanly.
- `d1-schema`: schema specs must include auth/session columns used by repositories and guard stale databases before auth queries.
- `chat-sse-consumer`: frontend SSE parser must read event/data pairs and close on done/error.
- `chat-confirmation-ui`: confirmation request/response flow must preserve pending transaction data and save only after confirmation.

## Impact

Affected areas: `src/layouts`, `src/pages`, `src/pages/api`, auth services/middleware, API client, Tailwind global CSS, shadcn UI primitives, chat SSE hooks, Drizzle migrations/schema, Vitest config, Wrangler config, `.env.example`, and validation scripts. External systems touched: Cloudflare D1, KV, R2, AI binding, Cloudflare deploy environments, Google OAuth config.
