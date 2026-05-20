## ADDED Requirements

### Requirement: Rate limiting middleware
The system SHALL implement a rate limiting middleware that tracks request counts per IP address per endpoint category using the `RATE_LIMITER` KV namespace.

#### Scenario: Request within limit
- **WHEN** an IP makes a request within the rate limit
- **THEN** the request proceeds to the handler

#### Scenario: Request exceeds limit
- **WHEN** an IP exceeds the rate limit for an endpoint category
- **THEN** the request is rejected with a 429 status

### Requirement: Endpoint category classification
The system SHALL classify API endpoints into categories for rate limiting:
- `chat`: `/api/chat`
- `data-write`: `/api/transactions` (POST, PUT, DELETE)
- `data-read`: `/api/transactions` (GET), `/api/stats`, `/api/entity`
- `settings`: `/api/settings`

#### Scenario: Chat endpoint classified
- **WHEN** a request hits `/api/chat`
- **THEN** it is rate limited under the `chat` category

#### Scenario: Data read endpoint classified
- **WHEN** a request hits `GET /api/transactions`
- **THEN** it is rate limited under the `data-read` category

### Requirement: Exempt endpoints
The system SHALL exempt health checks, static assets, and authentication endpoints from general rate limiting (auth endpoints have their own rate limiting in `auth-setup`).

#### Scenario: Health check exempt
- **WHEN** a request hits a health check endpoint
- **THEN** no rate limiting is applied
