## ADDED Requirements

### Requirement: Stats API fetch
The system SHALL fetch stats from `GET /api/stats?period=daily|monthly|yearly&date=YYYY-MM-DD` and display the response.

#### Scenario: Stats fetched successfully
- **WHEN** the stats component mounts
- **THEN** it fetches stats for the current period and displays the data

#### Scenario: Stats fetch error
- **WHEN** the stats API returns an error
- **THEN** an error message is displayed with a retry option

### Requirement: Loading state
The system SHALL display a loading indicator while stats are being fetched.

#### Scenario: Loading displayed
- **WHEN** a stats request is in progress
- **THEN** a loading spinner or skeleton is shown
