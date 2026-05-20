## ADDED Requirements

### Requirement: Type-safe Swagger globals
The Swagger UI page SHALL use inline script declarations or local types so global browser symbols do not fail Astro type checking.

#### Scenario: Swagger global available
- **WHEN** `/api/docs` loads in a browser
- **THEN** Swagger UI initializes from `/api/openapi.json`

#### Scenario: Astro check passes
- **WHEN** `astro check` analyzes `/api/docs`
- **THEN** `SwaggerUIBundle` and `window.ui` do not produce TypeScript errors
