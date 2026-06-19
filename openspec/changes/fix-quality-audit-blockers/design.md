## Context

The audit found systemic integration failures across Astro routing, Cloudflare bindings, authentication, Tailwind v4 tokens, tests, migrations, and chat streaming. The app has many existing capability specs, but implementation drift means core user journeys fail before business logic can be trusted.

Current blockers:
- `astro check` fails with layout imports, `Astro.env`, and browser global type errors.
- Auth endpoints are implemented as path switches inside `index.ts`, while forms and clients call nested Astro routes that do not exist.
- Refresh tokens are random strings, but middleware tries to decrypt them as JWTs.
- App pages read a `refresh_token` cookie, but server writes `refreshToken`.
- Tailwind design tokens override Tailwind spacing names, collapsing `.max-w-md` and `.max-w-lg` to 24-40px.
- shadcn-derived components reference token aliases not declared in Tailwind v4.
- D1 migrations contain duplicate column changes and journal drift.
- Vitest has no alias config, so tests cannot import `@/*`.

## Goals / Non-Goals

**Goals:**
- Make `npm run check`, `npm test -- --run`, and development build pass.
- Restore login/register, protected routes, authenticated APIs, landing page, Swagger docs, and responsive layout.
- Define one coherent browser/session contract: access token for API auth, refresh token for renewal, consistent cookie names, and redirect/JSON behavior.
- Make Tailwind v4 tokens compatible with existing component classes without zero-width layout regressions.
- Make migrations safe for fresh and existing D1 databases.
- Add smoke checks that catch broken routes, auth, and responsive layout before handoff.

**Non-Goals:**
- Redesign product UI beyond fixing broken responsiveness and token resolution.
- Replace Cloudflare, Astro, React, Drizzle, or Tailwind.
- Add new finance features.
- Rotate production secrets as part of code changes.

## Decisions

### Use Explicit Astro Route Files For Nested API Paths

Create route files for paths actually used by forms and clients, such as `/api/auth/login`, `/api/auth/register`, `/api/auth/logout`, `/api/auth/refresh`, `/api/auth/google`, `/api/auth/google/callback`, `/api/settings/preferences`, `/api/settings/password`, and `/api/settings/unlink-google`.

Rationale: Astro routes are file-based. Path switching inside `src/pages/api/auth/index.ts` does not serve nested routes.

Alternative considered: change all clients to call `/api/auth` with an action field. Rejected because current specs and OpenAPI metadata already describe nested endpoints.

### Separate Access Token And Refresh Token Responsibilities

Use access JWTs for `Authorization: Bearer <accessToken>` and middleware/API validation. Use refresh tokens only for renewal and revocation. Store refresh tokens in HttpOnly Secure cookies, and persist them to users table when issued.

Rationale: Random refresh token strings cannot be decrypted as JWTs. Existing specs already distinguish access JWT and refresh token.

Alternative considered: make refresh token a JWT and use it everywhere. Rejected because refresh tokens are long-lived and should not become the default API bearer credential.

### Support Form Posts Without Breaking JSON Clients

Login/register handlers accept JSON and `application/x-www-form-urlencoded`. Form success sets refresh cookie and redirects to `/dashboard`; JSON success returns tokens/data.

Rationale: public forms are currently plain HTML forms. React/API clients may still need JSON.

Alternative considered: convert login/register pages to hydrated React forms only. Rejected because SSR form fallback is simpler and safer.

### Use Tailwind v4 Compatible Token Names

Keep design semantic tokens (`--app-spacing-md`, `--surface-*`, `--on-*`) separate from Tailwind core tokens (`--spacing-md`, `--radius-md`) and define compatibility aliases (`--color-card`, `--color-muted`, `--color-primary-foreground`, `--color-gold-500`, etc.).

Rationale: Tailwind v4 maps classes like `.max-w-md` to `--spacing-md`; overriding that token breaks core layout utilities.

Alternative considered: replace all shadcn class names with custom Liquid Gold names. Rejected as high churn; alias layer is lower risk.

### Keep Migrations Append-Only And Journal-Synced

Do not edit applied migrations blindly. Add repair migration(s) only where needed, remove untracked duplicate files or register them correctly before apply, and document remote development migration verification.

Rationale: D1 remote databases may already have some migrations applied. Duplicate `ADD COLUMN personality` can fail.

Alternative considered: rebuild migration history from scratch. Rejected because it risks remote database drift.

### Repair Stale Users Columns Before Auth Queries

Before user repository reads or writes, inspect `PRAGMA table_info(users)` and add missing auth/settings columns: `password_salt`, `refresh_token`, `personality`, and `theme`. Cache successful repair per D1 binding and allow retry after repair failure.

Rationale: some remote development or production D1 databases were created before current `users` columns existed. `CREATE TABLE IF NOT EXISTS` will not add columns to existing tables, so register/login/Google auth can fail even when source schema looks correct.

Alternative considered: rely only on manual D1 reset or migration re-apply. Rejected because it breaks existing user data and does not help stale deployed databases during auth.

### Quality Gates Become Release Criteria

Add a small validation matrix: type-check, tests, build, route smoke checks, auth smoke checks, and viewport/layout probes for key pages.

Rationale: AI-generated code regressed basic integration surfaces. Gates prevent repeating same class of failure.

Alternative considered: rely on manual review only. Rejected because current failures are mechanical and should be automated.

## Risks / Trade-offs

- Existing remote D1 schema may differ from checked-in migrations -> verify with non-destructive remote schema queries before applying repair migration.
- Changing auth token flow may require updating every frontend call site -> centralize token handling in API client and pass session data consistently.
- Supporting HTML and JSON auth responses adds branching -> keep request parsing/response helpers shared.
- Tailwind alias layer may mask future token misuse -> add responsive computed-style smoke checks for login/app pages.
- Cloudflare AI/KV/R2 bindings can slow smoke tests -> keep fast unit checks separate from remote Cloudflare integration checks.

## Migration Plan

1. Add specs and tasks for stabilization.
2. Fix type/build blockers first so diagnostics become reliable.
3. Repair Tailwind token aliases and verify login/register widths at mobile and desktop.
4. Repair route files and auth token contract.
5. Repair migrations and Wrangler/env config.
6. Add Vitest alias config and smoke validation scripts.
7. Run validation matrix.
8. For D1, inspect remote schema before applying any repair migration; rollback by pausing deploy and reverting code while leaving existing applied migrations intact.

## Open Questions

- Should access tokens be returned only in JSON responses, or also stored in a readable cookie for SSR page hydration?
- Should public Swagger docs remain enabled in production or be restricted after launch?
- Cloudflare-backed development resources are remote by default. Do not accept bindings without explicit remote behavior as the project default.
