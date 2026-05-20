## ADDED Requirements

### Requirement: Unified auth context
The auth middleware SHALL attach a reliable user context for pages and API handlers after successful validation.

#### Scenario: API bearer token
- **WHEN** a protected API request includes a valid access JWT in the Authorization header
- **THEN** the middleware or route auth helper exposes `userId` and `email`

#### Scenario: Page session token
- **WHEN** a protected page request has a valid server-side session derived from the refresh cookie
- **THEN** the page renders with `userId` and `userEmail` in locals

#### Scenario: Invalid token source
- **WHEN** an access JWT is missing or invalid
- **THEN** protected APIs return `401` and protected pages redirect to `/login`
