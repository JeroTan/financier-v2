## ADDED Requirements

### Requirement: React auth screens
Login and register pages SHALL render their interactive form UI through React components.

#### Scenario: Login page renders React auth UI
- **WHEN** a user visits `/login`
- **THEN** the page renders a hydrated React login form with email, password, submit, Google sign-in, theme toggle, and register link

#### Scenario: Register page renders React auth UI
- **WHEN** a user visits `/register`
- **THEN** the page renders a hydrated React register form with email, password, submit, Google sign-in, theme toggle, and login link

### Requirement: Auth SSR fallback
Login and register pages SHALL include semantic server-rendered fallback form markup before React hydration.

#### Scenario: Login fallback is present
- **WHEN** `/login` is rendered before the React auth component mounts
- **THEN** the HTML contains a login form with email, password, submit, Google sign-in, theme toggle, and register link

#### Scenario: Register fallback is present
- **WHEN** `/register` is rendered before the React auth component mounts
- **THEN** the HTML contains a registration form with email, password, submit, Google sign-in, theme toggle, and login link

#### Scenario: Fallback can submit without JavaScript
- **WHEN** JavaScript has not loaded and a user submits the fallback form
- **THEN** the form posts to the matching `/api/auth/login` or `/api/auth/register` endpoint

### Requirement: Fetch-visible email auth
Email/password auth submissions SHALL use browser `fetch()` requests in the primary hydrated path.

#### Scenario: Login fetch is visible
- **WHEN** a user submits the hydrated login form
- **THEN** the browser issues a JSON `POST` fetch request to `/api/auth/login`

#### Scenario: Register fetch is visible
- **WHEN** a user submits the hydrated register form
- **THEN** the browser issues a JSON `POST` fetch request to `/api/auth/register`

### Requirement: Auth UI feedback
Auth screens SHALL show loading, success, and failure states without replacing the document.

#### Scenario: Request pending
- **WHEN** an auth request is in progress
- **THEN** the submit and Google buttons are disabled or visually pending to prevent duplicate attempts

#### Scenario: Request fails
- **WHEN** an auth request returns validation, rate limit, duplicate email, invalid credentials, or server error
- **THEN** the auth page displays a readable inline error message and remains on the same page

#### Scenario: Request succeeds
- **WHEN** an email/password auth request succeeds
- **THEN** the user is navigated to `/dashboard`

### Requirement: Auth visual consistency
Login and register auth controls SHALL use shared styling and accessible contrast in light and dark themes.

#### Scenario: Primary buttons match
- **WHEN** login and register pages are rendered
- **THEN** their primary auth buttons use the same layout, height, color system, loading behavior, and hover/focus treatment

#### Scenario: OAuth buttons match
- **WHEN** login and register pages are rendered
- **THEN** their Google OAuth buttons use the same layout, icon treatment, disabled state, and contrast behavior

### Requirement: OAuth redirects preserve mutable headers
Auth redirect responses SHALL allow middleware diagnostics headers and auth cookies to be attached without runtime header mutation failures.

#### Scenario: Google redirect URI uses request origin
- **WHEN** a user starts Google OAuth from a local, preview, or deployed origin
- **THEN** `/api/auth/google` sends `redirect_uri` as that request origin plus `/api/auth/google/callback`

#### Scenario: Google auth redirect enters provider flow
- **WHEN** a user starts Google OAuth from login or register
- **THEN** `/api/auth/google` returns a redirect response that middleware can tag with `X-Request-ID`

#### Scenario: Google callback sets session cookie
- **WHEN** Google OAuth callback succeeds
- **THEN** the callback redirects to the app with its refresh cookie attached and no `Can't modify immutable headers.` runtime error
