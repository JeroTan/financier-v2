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
