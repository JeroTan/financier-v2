# swagger-ui Specification

## Purpose
TBD - created by archiving change openapi-docs. Update Purpose after archive.
## Requirements
### Requirement: Swagger UI page
The system SHALL serve Swagger UI at `GET /api/docs` for interactive API exploration.

#### Scenario: Swagger UI served
- **WHEN** a GET request is made to `/api/docs`
- **THEN** an HTML page with Swagger UI is returned

#### Scenario: Swagger UI loads spec
- **WHEN** the Swagger UI page loads
- **THEN** it fetches the spec from `/api/openapi.json` automatically

### Requirement: Public access
The system SHALL allow unauthenticated access to the Swagger UI page.

#### Scenario: Unauthenticated access
- **WHEN** an unauthenticated request is made to `/api/docs`
- **THEN** the Swagger UI page is returned without requiring authentication

### Requirement: Interactive features
The system SHALL support Swagger UI's interactive features: trying out endpoints, viewing request/response schemas, and authentication via the "Authorize" button.

#### Scenario: Try it out
- **WHEN** a user clicks "Try it out" on an endpoint
- **THEN** they can fill in parameters and execute the request

#### Scenario: Authorize button
- **WHEN** a user clicks "Authorize" and enters a JWT token
- **THEN** subsequent requests include the token in the Authorization header

