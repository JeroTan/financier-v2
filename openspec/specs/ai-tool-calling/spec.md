# ai-tool-calling Specification

## Purpose
TBD - created by archiving change ai-chat-architecture. Update Purpose after archive.
## Requirements
### Requirement: Tool calling execution loop
The system SHALL execute a tool calling loop where the AI can invoke defined tools, receive results, and continue generating until a final text response is produced.

#### Scenario: AI calls a tool
- **WHEN** the AI response includes a tool call
- **THEN** the system executes the tool, appends the result to the message history, and runs the AI again

#### Scenario: Maximum tool rounds reached
- **WHEN** the tool calling loop exceeds 5 rounds
- **THEN** the system stops the loop and returns a fallback text response

#### Scenario: AI returns text without tool calls
- **WHEN** the AI response contains only text (no tool calls)
- **THEN** the text is streamed to the client and the loop ends

### Requirement: Tool schemas
The system SHALL define the following tool schemas that the AI can invoke:
- `createTransaction(amount, type, category, date, description?, imageUrl?)`
- `getTransactions(dateRange?, type?, category?, limit, offset)`
- `getCategories()`
- `uploadReceipt(base64Image)`

#### Scenario: Tool schema validation
- **WHEN** the AI calls a tool with invalid parameters
- **THEN** the system returns an error result to the AI for correction

#### Scenario: createTransaction tool execution
- **WHEN** the AI calls `createTransaction` with valid parameters
- **THEN** the transaction is saved to D1 and a success result is returned to the AI

### Requirement: Confirmation-gated tool usage
The system SHALL ensure that the AI does not call `createTransaction` or any data-modifying tool without explicit user confirmation in the conversation.

#### Scenario: User confirms before tool call
- **WHEN** the user responds with explicit confirmation (e.g., "Yes!", "Confirm")
- **THEN** the AI may call `createTransaction` to save the transaction

#### Scenario: User has not confirmed
- **WHEN** the AI attempts to call `createTransaction` without prior user confirmation
- **THEN** the system intercepts the call and returns an error instructing the AI to ask for confirmation first

