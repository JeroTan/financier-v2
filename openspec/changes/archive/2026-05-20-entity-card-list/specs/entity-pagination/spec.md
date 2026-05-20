## ADDED Requirements

### Requirement: Pagination controls
The system SHALL display pagination controls with previous/next buttons, page numbers, and current page indicator.

#### Scenario: Pagination displayed
- **WHEN** there are more transactions than the page size
- **THEN** pagination controls are displayed below the card list

#### Scenario: Current page highlighted
- **WHEN** the user is on page 3
- **THEN** page 3 is visually highlighted in the pagination controls

### Requirement: Page size
The system SHALL default to 20 transactions per page and allow the user to change the page size to 10, 20, or 50.

#### Scenario: Default page size
- **WHEN** the page loads
- **THEN** 20 transactions are displayed per page

#### Scenario: Page size changed
- **WHEN** the user selects 50 transactions per page
- **THEN** the list updates to show 50 transactions per page

### Requirement: Page navigation
The system SHALL navigate to the selected page and refetch transactions when a page number or previous/next button is clicked.

#### Scenario: Next page clicked
- **WHEN** the user clicks the next page button
- **THEN** the next page of transactions is loaded and displayed

#### Scenario: Page number clicked
- **WHEN** the user clicks a specific page number
- **THEN** that page of transactions is loaded and displayed
