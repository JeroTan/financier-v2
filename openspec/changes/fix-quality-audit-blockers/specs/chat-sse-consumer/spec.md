## MODIFIED Requirements

### Requirement: SSE connection
The system SHALL establish a streaming connection to the chat API endpoint when sending a message. Because chat messages are submitted with POST bodies, the client MAY use `fetch` with a readable stream instead of browser `EventSource`.

#### Scenario: Connection established
- **WHEN** a message is sent
- **THEN** a streaming POST request is opened to `/api/chat`

#### Scenario: Connection closed
- **WHEN** the `done` event is received
- **THEN** the streaming reader is released and the connection is closed

### Requirement: Event parsing
The system SHALL parse SSE event blocks and map them to chat state transitions:
- `message` event with JSON content -> `streaming` state, append `content`
- `done` event with `type: "confirmation"` -> `confirm` state
- `done` event with `type: "saved"` -> `success` state
- `done` event with `type: "normal"` -> `done` state
- `error` event -> `error` state

#### Scenario: Text event handled
- **WHEN** a `message` event contains `data: {"type":"text","content":"hello"}`
- **THEN** `hello` is appended to the current AI message

#### Scenario: Confirmation event handled
- **WHEN** a `done` event contains `data: {"type":"confirmation","parsedData":{...}}`
- **THEN** the chat transitions to `confirm` state and displays the confirmation UI

#### Scenario: Saved event handled
- **WHEN** a `done` event contains `data: {"type":"saved","transactionId":"tx_1"}`
- **THEN** the chat transitions to success state and emits the transaction-saved event

## ADDED Requirements

### Requirement: Authenticated chat stream
The chat stream request SHALL include valid authentication for the protected `/api/chat` endpoint.

#### Scenario: Chat request authorized
- **WHEN** an authenticated user sends a chat message
- **THEN** `/api/chat` receives a valid access token or equivalent session auth
