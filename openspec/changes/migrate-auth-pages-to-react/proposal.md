## Why

Login and register pages currently rely on Astro HTML form posts, so failures show as page navigations and are hard to trace in browser Network/XHR tools. Auth UI should be React-driven like the rest of the interactive app, with visible fetch requests, predictable errors, and one shared client flow.

## What Changes

- Move login/register UI from inline Astro markup to React components mounted by thin Astro route wrappers.
- Submit email/password login and registration through `fetch()` JSON requests to `/api/auth/login` and `/api/auth/register`.
- Surface auth errors inline without full page replacement, including validation, rate limit, duplicate email, invalid credentials, and server failures.
- Keep Google OAuth as a top-level redirect, but trigger it from React with loading state and clear callback failure handling.
- Preserve no-JavaScript fallback only if it does not hide network/debug visibility for the primary React path.
- Normalize auth button layout, labels, disabled/loading states, and contrast across login/register.
- Add smoke coverage that proves auth pages issue fetch requests for email/password auth and redirect correctly after success.

## Capabilities

### New Capabilities
- `auth-client-ui`: React auth page UI, client-side request handling, loading/error states, and debuggable browser network behavior.

### Modified Capabilities
- `email-password-auth`: Login/register requirements change from server-form-first behavior to JSON fetch-first client behavior.
- `google-oauth`: Google sign-in starts from React UI with consistent loading/error affordances and callback error surfacing.
- `page-routing`: Auth routes remain Astro file routes, but route content becomes React-owned UI rather than inline Astro form markup.

## Impact

Affected code: `src/pages/login.astro`, `src/pages/register.astro`, new auth React components/hooks, auth API request handling, shared button/auth styles, tests/smoke checks. APIs stay on `/api/auth/login`, `/api/auth/register`, and `/api/auth/google`; request format for primary email/password flow becomes JSON.
