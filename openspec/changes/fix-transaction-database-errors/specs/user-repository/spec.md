## MODIFIED Requirements

### Requirement: Create user
The system SHALL create users through a migrated schema and SHALL report email or Google-ID uniqueness races as conflicts.

#### Scenario: Concurrent registration
- **WHEN** two registration requests attempt to create the same email concurrently
- **THEN** one user is created
- **AND** the losing request receives the existing email-conflict response rather than a framework error

### Requirement: Repository mutation result
User mutation methods SHALL report whether a matching user row was updated.

#### Scenario: Missing user during update
- **WHEN** a password, preference, refresh-token, Google-link, or unlink update matches no user
- **THEN** the repository returns a missing result
- **AND** the service does not report unconditional success

### Requirement: D1 error compatibility
User repository schema and constraint checks SHALL recognize supported D1 error-shaped values without requiring the local `Error` prototype.

#### Scenario: Cross-realm duplicate-column result
- **WHEN** concurrent compatibility checks receive a D1 duplicate-column error-shaped object
- **THEN** the known-safe race is recognized
- **AND** unrelated errors still propagate
