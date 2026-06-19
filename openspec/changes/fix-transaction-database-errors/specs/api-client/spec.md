## MODIFIED Requirements

### Requirement: Error responses
The API client SHALL preserve HTTP status, stable error code, public message, and request ID for D1-backed API failures.

#### Scenario: Structured database service failure
- **WHEN** an endpoint returns the retryable database error envelope
- **THEN** the client throws an API error containing the status, code, message, and request ID

#### Scenario: Unexpected non-JSON server failure
- **WHEN** a server returns a non-JSON failure
- **THEN** the client throws a generic HTTP error
- **AND** retains the response status and `X-Request-ID` when present
