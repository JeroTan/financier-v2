## ADDED Requirements

### Requirement: Type filter
The system SHALL provide filter buttons for All, Expense only, and Income only.

#### Scenario: All filter
- **WHEN** the "All" filter is selected
- **THEN** both income and expense transactions are displayed

#### Scenario: Expense filter
- **WHEN** the "Expense" filter is selected
- **THEN** only expense transactions are displayed

#### Scenario: Income filter
- **WHEN** the "Income" filter is selected
- **THEN** only income transactions are displayed

### Requirement: Search input
The system SHALL provide a search input that filters transactions by name, description, or category name.

#### Scenario: Search matches description
- **WHEN** the user types "burger" in the search input
- **THEN** transactions with "burger" in the description or name are displayed

#### Scenario: Search matches category
- **WHEN** the user types "Food" in the search input
- **THEN** transactions in the Food category are displayed

#### Scenario: No search results
- **WHEN** the search query matches no transactions
- **THEN** an empty state message is displayed

### Requirement: Date range filter
The system SHALL provide date range inputs (start date, end date) to filter transactions within a specific period.

#### Scenario: Date range applied
- **WHEN** the user sets a start and end date
- **THEN** only transactions within that range are displayed

#### Scenario: Invalid date range
- **WHEN** the start date is after the end date
- **THEN** a validation error is displayed

### Requirement: Filter combination
The system SHALL allow combining type filter, search, and date range filters simultaneously.

#### Scenario: Multiple filters active
- **WHEN** the user sets type=expense, search="coffee", and a date range
- **THEN** only expense transactions matching "coffee" within the date range are displayed
