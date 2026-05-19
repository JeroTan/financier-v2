## ADDED Requirements

### Requirement: OpenAPI spec generator
The system SHALL provide a spec generator that aggregates route metadata from all API routes into a single OpenAPI 3.1 JSON document.

#### Scenario: Spec generated
- **WHEN** the spec generator runs
- **THEN** it produces a valid OpenAPI 3.1 document with all registered routes

#### Scenario: Spec includes info
- **WHEN** the spec is generated
- **THEN** it includes `openapi: "3.1.0"`, `info` with title, version, and description

### Requirement: Zod to OpenAPI schema conversion
The system SHALL convert Zod v4 schemas to OpenAPI 3.1 schema objects for request bodies, query parameters, path parameters, and response schemas.

#### Scenario: Object schema converted
- **WHEN** a Zod object schema is converted
- **THEN** the resulting OpenAPI schema has `type: "object"` with `properties` and `required` arrays

#### Scenario: Enum schema converted
- **WHEN** a Zod enum schema is converted
- **THEN** the resulting OpenAPI schema has `type: "string"` with an `enum` array

#### Scenario: Optional field handled
- **WHEN** a Zod optional field is converted
- **THEN** the field is excluded from the `required` array

### Requirement: Component schemas
The system SHALL register all DTO schemas as reusable components under `#/components/schemas/` in the OpenAPI spec.

#### Scenario: DTO registered as component
- **WHEN** the spec is generated
- **THEN** DTO schemas like `CreateTransaction`, `User`, `Category` are available as reusable components
