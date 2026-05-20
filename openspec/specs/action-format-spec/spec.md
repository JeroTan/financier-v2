# action-format-spec Specification

## Purpose
TBD - created by archiving change ai-action-components. Update Purpose after archive.
## Requirements
### Requirement: Action format syntax
The system SHALL use the format `@#=_ACTION=> content <=ACTION=#@` for embedding structured content within AI responses. The format consists of:
- Opening delimiter: `@#=_ACTION=>`
- Content: JSON for structured actions, plain text for simple actions
- Closing delimiter: `<=ACTION=#@`

#### Scenario: Action block detected
- **WHEN** an AI response contains `@#=Card=> {"amount": 50} <=Card=#@`
- **THEN** the parser extracts the action type "Card" and content `{"amount": 50}`

#### Scenario: Self-closing action
- **WHEN** an AI response contains `@#=Divider=> <=Divider=#@`
- **THEN** the parser extracts the action type "Divider" with empty content

### Requirement: Action type definitions
The system SHALL support the following 10 action types:

| Action | Content Format | Purpose |
|--------|---------------|---------|
| `Card` | JSON | Transaction summary card with amount, type, category, date |
| `Table` | JSON | Data table with headers and rows |
| `Chart` | JSON | Sparkline/mini chart with data points |
| `Progress` | JSON | Progress bar with current/target values |
| `Alert` | Text | Warning, tip, or info message with type (info/warning/success/error) |
| `List` | Text (newline-separated) | Bullet or numbered list items |
| `Image` | Text (URL) | Receipt or image preview |
| `Divider` | Empty | Visual separator between content sections |
| `Insight` | Text | Financial observation or tip |
| `Button` | JSON | Actionable buttons with label and action type |

#### Scenario: Card action parsed
- **WHEN** a Card action block is encountered
- **THEN** a transaction summary card component is rendered

#### Scenario: Table action parsed
- **WHEN** a Table action block is encountered
- **THEN** a data table component is rendered with headers and rows

#### Scenario: Alert action parsed
- **WHEN** an Alert action block is encountered
- **THEN** an alert component is rendered with the appropriate type styling

### Requirement: Unknown action handling
The system SHALL render unknown action types as plain text with the raw content visible.

#### Scenario: Unknown action type
- **WHEN** an action block with an unrecognized type is encountered
- **THEN** the raw content is displayed as plain text

