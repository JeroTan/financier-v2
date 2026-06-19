## MODIFIED Requirements

### Requirement: AI chat database dependencies
The chat endpoint SHALL handle user, category, and transaction database failures through the correct response channel.

#### Scenario: Database failure before stream creation
- **WHEN** user or repository initialization fails before SSE begins
- **THEN** the endpoint returns the standard JSON database error envelope with a request ID

#### Scenario: Database failure after stream creation
- **WHEN** a category lookup or confirmed transaction write fails after SSE begins
- **THEN** the stream emits an SSE error event
- **AND** closes without reporting the transaction as saved

#### Scenario: Confirmed transaction saved
- **WHEN** a confirmed transaction is persisted successfully
- **THEN** the stream emits the saved completion event with the transaction ID
