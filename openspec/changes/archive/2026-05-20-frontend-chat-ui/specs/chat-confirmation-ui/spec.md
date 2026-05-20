## ADDED Requirements

### Requirement: Confirmation card display
The system SHALL display a confirmation card when the AI response includes parsed transaction data requiring user approval.

#### Scenario: Confirmation shown
- **WHEN** a `done` event with `type: "confirmation"` is received
- **THEN** a card is displayed showing amount, type, category, date, and description

### Requirement: Inline field editing
The system SHALL allow users to edit any field (amount, type, category, date, description) in the confirmation card before confirming.

#### Scenario: Field edited
- **WHEN** a user clicks on a field in the confirmation card
- **THEN** the field becomes editable with appropriate input type

### Requirement: Confirm and cancel actions
The system SHALL provide Confirm and Cancel buttons in the confirmation card.

#### Scenario: User confirms
- **WHEN** the user clicks Confirm
- **THEN** the (possibly edited) transaction data is sent to the AI for saving

#### Scenario: User cancels
- **WHEN** the user clicks Cancel
- **THEN** the confirmation card is dismissed and the chat returns to idle state
