## ADDED Requirements

### Requirement: Message trail management
The system SHALL accept a `messageTrail` array from the client containing the conversation history and include it in the AI request.

#### Scenario: Message trail received
- **WHEN** the chat endpoint receives a request with a `messageTrail` array
- **THEN** the system includes the trail messages after the system prompt in the AI request

#### Scenario: Empty message trail
- **WHEN** the `messageTrail` is empty or missing
- **THEN** the system proceeds with only the system prompt and the new user message

### Requirement: Context window optimization
The system SHALL trim the message trail to the last 10 exchanges (20 messages) before sending to the AI. Older exchanges SHALL be summarized into a single context note.

#### Scenario: Long conversation history
- **WHEN** the message trail contains more than 20 messages
- **THEN** only the last 20 messages are sent, with older messages summarized

#### Scenario: Short conversation history
- **WHEN** the message trail contains 20 or fewer messages
- **THEN** all messages are sent without trimming

### Requirement: Client-provided trail trust model
The system SHALL accept the client-provided message trail without server-side validation of message authenticity, as the trail is used only for AI context and not for data integrity.

#### Scenario: Modified client trail
- **WHEN** a client sends a modified message trail
- **THEN** the system uses the trail as-is for AI context (transaction data integrity is ensured by D1, not the trail)
