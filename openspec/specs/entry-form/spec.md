# entry-form Specification

## Purpose
TBD - created by archiving change manual-entry-form. Update Purpose after archive.
## Requirements
### Requirement: Manual entry form
The system SHALL provide a form with fields: type (income/expense toggle), amount (numeric), date (date picker), category (dropdown), description (text), and optional image attachment.

#### Scenario: Form renders with all fields
- **WHEN** the user opens the Entry page
- **THEN** all form fields are displayed with appropriate input types

#### Scenario: Type toggle
- **WHEN** the user toggles between income and expense
- **THEN** the form updates the type field and visual indicator changes

### Requirement: Form submission
The system SHALL submit the form data to `POST /api/transactions` and display a success confirmation upon completion.

#### Scenario: Successful submission
- **WHEN** the user submits a valid form
- **THEN** the transaction is saved and a success message is displayed

#### Scenario: Submission in progress
- **WHEN** the form is being submitted
- **THEN** the submit button is disabled and a loading indicator is shown

