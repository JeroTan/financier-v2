## ADDED Requirements

### Requirement: Static validation gate
The project SHALL provide validation commands that pass before stabilization is complete.

#### Scenario: Type check passes
- **WHEN** `npm run check` is executed
- **THEN** Astro type checking completes with zero errors

#### Scenario: Tests pass
- **WHEN** `npm test -- --run` is executed
- **THEN** Vitest discovers and runs the test suite with zero failures

#### Scenario: Development build passes
- **WHEN** `npm run build-development` is executed
- **THEN** type checking and Astro build complete successfully

### Requirement: Route smoke gate
The project SHALL include smoke checks for public, auth, API docs, and protected routes.

#### Scenario: Public routes render
- **WHEN** smoke checks request `/`, `/login`, `/register`, `/api/docs`, and `/api/openapi.json`
- **THEN** each public route returns a non-error response with expected content type

#### Scenario: Protected route redirects
- **WHEN** smoke checks request an authenticated page without a session
- **THEN** the response redirects to `/login`

#### Scenario: Protected API returns JSON auth error
- **WHEN** smoke checks request a protected API without auth
- **THEN** the response is `401` JSON and not an HTML redirect

### Requirement: Responsive layout gate
The project SHALL verify key pages at mobile and desktop widths for broken layout metrics.

#### Scenario: Login width remains usable
- **WHEN** `/login` is rendered at 390px and 1280px widths
- **THEN** the form container and inputs have usable widths and no zero-width layout

#### Scenario: App shell remains responsive
- **WHEN** authenticated app pages are rendered at mobile and desktop widths
- **THEN** content does not overflow horizontally and mobile navigation remains accessible
