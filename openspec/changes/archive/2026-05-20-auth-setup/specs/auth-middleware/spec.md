## ADDED Requirements

### Requirement: JWT validation middleware
The system SHALL provide middleware that validates the JWT access token from the Authorization header and attaches the user context to the request.

#### Scenario: Valid JWT
- **WHEN** a request includes a valid JWT in the Authorization header
- **THEN** the middleware attaches the user_id to the request context and passes through

#### Scenario: Missing JWT
- **WHEN** a request has no Authorization header
- **THEN** the middleware returns an AUTH_REQUIRED error

#### Scenario: Invalid JWT
- **WHEN** a request includes an invalid or expired JWT
- **THEN** the middleware returns an UNAUTHORIZED error

### Requirement: Protected route enforcement
The system SHALL apply the auth middleware to all API routes except the landing page, auth endpoints, and public health checks.

#### Scenario: Protected route accessed without auth
- **WHEN** an unauthenticated request hits a protected route
- **THEN** an AUTH_REQUIRED error is returned

#### Scenario: Protected route accessed with auth
- **WHEN** an authenticated request hits a protected route
- **THEN** the request proceeds with user context available
