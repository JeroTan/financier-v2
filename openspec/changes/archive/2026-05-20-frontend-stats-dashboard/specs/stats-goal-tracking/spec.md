## ADDED Requirements

### Requirement: Goal display
The system SHALL display user-set goals with progress indicators showing completion status.

#### Scenario: Goal with progress
- **WHEN** a user has an active goal
- **THEN** the goal is displayed with a progress bar showing current vs. target amount

#### Scenario: Goal completed
- **WHEN** a goal's progress reaches or exceeds the target
- **THEN** the goal is marked as completed with a visual indicator

### Requirement: Goal creation UI
The system SHALL provide a UI for users to create daily, monthly, or yearly goals with a target amount and optional category.

#### Scenario: Goal created
- **WHEN** a user fills out the goal creation form and submits
- **THEN** the goal is saved and appears in the goal tracking display

### Requirement: Goal deletion
The system SHALL allow users to delete goals they no longer want to track.

#### Scenario: Goal deleted
- **WHEN** a user clicks delete on a goal
- **THEN** the goal is removed from the display and database
