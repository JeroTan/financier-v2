# action-parser Specification

## Purpose
TBD - created by archiving change ai-action-components. Update Purpose after archive.
## Requirements
### Requirement: Action block extraction
The system SHALL parse AI response text and extract all action blocks matching the `@#=_ACTION=> content <=ACTION=#@` pattern.

#### Scenario: Single action extracted
- **WHEN** the response contains one action block
- **THEN** the action is extracted and the surrounding text is preserved

#### Scenario: Multiple actions extracted
- **WHEN** the response contains multiple action blocks
- **THEN** all actions are extracted in order, with text segments between them preserved

#### Scenario: No actions in response
- **WHEN** the response contains no action blocks
- **THEN** the entire response is rendered as plain text

### Requirement: Streaming state machine
The system SHALL use a state machine parser that handles partial action blocks during SSE streaming:
- `TEXT`: Normal text rendering
- `DETECTING_ACTION`: Accumulating characters to detect `@#=_` pattern
- `PARSING_ACTION`: Accumulating content until `<=ACTION=#@` closing delimiter is found

#### Scenario: Partial action during streaming
- **WHEN** an action block is split across multiple SSE chunks
- **THEN** the parser buffers the partial block and renders it only when complete

#### Scenario: Incomplete action at stream end
- **WHEN** the stream ends with an unclosed action block
- **THEN** the incomplete block is rendered as plain text

### Requirement: Malformed action handling
The system SHALL handle malformed action blocks (missing closing delimiter, invalid JSON) by rendering them as plain text.

#### Scenario: Missing closing delimiter
- **WHEN** an action block has no closing delimiter
- **THEN** the entire block is rendered as plain text

#### Scenario: Invalid JSON in structured action
- **WHEN** a Card action contains invalid JSON
- **THEN** the raw content is displayed as plain text

