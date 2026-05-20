# stats-dashboard Specification

## Purpose
TBD - created by archiving change frontend-stats-dashboard. Update Purpose after archive.
## Requirements
### Requirement: Stats dashboard component
The system SHALL display a stats dashboard component showing total income, total expenses, and net revenue for the selected time period.

#### Scenario: Monthly stats displayed
- **WHEN** the dashboard loads with monthly period selected
- **THEN** total income, expenses, and net for the current month are shown

#### Scenario: Net color coding
- **WHEN** net revenue is positive
- **THEN** the net value is displayed in green
- **WHEN** net revenue is negative
- **THEN** the net value is displayed in red

### Requirement: Period toggle
The system SHALL provide a toggle to switch between daily, monthly, and yearly views.

#### Scenario: Period switched
- **WHEN** the user selects a different period
- **THEN** the stats are recalculated and displayed for the new period

### Requirement: Real-time stat refresh
The system SHALL refresh stats when a `transaction_saved` event is received from the chat component.

#### Scenario: Transaction saved
- **WHEN** a transaction is saved via AI chat
- **THEN** the stats dashboard re-fetches and updates the displayed values

