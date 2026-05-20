# route-protection Specification

## Purpose
TBD - created by archiving change app-shell-routing. Update Purpose after archive.
## Requirements
### Requirement: Auth middleware
The system SHALL implement Astro middleware that checks for a valid JWT access token on all requests to authenticated routes.

#### Scenario: Valid JWT
- **WHEN** a request includes a valid JWT cookie
- **THEN** the request proceeds to the page handler

#### Scenario: Missing JWT
- **WHEN** a request has no JWT cookie
- **THEN** the user is redirected to `/login`

#### Scenario: Expired JWT
- **WHEN** a request includes an expired JWT
- **THEN** the user is redirected to `/login`

### Requirement: Public route exemption
The system SHALL exempt the following routes from authentication: `/`, `/login`, `/register`, `/api/auth/*`, and static assets.

#### Scenario: Public route accessible
- **WHEN** an unauthenticated user visits `/login`
- **THEN** the page renders without redirect

#### Scenario: API auth routes accessible
- **WHEN** a request is made to `/api/auth/login`
- **THEN** the request proceeds without authentication check

### Requirement: API route exemption
The system SHALL exempt `/api/*` routes from the redirect behavior. API routes SHALL return 401 UNAUTHORIZED responses instead of redirecting.

#### Scenario: API route without auth
- **WHEN** an unauthenticated request hits `/api/transactions`
- **THEN** a 401 UNAUTHORIZED response is returned (not a redirect)

