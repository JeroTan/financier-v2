# stats-empty-states Specification

## Purpose
TBD - created by archiving change frontend-stats-dashboard. Update Purpose after archive.
## Requirements
### Requirement: No data message
The system SHALL display a friendly message when no transactions exist for the selected period.

#### Scenario: No transactions for period
- **WHEN** the stats API returns zero transactions
- **THEN** a message like "No transactions this month" is displayed

### Requirement: CTA for new users
The system SHALL display a call-to-action encouraging users to log their first transaction when no data exists.

#### Scenario: First-time user
- **WHEN** the user has no transactions at all
- **THEN** a CTA like "Start tracking with chat" or "Add your first transaction" is shown

### Requirement: No goals message
The system SHALL display a message when no goals are set, with an option to create one.

#### Scenario: No goals set
- **WHEN** the user has no active goals
- **THEN** a message like "Set a goal to track your progress" is shown with a create button

