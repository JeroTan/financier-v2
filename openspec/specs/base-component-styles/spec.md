# base-component-styles Specification

## Purpose
TBD - created by archiving change ui-design-system. Update Purpose after archive.
## Requirements
### Requirement: Chat bubble styles
The system SHALL define styles for user chat bubbles (Primary Gold background `#ffbf00`, Secondary Navy text, right-aligned) and system/bot chat bubbles (Light Gray `#F1F3F4` background, Secondary Navy text, left-aligned) with 12px outer border radius and 4px tail corner radius.

#### Scenario: User bubble rendered
- **WHEN** a user message is displayed
- **THEN** it has a gold background, navy text, right alignment, and 12px/4px border radius

#### Scenario: Bot bubble rendered
- **WHEN** an AI response is displayed
- **THEN** it has a light gray background, navy text, left alignment, and 12px border radius

### Requirement: Financial entry card styles
The system SHALL define styles for financial entry cards with: vertical stack layout, category icon + name on top row, data-display amount in middle, date and payment method on bottom row, and a 4px vertical accent bar on the left edge (green for income, red for expense).

#### Scenario: Expense card rendered
- **WHEN** an expense transaction card is displayed
- **THEN** it has a red 4px left accent bar, red-colored amount, and category icon

#### Scenario: Income card rendered
- **WHEN** an income transaction card is displayed
- **THEN** it has a green 4px left accent bar, green-colored amount, and category icon

### Requirement: Input field styles
The system SHALL define a borderless input field style floating at the bottom with a subtle top border (`#EDEFF2`), leading "Plus" icon for attachments, and trailing "Send" icon inside a pill-shaped Gold button.

#### Scenario: Input field rendered
- **WHEN** the chat input is displayed
- **THEN** it has no side borders, a top border, attachment icon, and gold send button

### Requirement: Chip styles
The system SHALL define chip styles with 1px border, no fill, high roundedness (pill shape), and on hover/active a light tint of the Primary color fill.

#### Scenario: Chip default state
- **WHEN** a suggestion chip is displayed
- **THEN** it has a 1px border, transparent fill, and pill shape

#### Scenario: Chip hover state
- **WHEN** a user hovers over a chip
- **THEN** it fills with a light primary color tint

### Requirement: Progress bar styles
The system SHALL define progress bar styles with 8px thickness, rounded ends, light gray track, and Primary Gold (`#795900`) progress fill.

#### Scenario: Progress bar rendered
- **WHEN** a goal progress bar is displayed
- **THEN** it shows an 8px thick bar with rounded ends and gold progress fill

### Requirement: Financial card elevation
The system SHALL apply a soft diffused shadow (0, 4px offset; 20px blur; 4% opacity) to financial cards and widgets to lift them from the chat thread.

#### Scenario: Card elevation applied
- **WHEN** a financial card is rendered
- **THEN** it has a soft shadow that lifts it from the background

