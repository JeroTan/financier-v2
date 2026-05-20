# api-client Specification

## Purpose
TBD - created by archiving change app-shell-routing. Update Purpose after archive.
## Requirements
### Requirement: API client utility
The system SHALL provide a typed `apiClient` utility that wraps `fetch` and automatically injects the JWT access token from cookies into the `Authorization` header.

#### Scenario: Request with auth
- **WHEN** `apiClient.get("/api/transactions")` is called
- **THEN** the request includes `Authorization: Bearer <token>` header

### Requirement: Typed responses
The system SHALL parse API responses into `ApiSuccess<T>` or `ApiError<D>` types, providing type safety for all API calls.

#### Scenario: Successful response parsed
- **WHEN** the API returns a 200 response
- **THEN** the response is parsed as `ApiSuccess<T>` with typed data

#### Scenario: Error response parsed
- **WHEN** the API returns a 4xx or 5xx response
- **THEN** the response is parsed as `ApiError<D>` with error details

### Requirement: Error throwing
The system SHALL throw an error when the API returns an error response, allowing callers to use try/catch for error handling.

#### Scenario: Error thrown
- **WHEN** the API returns a 401 response
- **THEN** the apiClient throws an error that the caller can catch

### Requirement: Request ID tracking
The system SHALL include the request ID from API error responses in thrown errors for debugging.

#### Scenario: Request ID included
- **WHEN** an API error includes a requestId
- **THEN** the thrown error includes the requestId in its details

