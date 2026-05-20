## ADDED Requirements

### Requirement: Unsaved changes detection
The system SHALL detect when the entry form has been modified from its initial state and has not been submitted.

#### Scenario: Form modified
- **WHEN** the user changes any form field value
- **THEN** the form is marked as having unsaved changes

#### Scenario: Form submitted
- **WHEN** the form is successfully submitted
- **THEN** the unsaved changes flag is cleared

### Requirement: Navigation warning
The system SHALL display a warning when the user attempts to navigate away from the entry page with unsaved changes.

#### Scenario: Browser close warning
- **WHEN** the user attempts to close the browser tab with unsaved changes
- **THEN** a browser confirmation dialog asks if they want to leave

#### Scenario: In-app navigation warning
- **WHEN** the user attempts to navigate to another page with unsaved changes
- **THEN** an in-app confirmation dialog asks if they want to leave

### Requirement: Warning dismissal
The system SHALL allow the user to stay on the page and continue editing after dismissing the navigation warning.

#### Scenario: User chooses to stay
- **WHEN** the user clicks "Stay" on the warning dialog
- **THEN** navigation is cancelled and the form remains visible with all data intact
