## MODIFIED Requirements

### Requirement: Create transaction endpoint
The system SHALL validate an authenticated transaction payload using the same schema used for OpenAPI generation, resolve its category for the authenticated user, save it to D1, and return the persisted transaction shape.

#### Scenario: Transaction created
- **WHEN** a valid transaction payload is posted
- **THEN** the transaction is saved and returned with its persisted ID and fields

#### Scenario: Concurrent category initialization
- **WHEN** category initialization encounters a benign concurrent default-seed conflict
- **THEN** the endpoint resolves the winning persisted category
- **AND** continues saving the transaction

#### Scenario: Database unavailable
- **WHEN** category resolution or transaction insertion fails because D1 is unavailable
- **THEN** the endpoint returns the standard retryable database error envelope
- **AND** does not return framework HTML or expose query parameters

### Requirement: List transactions endpoint
The system SHALL use one shared query and response schema for runtime validation, OpenAPI generation, and client typing.

#### Scenario: Paginated response
- **WHEN** transactions are listed
- **THEN** the documented collection field name and transaction fields exactly match the runtime JSON response

#### Scenario: User isolation
- **WHEN** an authenticated user lists or retrieves transactions
- **THEN** every query includes that user's ID
- **AND** no transaction owned by another user is returned
