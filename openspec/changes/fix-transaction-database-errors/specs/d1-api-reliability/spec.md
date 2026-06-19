## ADDED Requirements

### Requirement: Explicit D1 development mode
The system SHALL use deployed remote D1 for normal development and SHALL keep local D1 limited to explicitly requested emergency/debug workflows.

#### Scenario: Normal development
- **WHEN** the developer runs the standard development command
- **THEN** D1 reads and writes use the deployed development database through remote Cloudflare bindings
- **AND** the workflow may depend on network access to Cloudflare

#### Scenario: Built Worker remote preview
- **WHEN** the developer runs the documented remote-preview command
- **THEN** D1 calls are routed to the deployed development database
- **AND** the command clearly identifies that remote data may be modified

#### Scenario: Local D1 debug exception
- **WHEN** a task explicitly targets Miniflare-local D1 behavior
- **THEN** local D1 may be used only for that isolated debug task
- **AND** the OpenSpec fragment must not describe local D1 as the default workflow

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
