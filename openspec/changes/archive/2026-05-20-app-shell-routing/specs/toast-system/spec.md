## ADDED Requirements

### Requirement: Toast provider
The system SHALL mount a toast provider (`<Toaster />`) in the app layout so that toasts are available on all authenticated pages.

#### Scenario: Toast provider mounted
- **WHEN** the app layout renders
- **THEN** the toast provider is active and ready to display toasts

### Requirement: Toast types
The system SHALL support four toast types: success (green), error (red), warning (amber), and info (blue), each with appropriate icons and styling.

#### Scenario: Success toast
- **WHEN** `toast.success("Transaction saved")` is called
- **THEN** a green toast with a checkmark icon is displayed

#### Scenario: Error toast
- **WHEN** `toast.error("Failed to save")` is called
- **THEN** a red toast with an error icon is displayed

### Requirement: Toast auto-dismiss
The system SHALL auto-dismiss toasts after 5 seconds for success/info and 10 seconds for error/warning.

#### Scenario: Success toast dismissed
- **WHEN** a success toast is displayed
- **THEN** it auto-dismisses after 5 seconds

#### Scenario: Error toast dismissed
- **WHEN** an error toast is displayed
- **THEN** it auto-dismisses after 10 seconds

### Requirement: Toast manual dismiss
The system SHALL allow users to manually dismiss a toast by clicking a close button.

#### Scenario: Toast dismissed manually
- **WHEN** the user clicks the close button on a toast
- **THEN** the toast is immediately removed
