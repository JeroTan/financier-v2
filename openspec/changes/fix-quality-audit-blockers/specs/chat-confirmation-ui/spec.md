## ADDED Requirements

### Requirement: Confirmation payload support
The chat confirmation flow SHALL preserve edited confirmation data and submit it in a schema accepted by the chat API.

#### Scenario: Confirm payload accepted
- **WHEN** a user confirms parsed transaction data
- **THEN** the follow-up request includes confirmation data in a field accepted by the API schema

#### Scenario: Edited data saved
- **WHEN** a user edits confirmation fields before clicking Confirm
- **THEN** the saved transaction uses the edited values

#### Scenario: Confirmation saved once
- **WHEN** a confirmation is accepted
- **THEN** exactly one transaction is created and the confirmation card is dismissed
