## 1. React Auth UI

- [x] 1.1 Create shared React auth screen component for login/register modes.
- [x] 1.2 Add shared Google icon/button, divider, loading, disabled, and inline error states.
- [x] 1.3 Read auth error query parameters and show user-safe messages on auth pages.
- [x] 1.4 Add SSR fallback form markup for login/register before React mounts.

## 2. Client Auth Flow

- [x] 2.1 Implement JSON fetch submit for `/api/auth/login` and `/api/auth/register`.
- [x] 2.2 Store returned access token with the existing authenticated API client/session mechanism.
- [x] 2.3 Navigate to `/dashboard` only after successful JSON auth response.
- [x] 2.4 Preserve entered email and reset pending state after validation, auth, rate limit, and server errors.

## 3. Astro Route Wrappers

- [x] 3.1 Replace inline login Astro form markup with React auth screen mount.
- [x] 3.2 Replace inline register Astro form markup with React auth screen mount.
- [x] 3.3 Keep route metadata, layout, theme bootstrap, and no horizontal/mobile overflow intact.
- [x] 3.4 Add `/signup` alias route to redirect to `/register`.

## 4. Google OAuth

- [x] 4.1 Start Google OAuth from React using top-level navigation to `/api/auth/google`.
- [x] 4.2 Update callback failure redirects to land on an auth page that displays the error.
- [x] 4.3 Verify Google button behavior is consistent on login and register.

## 5. Validation

- [x] 5.1 Add or update tests/smoke checks proving login/register issue fetch requests for email/password auth.
- [x] 5.2 Add smoke coverage for inline auth error display and successful dashboard navigation.
- [x] 5.3 Run `npm run check` and confirm zero errors.
- [x] 5.4 Run `npm test -- --run` and confirm zero failures.
- [x] 5.5 Review auth pages at mobile and desktop widths for button contrast and layout consistency.
