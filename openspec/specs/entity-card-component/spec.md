# entity-card-component Specification

## Purpose
TBD - created by archiving change entity-card-list. Update Purpose after archive.
## Requirements
### Requirement: Transaction card structure
The system SHALL render each transaction card with: a 4px vertical accent bar (green for income, red for expense), category icon and name, data-display amount, date, and optional description and image.

#### Scenario: Expense card
- **WHEN** an expense transaction card is rendered
- **THEN** it has a red accent bar, red-colored amount, and category icon

#### Scenario: Income card
- **WHEN** an income transaction card is rendered
- **THEN** it has a green accent bar, green-colored amount, and category icon

#### Scenario: Card with image
- **WHEN** a transaction has an attached receipt image
- **THEN** the card displays a thumbnail of the image

### Requirement: Card hover and interaction
The system SHALL apply a hover state to transaction cards with a subtle elevation change.

#### Scenario: Card hover
- **WHEN** a user hovers over a transaction card
- **THEN** the card elevates slightly with an increased shadow

