## 1. Typecheck And Route Foundations

- [ ] 1.1 Move `Sidebar` and `Toaster` imports in `AppLayout.astro` into valid Astro frontmatter and remove invalid trailing import script.
- [ ] 1.2 Fix `window.toggleTheme`, `window.ui`, and `SwaggerUIBundle` typing or inline-script declarations so Astro check passes.
- [ ] 1.3 Replace invalid `Astro.env` usage in `index.astro` and `sitemap.xml.astro` with supported runtime config/fallback access.
- [ ] 1.4 Remove duplicate/unused Astro imports in `stats.astro` and related pages.
- [ ] 1.5 Verify `/`, `/login`, `/register`, `/api/docs`, and `/api/openapi.json` render or respond without 500 errors.

## 2. Tailwind Tokens And Responsive Layout

- [ ] 2.1 Rename app spacing design tokens so they do not override Tailwind v4 core `--spacing-*` tokens.
- [ ] 2.2 Add Tailwind theme aliases for shadcn-compatible classes: card, popover, muted, accent, border, input, ring, foreground, destructive, and foreground variants.
- [ ] 2.3 Add or replace gold token classes used by chat, forms, stats, and pagination.
- [ ] 2.4 Verify login/register form container, inputs, buttons, and headings have usable computed widths at 390px and 1280px.
- [ ] 2.5 Verify app shell sidebar/content layout has no horizontal overflow on mobile and desktop.

## 3. Auth Routing And Session Contract

- [ ] 3.1 Create file-based Astro API route handlers for `/api/auth/login`, `/api/auth/register`, `/api/auth/logout`, `/api/auth/refresh`, `/api/auth/google`, and `/api/auth/google/callback`.
- [ ] 3.2 Update login/register forms and handlers to support both JSON and `application/x-www-form-urlencoded` posts.
- [ ] 3.3 Persist issued refresh tokens to the user row during register, login, Google callback, and refresh.
- [ ] 3.4 Standardize cookie name and all readers/writers on one refresh token cookie.
- [ ] 3.5 Stop decrypting random refresh tokens as JWTs; validate page sessions and API access tokens through correct sources.
- [ ] 3.6 Update frontend protected API calls to use valid access token flow or centralized refresh-capable API client.
- [ ] 3.7 Verify unauthenticated page requests redirect to `/login` and unauthenticated protected APIs return JSON `401`.

## 4. API, Chat, And Settings Routes

- [ ] 4.1 Create file-based settings routes for `/api/settings/preferences`, `/api/settings/password`, and `/api/settings/unlink-google`.
- [ ] 4.2 Ensure receipt upload return URL has a serving route or returns a URL that can actually be fetched.
- [ ] 4.3 Fix chat request schema and frontend payload so confirmation data is accepted.
- [ ] 4.4 Rewrite SSE stream parsing to process complete event blocks and JSON `data:` payloads.
- [ ] 4.5 Ensure `/api/chat` sends auth and transitions correctly for message, confirmation, saved, normal, and error events.
- [ ] 4.6 Fix transaction search behavior so search is useful and does not require exact description equality unless intended by spec.

## 5. Database And Migrations

- [ ] 5.1 Reconcile Drizzle schema, existing SQL migrations, and migration journal before adding new migrations.
- [ ] 5.2 Remove or repair duplicate `personality` migration behavior without breaking already-applied databases.
- [ ] 5.3 Ensure users table migration includes `password_salt`, `refresh_token`, `personality`, and `theme`.
- [ ] 5.4 Add safe verification notes or script for checking local/remote D1 schema before migration apply.
- [ ] 5.5 Run migration generation/check workflow and confirm no unexpected schema drift.

## 6. Runtime Configuration

- [ ] 6.1 Add missing `APP_URL` and production JWT key documentation to `.env.example` without exposing secrets.
- [ ] 6.2 Replace placeholder KV namespace IDs in active Wrangler environments or document required setup as blocking.
- [ ] 6.3 Rename production Worker config from unrelated app name to Financier production.
- [ ] 6.4 Align Wrangler bindings with Astro adapter requirements for sessions/images or explicitly disable unsupported features.
- [ ] 6.5 Regenerate Worker types after binding/config changes.

## 7. Tests And Quality Gates

- [ ] 7.1 Add Vitest config so `@/*` aliases resolve in tests.
- [ ] 7.2 Fix existing API response tests and keep sensitive-detail redaction coverage.
- [ ] 7.3 Add auth route tests or smoke checks for login/register/refresh/logout behavior.
- [ ] 7.4 Add route smoke checks for public pages, Swagger/OpenAPI, protected page redirect, and protected API JSON `401`.
- [ ] 7.5 Add responsive smoke checks for login/register and app shell widths.
- [ ] 7.6 Run `npm run check` and confirm zero errors.
- [ ] 7.7 Run `npm test -- --run` and confirm zero failures.
- [ ] 7.8 Run `npm run build-development` and confirm successful build.
- [ ] 7.9 Start local dev server on an unused port and verify browser smoke checks pass.
