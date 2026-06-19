## MODIFIED Requirements

### Requirement: Seed default categories
The system SHALL seed the standard default categories idempotently for each user and SHALL tolerate concurrent requests creating the same defaults.

#### Scenario: First-time user
- **WHEN** a user has no categories
- **THEN** the standard default categories are inserted and returned

#### Scenario: Categories already exist
- **WHEN** a user already has categories
- **THEN** the existing categories are returned without another default set

#### Scenario: Concurrent seeding
- **WHEN** two requests seed defaults for the same user
- **AND** one receives a D1/SQLite unique conflict
- **THEN** the conflict is recognized independent of the thrown object's prototype
- **AND** persisted categories are reloaded and returned

#### Scenario: Unrelated failure
- **WHEN** seeding fails because of a network, foreign-key, schema, or other non-unique error
- **THEN** the repository propagates the failure

### Requirement: Create custom category
The system SHALL keep custom category creation strict and user-scoped.

#### Scenario: Duplicate custom category
- **WHEN** a user creates a custom category that violates the applicable uniqueness rule
- **THEN** the API returns a conflict response
- **AND** the duplicate is not treated as default-seed recovery
