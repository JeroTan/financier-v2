## ADDED Requirements

### Requirement: Sidebar user menu with logout
The sidebar SHALL display a clickable user section at the bottom left that opens a dropdown menu. The menu SHALL include a "Logout" item that terminates the session.

#### Scenario: Click user section opens dropdown
- **WHEN** user clicks the avatar or email in the sidebar user section
- **THEN** a dropdown menu appears above the trigger with available actions

#### Scenario: Logout item is visible in dropdown
- **WHEN** user opens the user menu
- **THEN** the dropdown SHALL contain a "Logout" menu item

#### Scenario: Successful logout redirects to login
- **WHEN** user clicks "Logout"
- **AND** the `POST /api/auth/logout` request succeeds (HTTP 200)
- **THEN** the access token SHALL be cleared from `sessionStorage`
- **AND** the browser SHALL redirect to `/login`

#### Scenario: Failed logout does not redirect
- **WHEN** user clicks "Logout"
- **AND** the `POST /api/auth/logout` request fails (network error or non-200 status)
- **THEN** the user SHALL remain on the current page
- **AND** the access token SHALL NOT be cleared

### Requirement: Menu extensibility
The user menu SHALL be structured to support additional menu items beyond logout (e.g., settings, profile).

#### Scenario: Future menu items can be added
- **WHEN** a new menu item is added to the dropdown items array
- **THEN** it SHALL render in the dropdown without modifying the trigger or portal structure
