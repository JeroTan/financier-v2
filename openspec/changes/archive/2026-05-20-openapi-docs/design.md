## Context

The `src/server/openapi/_readme.md` establishes the approach: use `routeDetail()` from `route-metadata.ts` for endpoint metadata (summaries, descriptions, tags, auth, rate limits, error codes). Route-specific schemas stay in `src/pages/api/**`. The codebase uses Zod v4 for validation. Public API responses use camelCase while D1 uses snake_case. No OpenAPI spec generator or Swagger UI exists yet.

## Goals / Non-Goals

**Goals:**
- OpenAPI 3.1 spec generated from route metadata and Zod schemas
- `GET /api/openapi.json` endpoint serving the spec
- `GET /api/docs` page serving Swagger UI
- `routeDetail()` helper for declaring endpoint metadata
- All API endpoints documented with params, query, body, response schemas

**Non-Goals:**
- Auto-generating route handlers from OpenAPI spec (spec is documentation, not source of truth)
- API client code generation
- Versioned API paths (single version for MVP)

## Decisions

### 1. Spec Generation Approach

**Decision**: Build the OpenAPI spec at runtime by scanning route metadata files. Each route exports a `routeDetail()` call that provides operation metadata. A generator aggregates these into a single OpenAPI document.

**Rationale**: Keeps the spec in sync with actual routes. No separate YAML/JSON file to maintain. Zod schemas from DTOs are converted to OpenSchema components.

**Alternatives considered**:
- Static YAML file: Easy to drift from actual implementation
- OpenAPI-first codegen: Inverts the flow, loses Zod validation benefits

### 2. Swagger UI

**Decision**: Serve Swagger UI via an Astro page at `/api/docs` that loads the spec from `/api/openapi.json`. Use the `swagger-ui-dist` npm package.

**Rationale**: Standard, well-maintained, zero-config. The Astro page is a thin wrapper around the Swagger UI CDN bundle.

### 3. CamelCase Convention

**Decision**: All public API JSON uses camelCase. Database rows (snake_case) are mapped to camelCase DTOs before returning. The OpenAPI spec reflects camelCase field names.

**Rationale**: JavaScript/TypeScript convention. Matches the existing `ApiSuccess<T>` / `ApiError<D>` response types.

### 4. Route Metadata Structure

**Decision**: `routeDetail()` accepts an object with: `summary`, `description`, `tags`, `auth` (boolean), `rateLimitClass`, `errorCodes`, `request` (body/query/params Zod schemas), `response` (Zod schema).

**Rationale**: Single source of truth per endpoint. The helper is imported by each route file and consumed by the spec generator.

## Risks / Trade-offs

| Risk | Impact | Mitigation |
|------|--------|------------|
| Spec generation adds startup latency | Low | Cache the generated spec, regenerate only on route changes |
| Zod v4 to OpenAPI 3.1 schema conversion edge cases | Medium | Handle common Zod types first, fall back to `object` for complex types |
| Swagger UI adds bundle size | Low | Served as a separate page, not part of the main app bundle |
