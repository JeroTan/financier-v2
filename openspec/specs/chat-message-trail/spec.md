# chat-message-trail Specification

## Purpose
TBD - created by archiving change frontend-chat-ui. Update Purpose after archive.
## Requirements
### Requirement: Message trail storage
The system SHALL store the conversation message trail in localStorage under the key `financier:chat:trail`.

#### Scenario: Message saved to trail
- **WHEN** a user sends a message or receives an AI response
- **THEN** the message is appended to the localStorage trail

#### Scenario: Trail retrieved on page load
- **WHEN** the chat component mounts
- **THEN** the message trail is loaded from localStorage

### Requirement: Trail trimming
The system SHALL trim the message trail to the last 10 exchanges (20 messages) before sending to the API.

#### Scenario: Long trail trimmed
- **WHEN** the trail contains more than 20 messages
- **THEN** only the last 20 are included in the API request

### Requirement: Trail cleared on new conversation
The system SHALL provide a way to clear the message trail and start a new conversation.

#### Scenario: Trail cleared
- **WHEN** the user initiates a new conversation
- **THEN** the localStorage trail is cleared and the chat returns to idle state

