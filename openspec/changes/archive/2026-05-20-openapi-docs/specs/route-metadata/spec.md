## ADDED Requirements

### Requirement: routeDetail helper
The system SHALL provide a `routeDetail()` function in `src/server/openapi/route-metadata.ts` that accepts an object with: `summary`, `description`, `tags`, `auth`, `rateLimitClass`, `errorCodes`, `request`, and `response`.

#### Scenario: Route metadata declared
- **WHEN** a route calls `routeDetail()` with metadata
- **THEN** the metadata is registered for spec generation

#### Scenario: Auth flag set
- **WHEN** `routeDetail()` is called with `auth: true`
- **THEN** the route is marked as requiring authentication in the spec

### Requirement: Metadata fields
The system SHALL support the following metadata fields:
- `summary`: Short description of the endpoint (required)
- `description`: Detailed description (optional)
- `tags`: Array of tags for grouping (e.g., ["auth", "transactions"])
- `auth`: Boolean indicating if authentication is required
- `rateLimitClass`: Rate limit category (e.g., "chat", "data-read", "data-write")
- `errorCodes`: Array of possible error codes with descriptions
- `request`: Object with `body`, `query`, `params` Zod schemas
- `response`: Zod schema for the success response

#### Scenario: Full metadata declared
- **WHEN** a route declares all metadata fields
- **THEN** all fields appear in the generated OpenAPI spec

### Requirement: No duplicate metadata
The system SHALL enforce that `routeDetail()` is the single source of endpoint metadata. No duplicate metadata helpers SHALL be created.

#### Scenario: Single metadata source
- **WHEN** a route file imports `routeDetail()`
- **THEN** it uses this helper exclusively for OpenAPI metadata
