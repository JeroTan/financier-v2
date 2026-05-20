# openapi-endpoint Specification

## Purpose
TBD - created by archiving change openapi-docs. Update Purpose after archive.
## Requirements
### Requirement: OpenAPI JSON endpoint
The system SHALL provide a `GET /api/openapi.json` endpoint that returns the generated OpenAPI 3.1 spec as JSON.

#### Scenario: Spec served
- **WHEN** a GET request is made to `/api/openapi.json`
- **THEN** the response has `Content-Type: application/json` and contains the full OpenAPI spec

#### Scenario: Spec is cached
- **WHEN** the endpoint is called multiple times
- **THEN** the spec is served from cache, not regenerated each time

### Requirement: Public access
The system SHALL allow unauthenticated access to the OpenAPI spec endpoint.

#### Scenario: Unauthenticated access
- **WHEN** an unauthenticated request is made to `/api/openapi.json`
- **THEN** the spec is returned without requiring authentication

