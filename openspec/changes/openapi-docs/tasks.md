## 1. Setup Infrastructure

- [ ] 1.1 Install `swagger-ui-dist` dependency
- [ ] 1.2 Create `src/server/openapi/route-metadata.ts` with `routeDetail()` function
- [ ] 1.3 Implement metadata registry that stores route details by path+method
- [ ] 1.4 Create `src/server/openapi/spec-generator.ts` with OpenAPI 3.1 document builder
- [ ] 1.5 Implement Zod v4 to OpenAPI 3.1 schema conversion (object, string, number, boolean, enum, array, optional)
- [ ] 1.6 Register DTO schemas as reusable components under `#/components/schemas/`
- [ ] 1.7 Add security scheme definition for Bearer JWT auth
- [ ] 1.8 Cache generated spec in memory with regeneration on demand

## 2. Endpoints

- [ ] 2.1 Create `GET /api/openapi.json` endpoint serving the generated spec
- [ ] 2.2 Set `Content-Type: application/json` header
- [ ] 2.3 Exempt from authentication middleware
- [ ] 2.4 Create `src/pages/api/docs.astro` page serving Swagger UI HTML
- [ ] 2.5 Configure Swagger UI to load spec from `/api/openapi.json`
- [ ] 2.6 Configure Swagger UI "Authorize" button for Bearer JWT auth
- [ ] 2.7 Exempt Swagger UI from authentication middleware

## 3. Define ALL Endpoint Schemas

- [ ] 3.1 Define `routeDetail()` for POST `/api/auth/register` — body schema, response schema, error codes
- [ ] 3.2 Define `routeDetail()` for POST `/api/auth/login` — body schema, response schema, error codes
- [ ] 3.3 Define `routeDetail()` for POST `/api/auth/logout` — auth required, response schema
- [ ] 3.4 Define `routeDetail()` for POST `/api/auth/refresh` — response schema, error codes
- [ ] 3.5 Define `routeDetail()` for GET `/api/auth/google` — public, redirect response
- [ ] 3.6 Define `routeDetail()` for GET `/api/auth/google/callback` — public, query params, response
- [ ] 3.7 Define `routeDetail()` for POST `/api/chat` — body schema (messageTrail, message, image), SSE response, error codes
- [ ] 3.8 Define `routeDetail()` for POST `/api/transactions` — body schema, response schema, error codes
- [ ] 3.9 Define `routeDetail()` for GET `/api/transactions` — query params (type, search, dateRange, pagination), paginated response schema
- [ ] 3.10 Define `routeDetail()` for POST `/api/receipts` — multipart body, response with URL
- [ ] 3.11 Define `routeDetail()` for GET `/api/stats` — query params (period, date), response schema (income/expenses/net)
- [ ] 3.12 Define `routeDetail()` for GET `/api/settings` — auth required, response schema (profile)
- [ ] 3.13 Define `routeDetail()` for PUT `/api/settings/password` — body schema, response, error codes
- [ ] 3.14 Define `routeDetail()` for PUT `/api/settings/preferences` — body schema (personality, theme)
- [ ] 3.15 Define `routeDetail()` for POST `/api/settings/unlink-google` — auth required

## 4. Verify

- [ ] 4.1 Verify `/api/openapi.json` returns valid OpenAPI 3.1 spec with ALL endpoint schemas
- [ ] 4.2 Verify `/api/docs` renders Swagger UI with all endpoints visible
- [ ] 4.3 Verify all endpoints have proper tags, summaries, body/response schemas, error codes
- [ ] 4.4 Test "Try it out" with a valid JWT token
