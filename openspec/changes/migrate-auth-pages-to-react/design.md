## Context

Financier uses Astro for file routing and React for interactive application UI. Login and register are currently inline Astro forms that submit directly to auth endpoints. That makes browser debugging poor: email/password failures appear as document navigations instead of visible fetch calls, and error messages depend on server response pages rather than React state.

Astro route files still matter for `/login` and `/register`; replacing the project router is out of scope. The repair is to make those route files thin shells that mount React auth UI.

## Goals / Non-Goals

**Goals:**
- Make login and register primary flows React-owned.
- Make email/password auth submit through `fetch()` with JSON payloads so `/api/auth/login` and `/api/auth/register` appear in browser Network tools.
- Show inline loading and error states without replacing the whole page.
- Keep Google auth available on both login and register with consistent button styling.
- Keep button contrast and layout consistent across light/dark themes.
- Add checks that catch regressions where auth quietly falls back to invisible form posts.

**Non-Goals:**
- Replace Astro as the app's file router.
- Rewrite protected app pages or dashboard routing.
- Change token format, refresh cookie semantics, or Google provider configuration.
- Add new identity providers.

## Decisions

### Keep Astro Route Wrappers

`src/pages/login.astro` and `src/pages/register.astro` remain as route entrypoints, import `Layout`, and mount React components with `client:only="react"` so the Cloudflare Worker does not server-render browser-owned auth UI.

Rationale: Astro owns routing in this project. A `.tsx` file directly under `src/pages` would change route semantics and may not share current layout/head behavior. Auth UI also reads browser state and submits fetches, so it should hydrate on the client instead of participating in Worker SSR.

Alternative considered: replace all `pages/**` with React. Rejected because API routes, sitemap, layouts, and SSR wrappers are Astro-native here.

### Provide SSR Fallback Markup

Each `client:only` auth island includes an Astro fallback slot that renders a matching semantic form before React mounts. The fallback uses the same auth classes and posts to the same auth endpoints.

Rationale: this keeps `/login` and `/register` meaningful to crawlers, no-JS clients, and users on slow connections without putting browser-only React code back into Worker SSR.

Alternative considered: no fallback. Rejected because client-only islands otherwise provide weak pre-hydration content.

### Build Shared React Auth Screen

Create a shared React component or small component set for login/register variants. It accepts mode-specific copy, endpoint, submit label, alternate link, and password constraints.

Rationale: login/register drift already caused inconsistent buttons. One component prevents future copy/styling divergence.

Alternative considered: separate LoginForm and RegisterForm with duplicated markup. Rejected because same fields, Google button, divider, error display, and layout should stay identical.

### Use JSON Fetch For Email Auth

React submit handler calls `fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) })`. On success, store access token using the existing client session pattern if required, then navigate to `/dashboard`.

Rationale: JSON fetch is visible in Network/XHR, supports predictable error parsing, and matches existing API behavior.

Alternative considered: keep form POST fallback as the primary path. Rejected because it hides useful debugging details and recreates the current failure mode.

### Treat Google As Navigation, Not Fetch

Google OAuth starts with `window.location.assign("/api/auth/google")`. The server builds the OAuth `redirect_uri` from `new URL(request.url).origin`, so local dev, preview, and deployed custom domains use the same origin the browser is actually visiting. Callback errors are read from `auth=error` and `message` query params on public/auth pages and shown in the React auth UI.

Rationale: OAuth is a browser redirect flow, not a JSON API call. Making it a fetch would fail due provider redirects and CORS.

Alternative considered: fetch `/api/auth/google` and follow JSON. Rejected because current endpoint correctly returns a redirect.

### Clone Responses Before Middleware Headers

Middleware adds `X-Request-ID` by returning a cloned `Response` with copied headers instead of mutating `next()` output directly. OAuth endpoints also create redirect responses with explicit `Location` headers instead of mutating `Response.redirect()` output when cookies must be attached.

Rationale: Worker and Astro redirect responses can expose immutable headers. Cloning keeps diagnostics headers and auth cookies without throwing `Can't modify immutable headers.`

## Risks / Trade-offs

- React auth UI can fail to hydrate -> keep semantic form markup, labels, and disabled states; run `npm run check`.
- Access token storage may be inconsistent with existing API client -> reuse current storage key/session helper or add one shared helper during implementation.
- Google callback currently redirects errors to `/` -> update callback target or auth pages to read error params where users can act on them.
- No-JS fallback may still be useful -> keep fallback only if it does not become the primary behavior or hide errors during normal hydrated use.

## Migration Plan

1. Add shared React auth UI and optional helper for auth JSON requests.
2. Replace inline login/register Astro forms with React component mounts.
3. Update Google callback error redirect to an auth page if needed.
4. Add smoke tests for fetch-based email auth and Google redirect button behavior.
5. Run `npm run check` and `npm test -- --run`.
