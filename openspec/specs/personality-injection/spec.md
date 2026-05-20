# personality-injection Specification

## Purpose
TBD - created by archiving change ai-personality-system. Update Purpose after archive.
## Requirements
### Requirement: Runtime personality injection
The system SHALL assemble the system prompt at runtime by concatenating: `[base_prompt] + [personality_prompt] + [action_format_instructions]`.

#### Scenario: System prompt assembled
- **WHEN** the AI chat service prepares a request
- **THEN** the system prompt includes the base prompt, selected personality prompt, and action format instructions

#### Scenario: Default personality injection
- **WHEN** the user has no personality preference set
- **THEN** the `default` personality prompt is injected

#### Scenario: Personality changed
- **WHEN** the user changes their personality preference
- **THEN** the next AI request uses the new personality prompt

### Requirement: Personality prompt loading
The system SHALL load personality prompts from individual files in `src/server/ai/personalities/` directory, one file per personality.

#### Scenario: Personality file loaded
- **WHEN** a personality is selected
- **THEN** the corresponding prompt file is loaded and included in the system prompt

#### Scenario: Personality file missing
- **WHEN** a selected personality's prompt file is not found
- **THEN** the system falls back to the `default` personality and logs a warning

### Requirement: Token budget management
The system SHALL ensure each personality prompt is under 200 tokens to preserve context window for conversation history.

#### Scenario: Personality prompt size
- **WHEN** a personality prompt is loaded
- **THEN** it is under 200 tokens

