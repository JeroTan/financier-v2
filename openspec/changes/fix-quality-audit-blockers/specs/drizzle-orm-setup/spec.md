## ADDED Requirements

### Requirement: Migration integrity
Drizzle migration files and metadata SHALL apply cleanly to fresh databases and avoid duplicate schema operations.

#### Scenario: Fresh migration apply
- **WHEN** migrations are applied to an empty D1 database
- **THEN** all tables, columns, indexes, and metadata are created without duplicate-column errors

#### Scenario: Existing migration apply
- **WHEN** migrations are applied to a database that has completed earlier tracked migrations
- **THEN** new migrations apply without attempting to re-add existing columns

#### Scenario: Journal consistency
- **WHEN** migration files exist in `drizzle/migrations`
- **THEN** the migration journal reflects the intended applied order or untracked files are removed
