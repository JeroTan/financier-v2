## MODIFIED Requirements

### Requirement: Stats API contract
The system SHALL return `totalIncome`, `totalExpenses`, and `net` from `GET /api/stats`, using the same schema for runtime output, OpenAPI, and frontend typing.

#### Scenario: Stats fetched successfully
- **WHEN** the stats endpoint succeeds
- **THEN** the response fields match the fields consumed by the stats dashboard and finance widget

#### Scenario: Stats database failure
- **WHEN** D1 aggregation fails
- **THEN** the endpoint returns the standard retryable database error envelope
- **AND** the frontend displays its existing retry state

### Requirement: Loading state
The system SHALL display a loading indicator while stats are being fetched.

#### Scenario: Loading displayed
- **WHEN** a stats request is in progress
- **THEN** a loading spinner or skeleton is shown
