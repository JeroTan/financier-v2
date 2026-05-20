# chat-component Specification

## Purpose
TBD - created by archiving change frontend-chat-ui. Update Purpose after archive.
## Requirements
### Requirement: Chat message display
The system SHALL display chat messages in a scrollable list with user messages aligned right and AI messages aligned left.

#### Scenario: User message displayed
- **WHEN** a user sends a message
- **THEN** the message appears aligned right with a distinct background

#### Scenario: AI message displayed
- **WHEN** the AI responds
- **THEN** the message appears aligned left with a distinct background

### Requirement: Streaming text animation
The system SHALL display AI responses as they arrive via SSE, appending text chunks in real-time.

#### Scenario: Text streaming
- **WHEN** SSE `message` events are received
- **THEN** the text is appended to the current AI message in real-time

### Requirement: Chat input
The system SHALL provide a text input field with a send button that is disabled when empty and during loading/streaming states.

#### Scenario: Input enabled
- **WHEN** the chat is in idle or success state
- **THEN** the input field is enabled and the send button is active

#### Scenario: Input disabled during streaming
- **WHEN** the chat is in loading or streaming state
- **THEN** the input field is disabled

### Requirement: Message states
The system SHALL support the following chat states: `idle`, `typing`, `loading`, `streaming`, `confirm`, `success`, `error`.

#### Scenario: State transitions
- **WHEN** a user sends a message
- **THEN** the state transitions from `idle` → `loading` → `streaming` → `confirm` or `success`

