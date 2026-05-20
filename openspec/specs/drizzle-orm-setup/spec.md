# drizzle-orm-setup Specification

## Purpose
TBD - created by archiving change database-schema. Update Purpose after archive.
## Requirements
### Requirement: Drizzle configuration
The system SHALL configure Drizzle ORM with the Cloudflare D1 driver, connecting via the `env.DB` binding.

#### Scenario: Drizzle initialized
- **WHEN** the application starts
- **THEN** Drizzle is configured with the D1 binding and schema definitions

### Requirement: Schema definitions
The system SHALL define Drizzle schema files for all database tables (users, transactions, categories, goals) in a `src/db/schema/` directory.

#### Scenario: Schema files exist
- **WHEN** the project is built
- **THEN** all schema files are present and type-checked

### Requirement: Migration workflow
The system SHALL support database migrations via Drizzle Kit, with migration files stored in a `drizzle/migrations/` directory.

#### Scenario: Migration generated
- **WHEN** the schema is modified
- **THEN** a new migration file is generated via `drizzle-kit generate`

#### Scenario: Migration applied
- **WHEN** `wrangler d1 migrations apply` is run
- **THEN** the migration is applied to the D1 database

### Requirement: Type-safe queries
The system SHALL use Drizzle's type system for all database queries, ensuring compile-time type checking.

#### Scenario: Type-safe insert
- **WHEN** a transaction is inserted
- **THEN** the insert uses Drizzle's typed `insert` method with schema-defined types

#### Scenario: Type-safe select
- **WHEN** transactions are queried
- **THEN** the query uses Drizzle's typed `select` method with inferred result types

