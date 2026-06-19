## MODIFIED Requirements

### Requirement: Protected route enforcement
The system SHALL authenticate protected API and page requests while distinguishing invalid authentication from database service failure.

#### Scenario: Invalid session
- **WHEN** the session token is absent, revoked, or not associated with a user
- **THEN** the request receives the documented authentication failure behavior

#### Scenario: Database unavailable during API authentication
- **WHEN** session authentication requires D1
- **AND** D1 is unavailable
- **THEN** the API returns a retryable service-unavailable JSON error with a request ID
- **AND** does not report the user as unauthorized

#### Scenario: Database unavailable during page authentication
- **WHEN** a protected page requires a D1 session lookup
- **AND** D1 is unavailable
- **THEN** the application returns a service error response
- **AND** does not redirect the user to login as if the session were invalid
