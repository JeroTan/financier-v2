## Why

The Financier app needs a persistent data layer for transactions, categories, goals, and user accounts. Cloudflare D1 (SQLite) is the chosen database, but no schema, migrations, or Drizzle ORM configuration exist yet. All server directories (`repositories/`, `dto/`) are empty. This is the foundation that every other feature depends on.

## What Changes

- Define D1 database schema with tables: users, transactions, categories, goals
- Set up Drizzle ORM with type-safe queries and migrations
- Create repository layer for data access (CRUD operations per entity)
- Establish DTO schemas with Zod validation for all API inputs/outputs
- Design indexes for common query patterns (user + date, user + type, user + category)

## Capabilities

### New Capabilities
- `d1-schema`: Database table definitions, relationships, constraints, and indexes
- `drizzle-orm-setup`: Drizzle configuration, schema files, migration workflow
- `transaction-repository`: CRUD operations for transactions with filtering, pagination, and aggregation
- `category-repository`: CRUD operations for categories including custom category creation
- `goal-repository`: CRUD operations for goals with progress calculation support
- `user-repository`: User account CRUD operations (auth data, settings, preferences)

### Modified Capabilities
<!-- No existing specs to modify -->

## Impact

- New files in `src/server/repositories/`, `src/server/dto/`
- Drizzle schema files in a new `src/db/schema/` directory
- Migration files in `drizzle/migrations/`
- `wrangler.jsonc` already has D1 bindings configured for dev and production
- Blocks all features that read/write data: AI chat, manual entry, stats dashboard, entity list
