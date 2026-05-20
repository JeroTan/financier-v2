## ADDED Requirements

### Requirement: SSE event format
The system SHALL stream responses using Server-Sent Events with the following event types:
- `message`: Streaming text chunks with payload `{"type": "text", "content": "..."}` 
- `done`: Response completion with payload `{"type": "confirmation"|"saved"|"error", ...metadata}`
- `error`: Error event with payload `{"type": "error", "message": "..."}`

#### Scenario: Text streaming
- **WHEN** the AI generates text output
- **THEN** each chunk is sent as a `message` event with `{"type": "text", "content": "chunk"}`

#### Scenario: Confirmation completion
- **WHEN** the AI finishes parsing a transaction and asks for confirmation
- **THEN** a `done` event is sent with `{"type": "confirmation", "parsedData": {...}}`

#### Scenario: Transaction saved completion
- **WHEN** the AI successfully saves a transaction via tool calling
- **THEN** a `done` event is sent with `{"type": "saved", "transactionId": "..."}`

#### Scenario: Error during processing
- **WHEN** an error occurs during AI processing or tool execution
- **THEN** an `error` event is sent with `{"type": "error", "message": "..."}`

### Requirement: SSE headers
The system SHALL set the following headers on SSE responses:
- `Content-Type: text/event-stream`
- `Cache-Control: no-cache`
- `Connection: keep-alive`

#### Scenario: SSE response headers
- **WHEN** the chat endpoint returns an SSE response
- **THEN** all required headers are present

### Requirement: Fallback content
The system SHALL include fallback content in the SSE stream if the AI service fails, with the message "It seems the service is not yet available".

#### Scenario: Service failure fallback
- **WHEN** the AI service throws an error
- **THEN** the stream includes a `message` event with the fallback text followed by a `done` event with `{"type": "error"}`
