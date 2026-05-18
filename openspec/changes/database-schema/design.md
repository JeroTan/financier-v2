## Context

Financier needs a persistent data layer for transactions, categories, goals, and user accounts. Cloudflare D1 (SQLite) is the database with Drizzle ORM for type-safe queries. All server directories (`repositories/`, `dto/`) are empty. The wrangler.jsonc already has D1 bindings for both dev and production environments.

## Goals / Non-Goals

**Goals:**
- Define normalized D1 schema with tables for users, transactions, categories, goals
- Set up Drizzle ORM with schema files, migration workflow, and type-safe queries
- Create repository layer with CRUD operations per entity
- Establish DTO schemas with Zod validation for all API inputs/outputs
- Design indexes for common query patterns

**Non-Goals:**
- Multi-tenant data isolation beyond user_id filtering (single-user MVP)
- Soft deletes (hard deletes for MVP)
- Audit logging or change history
- Complex relational queries (joins kept minimal)

## Decisions

### 1. Drizzle ORM over Raw SQL

**Decision**: Use Drizzle ORM for all database operations.

**Rationale**: Type safety, migration management, and alignment with the existing tech stack. Drizzle's D1 driver is well-supported and the codebase already excludes `drizzle-orm` from Vite optimization, indicating intent.

**Alternatives considered**:
- Raw SQL: More control but no type safety, harder migrations
- Kysely: Good alternative but Drizzle has better Cloudflare D1 support

### 2. Schema Design

**Decision**: Use a normalized schema with separate tables for transactions, categories, goals, and users.

```
users ──< transactions >── categories (via category_id, nullable for custom)
users ──< goals
```

**Rationale**: Clean separation of concerns, easy to query per-user data, supports custom categories per user.

### 3. Currency Storage

**Decision**: Store amounts as REAL (floating point) in PHP. No multi-currency support in MVP.

**Rationale**: PRD states single currency (PHP). REAL is sufficient for personal finance precision at this scale.

**Alternatives considered**:
- INTEGER cents: More precise but adds conversion complexity
- DECIMAL: Not natively supported in SQLite

### 4. Category Design

**Decision**: Categories are user-scoped with a set of default categories seeded on first use. Users can create custom categories.

**Rationale**: Each user may want different categories. Defaults provide a good starting experience.

### 5. Date Storage

**Decision**: Store dates as ISO 8601 TEXT strings (e.g., "2026-05-18").

**Rationale**: SQLite has no native DATE type. TEXT is sortable, queryable, and easy to work with in JavaScript.

## Risks / Trade-offs

| Risk | Impact | Mitigation |
|------|--------|------------|
| D1 read latency at scale | Medium | Index common query patterns, paginate results |
| Schema migration failures | High | Test migrations in dev before production, keep migrations atomic |
| REAL precision for amounts | Low | PHP amounts with 2 decimal places fit within REAL precision for personal finance scale |
| No soft deletes | Medium | Acceptable for MVP — add in Phase 2 when editing/deletion is scoped |
