# entity-api Specification

## Purpose
TBD - created by archiving change entity-card-list. Update Purpose after archive.
## Requirements
### Requirement: Get transactions endpoint
The system SHALL provide a `GET /api/transactions` endpoint that returns paginated transactions with filtering support.

#### Scenario: Transactions retrieved
- **WHEN** a GET request is made to `/api/transactions`
- **THEN** a paginated list of transactions is returned with `{ transactions, total, page, limit, totalPages }`

#### Scenario: Filtered transactions
- **WHEN** a GET request includes `?type=expense&search=coffee&startDate=2026-01-01&endDate=2026-01-31`
- **THEN** only matching transactions are returned

### Requirement: Query parameters
The system SHALL support the following query parameters: `type` (income|expense), `search` (string), `startDate` (ISO 8601), `endDate` (ISO 8601), `page` (integer, default 1), `limit` (integer, default 20).

#### Scenario: Default pagination
- **WHEN** no page or limit parameters are provided
- **THEN** page 1 with 20 results is returned

#### Scenario: Custom page and limit
- **WHEN** `?page=2&limit=10` is provided
- **THEN** the second page with 10 results is returned

### Requirement: Authenticated access
The system SHALL require a valid JWT token to access the transactions endpoint.

#### Scenario: Unauthenticated request
- **WHEN** a request is made without a valid JWT
- **THEN** an AUTH_REQUIRED error is returned

