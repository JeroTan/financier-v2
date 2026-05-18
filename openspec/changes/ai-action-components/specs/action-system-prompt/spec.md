## ADDED Requirements

### Requirement: Action format instructions in system prompt
The system SHALL include action format instructions in the system prompt, teaching the AI when and how to use each action type.

#### Scenario: Action instructions included
- **WHEN** the system prompt is assembled
- **THEN** it includes instructions for all 10 action types with examples

### Requirement: Action usage guidelines
The system SHALL instruct the AI to use actions contextually:
- Use `Card` when confirming or displaying a single transaction
- Use `Table` when showing multiple transactions or breakdowns
- Use `Chart` when showing trends over time
- Use `Progress` when showing goal progress
- Use `Alert` for tips, warnings, or important notices
- Use `List` for enumerating items or options
- Use `Image` when referencing a receipt
- Use `Divider` to separate content sections
- Use `Insight` for financial observations
- Use `Button` for offering user actions

#### Scenario: Contextual action usage
- **WHEN** the AI confirms a transaction
- **THEN** it uses a Card action to display the parsed details

#### Scenario: Insight provided
- **WHEN** the AI notices a spending pattern
- **THEN** it uses an Insight action to highlight the observation

### Requirement: Action format examples
The system SHALL provide concrete examples of each action type in the system prompt so the AI can generate them correctly.

#### Scenario: Example provided for Card
- **WHEN** the system prompt is loaded
- **THEN** it includes an example: `@#=Card=> {"amount": 50, "type": "expense", "category": "Food"} <=Card=#@`
