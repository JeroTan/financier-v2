## ADDED Requirements

### Requirement: SSE connection
The system SHALL establish an EventSource connection to the chat API endpoint when sending a message.

#### Scenario: Connection established
- **WHEN** a message is sent
- **THEN** an EventSource connection is opened to `/api/chat`

#### Scenario: Connection closed
- **WHEN** the `done` event is received
- **THEN** the EventSource connection is closed

### Requirement: Event parsing
The system SHALL parse SSE events and map them to chat state transitions:
- `message` event → `streaming` state, append text
- `done` event with `type: "confirmation"` → `confirm` state
- `done` event with `type: "saved"` → `success` state
- `error` event → `error` state

#### Scenario: Text event handled
- **WHEN** a `message` event is received
- **THEN** the text content is appended to the current AI message

#### Scenario: Confirmation event handled
- **WHEN** a `done` event with `type: "confirmation"` is received
- **THEN** the chat transitions to `confirm` state and displays the confirmation UI

### Requirement: Error handling
The system SHALL handle SSE connection errors and display a retry option.

#### Scenario: Connection error
- **WHEN** the SSE connection fails
- **THEN** the chat transitions to `error` state with a retry button
