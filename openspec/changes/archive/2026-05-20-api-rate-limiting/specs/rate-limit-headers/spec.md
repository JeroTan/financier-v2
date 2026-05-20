## ADDED Requirements

### Requirement: 429 response format
The system SHALL return a 429 Too Many Requests response with a `RATE_LIMITED` error code when rate limits are exceeded.

#### Scenario: Rate limit exceeded response
- **WHEN** a request exceeds the rate limit
- **THEN** the response has status 429 with `{ error: { code: "RATE_LIMITED", message: "Too many requests. Please try again later." } }`

### Requirement: Retry-After header
The system SHALL include a `Retry-After` header in 429 responses indicating the number of seconds until the rate limit window resets.

#### Scenario: Retry-After included
- **WHEN** a 429 response is returned
- **THEN** the `Retry-After` header contains the seconds remaining in the current window

### Requirement: Rate limit info headers
The system SHALL include `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset` headers in all API responses.

#### Scenario: Rate limit headers present
- **WHEN** any API response is returned
- **THEN** the rate limit info headers are included
