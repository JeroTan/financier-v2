## ADDED Requirements

### Requirement: Transaction card list display
The system SHALL display transactions as a paginated list of cards, showing name, description (optional), value, positive/negative indicator, image (optional), and categories (optional array).

#### Scenario: Cards displayed
- **WHEN** the Entity page loads with transactions
- **THEN** transaction cards are displayed in a grid layout

#### Scenario: Card content
- **WHEN** a transaction card is rendered
- **THEN** it shows the transaction name, value with color-coded indicator, and optional description, image, and categories

### Requirement: Card grid layout
The system SHALL display cards in a 2-column grid on desktop and single column on mobile.

#### Scenario: Desktop grid
- **WHEN** the viewport is 1024px or wider
- **THEN** cards are displayed in 2 columns

#### Scenario: Mobile single column
- **WHEN** the viewport is below 768px
- **THEN** cards are displayed in a single column
