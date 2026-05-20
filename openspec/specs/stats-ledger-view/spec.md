# stats-ledger-view Specification

## Purpose
TBD - created by archiving change frontend-stats-dashboard. Update Purpose after archive.
## Requirements
### Requirement: Ledger table display
The system SHALL display transactions in a clean ledger table format with icon prefixes, color-coded amounts (green for income, red for expenses), and summary rows.

#### Scenario: Transactions displayed as ledger
- **WHEN** the stats view loads with transaction data
- **THEN** transactions are shown in a table with icons and color-coded values

### Requirement: Time period grouping
The system SHALL group transactions by the selected time period (day, month, or year) with subtotals per group.

#### Scenario: Daily view grouping
- **WHEN** daily view is selected
- **THEN** transactions are grouped by day with daily subtotals

#### Scenario: Monthly view grouping
- **WHEN** monthly view is selected
- **THEN** transactions are grouped by month with monthly subtotals

### Requirement: Harvest Moon styling
The system SHALL apply Harvest Moon-inspired styling: clean table layout, icon-based categories, easy to scan at a glance.

#### Scenario: Visual style applied
- **WHEN** the ledger view renders
- **THEN** the table uses icon prefixes, alternating row colors, and clear typography

