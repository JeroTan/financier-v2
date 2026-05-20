## ADDED Requirements

### Requirement: AI chat service integration
The system SHALL integrate Cloudflare AI (`@cf/moonshotai/kimi-k2.6`) via the `env.AI` binding to process natural language transaction inputs and generate conversational responses.

#### Scenario: Successful AI response
- **WHEN** a user sends a message to the chat endpoint
- **THEN** the system runs the message through Kimi 2.6 and streams the response back

#### Scenario: AI service unavailable
- **WHEN** the Cloudflare AI service is unavailable or returns an error
- **THEN** the system returns a fallback message: "It seems the service is not yet available"

#### Scenario: Network timeout
- **WHEN** the AI service does not respond within 30 seconds
- **THEN** the system returns a timeout error with a retry option

### Requirement: System prompt loading
The system SHALL load the system prompt from `/src/assets/chat_instruction.md` and include it as the first message in every AI request.

#### Scenario: System prompt loaded
- **WHEN** the AI service is invoked
- **THEN** the system prompt is included as the first message with role "system"

#### Scenario: System prompt file missing
- **WHEN** the chat_instruction.md file is not found
- **THEN** the system uses a default fallback prompt and logs a warning

### Requirement: Streaming response
The system SHALL stream AI responses as Server-Sent Events (SSE) with `Content-Type: text/event-stream`.

#### Scenario: Streamed text response
- **WHEN** the AI generates a text response
- **THEN** the response is streamed as SSE `message` events with JSON payload `{"type": "text", "content": "..."}`

#### Scenario: Stream completion
- **WHEN** the AI finishes generating a response
- **THEN** a `done` event is sent with metadata about the response type
