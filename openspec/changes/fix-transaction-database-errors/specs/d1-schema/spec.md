## MODIFIED Requirements

### Requirement: Users table
The system SHALL manage a `users` table through checked-in forward migrations with columns required by the application schema: `id`, `email`, `password_hash`, `password_salt`, `google_id`, `refresh_token`, `personality`, `theme`, `created_at`, and `updated_at`.

#### Scenario: Clean database migration
- **WHEN** migrations are applied to an empty D1 database
- **THEN** every column selected or written by `UserRepository` exists before the application serves requests

#### Scenario: Existing database migration
- **WHEN** the forward migration is applied to a database created from the initial migration
- **THEN** missing user columns are added without deleting existing users

### Requirement: Schema evolution
Checked-in migrations SHALL be the source of truth for schema evolution. Normal API requests SHALL NOT be responsible for bringing a deployed database up to the current schema.

#### Scenario: Current schema
- **WHEN** an API request starts against a fully migrated database
- **THEN** it performs no schema-altering statement

#### Scenario: Migration drift
- **WHEN** required columns or indexes are missing
- **THEN** readiness validation or deployment checks fail with actionable diagnostics
- **AND** the application does not silently rely on request-time repair
