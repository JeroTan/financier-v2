## Why

The PRD specifies Zod validation on all API inputs and the codebase has a `src/server/openapi/` directory with a `_readme.md` outlining the OpenAPI documentation approach. Without a centralized OpenAPI spec, route metadata, and Swagger UI endpoint, there's no single source of truth for API contracts. This makes it hard for frontend developers to know what endpoints exist, what schemas they accept, and what responses to expect.

## What Changes

- Create OpenAPI spec generator that builds a full OpenAPI 3.1 document from route metadata
- Implement `routeDetail()` helper for declaring endpoint summaries, descriptions, tags, auth, rate limits, error codes
- Create `GET /api/openapi.json` endpoint serving the generated spec
- Create `GET /api/docs` page serving Swagger UI
- Define route metadata for all API endpoints across auth, transactions, stats, settings, chat, and rate limiting
- Establish camelCase DTO convention for public API responses (snake_case in D1 → camelCase in responses)

## Capabilities

### New Capabilities
- `openapi-spec-generation`: OpenAPI 3.1 spec builder that aggregates route metadata into a single JSON document
- `route-metadata`: `routeDetail()` helper for declaring endpoint summaries, descriptions, tags, auth, rate limits, and error codes
- `swagger-ui`: Swagger UI served at `/api/docs` for interactive API exploration
- `openapi-endpoint`: `GET /api/openapi.json` endpoint serving the generated OpenAPI spec

### Modified Capabilities
<!-- No existing specs to modify -->

## Impact

- New files in `src/server/openapi/` (spec generator, route metadata, Swagger UI page)
- All API route files in `src/pages/api/` will import `routeDetail()` for metadata
- New public endpoints: `GET /api/openapi.json`, `GET /api/docs`
- Depends on `database-schema` for Zod DTO schemas (used in OpenAPI response schemas)
- Depends on `auth-setup` for auth endpoint metadata
- Depends on `app-shell-routing` for API route structure
