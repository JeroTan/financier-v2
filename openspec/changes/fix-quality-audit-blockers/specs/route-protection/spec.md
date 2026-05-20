## ADDED Requirements

### Requirement: File-based public route exemptions
Public route exemptions SHALL include actual Astro route files and nested auth endpoints.

#### Scenario: Nested auth route public
- **WHEN** an unauthenticated request hits `/api/auth/login`, `/api/auth/register`, `/api/auth/refresh`, `/api/auth/google`, or `/api/auth/google/callback`
- **THEN** middleware allows the request to reach the route handler

#### Scenario: Public docs route public
- **WHEN** an unauthenticated request hits `/api/docs` or `/api/openapi.json`
- **THEN** middleware allows the request to reach the route handler

### Requirement: Protected response mode
Protected routes SHALL use response behavior appropriate to route type.

#### Scenario: Page request without session
- **WHEN** an unauthenticated browser request hits an app page
- **THEN** the response redirects to `/login`

#### Scenario: API request without session
- **WHEN** an unauthenticated request hits a protected API
- **THEN** the response is `401` JSON
