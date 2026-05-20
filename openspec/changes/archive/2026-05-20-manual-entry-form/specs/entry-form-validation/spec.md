## ADDED Requirements

### Requirement: Amount validation
The system SHALL validate that the amount is a positive number greater than 0 and has at most 2 decimal places.

#### Scenario: Valid amount
- **WHEN** the user enters "500.50"
- **THEN** the amount passes validation

#### Scenario: Invalid amount - zero
- **WHEN** the user enters "0"
- **THEN** a validation error "Amount must be greater than 0" is displayed

#### Scenario: Invalid amount - negative
- **WHEN** the user enters "-100"
- **THEN** a validation error "Amount must be greater than 0" is displayed

#### Scenario: Invalid amount - too many decimals
- **WHEN** the user enters "500.505"
- **THEN** a validation error "Amount can have at most 2 decimal places" is displayed

### Requirement: Date validation
The system SHALL validate that the date is not in the future and is in a valid format.

#### Scenario: Valid date
- **WHEN** the user selects today's date
- **THEN** the date passes validation

#### Scenario: Future date
- **WHEN** the user selects a date in the future
- **THEN** a validation error "Date cannot be in the future" is displayed

### Requirement: Required field validation
The system SHALL mark type, amount, and date as required fields. Category and description are optional.

#### Scenario: Required field empty
- **WHEN** the user submits the form with a required field empty
- **THEN** an inline error is displayed on the empty field
