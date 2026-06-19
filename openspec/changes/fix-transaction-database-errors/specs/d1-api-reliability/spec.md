## ADDED Requirements

### Requirement: Explicit D1 development mode
The system SHALL use local D1 for normal local development and SHALL require an explicit command or configuration choice to use a deployed remote D1 database.

#### Scenario: Normal local development
- **WHEN** the developer runs the standard development command
- **THEN** D1 reads and writes use the local persisted database
- **AND** local requests do not depend on network access to the deployed development database

#### Scenario: Explicit remote development
- **WHEN** the developer runs the documented remote-development command
- **THEN** D1 calls are routed to the deployed development database
- **AND** the command clearly identifies that remote data may be modified

### Requirement: Stable database API failures
D1-backed JSON endpoints SHALL map database failures to the standard API error envelope and include the request ID response header.

#### Scenario: Transient D1 transport failure
- **WHEN** a D1 read fails because the remote service or network is unavailable
- **THEN** the endpoint returns a retryable service-unavailable response
- **AND** the response contains a stable error code and request ID
- **AND** the response does not expose SQL, parameters, tokens, or stack traces

#### Scenario: Unknown database failure
- **WHEN** a D1 operation fails for an unclassified reason
- **THEN** the endpoint returns a generic internal-server error envelope
- **AND** the original technical error remains available only to server-side logging

### Requirement: Operation-aware recovery
The system SHALL recover only from database failures proven safe for the current operation.

#### Scenario: Idempotent initialization conflict
- **WHEN** concurrent initialization produces a unique conflict for the same intended seed data
- **THEN** the repository may reload and return the winning persisted data

#### Scenario: Non-idempotent write failure
- **WHEN** a transaction, custom category, user, or settings write fails
- **THEN** the system does not automatically replay the write without an idempotency guarantee
