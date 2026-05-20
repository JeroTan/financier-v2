## ADDED Requirements

### Requirement: Browser auth transport
The API client SHALL send authenticated requests using the token source chosen by the auth flow.

#### Scenario: Access token available
- **WHEN** the client has an access JWT
- **THEN** it sends `Authorization: Bearer <access JWT>` on protected API requests

#### Scenario: Cookie-backed refresh
- **WHEN** the access token is missing or expired but the refresh cookie exists
- **THEN** the client can refresh the access token before retrying an authenticated request

#### Scenario: HttpOnly refresh cookie not read
- **WHEN** the refresh token cookie is HttpOnly
- **THEN** browser code does not attempt to read it with `document.cookie`

### Requirement: API path construction
The API client SHALL construct paths without duplicating or dropping `/api`.

#### Scenario: Absolute API path
- **WHEN** `apiClient.get("/transactions")` is called
- **THEN** the request targets `/api/transactions`
