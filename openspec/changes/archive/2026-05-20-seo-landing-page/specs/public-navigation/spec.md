## ADDED Requirements

### Requirement: Top navigation bar
The system SHALL display a top navigation bar with the Financier logo, "Features" anchor link, "Sign In" button, and "Get Started" button.

#### Scenario: Navigation renders
- **WHEN** the landing page loads
- **THEN** the top navigation bar is visible with all elements

#### Scenario: Features anchor link
- **WHEN** a user clicks "Features"
- **THEN** the page scrolls to the features section

### Requirement: Authenticated state
The system SHALL hide the navigation bar when the user is authenticated and redirect to the app dashboard.

#### Scenario: Authenticated user visits landing page
- **WHEN** an authenticated user visits `/`
- **THEN** they are redirected to the dashboard

### Requirement: Mobile navigation
The system SHALL adapt the navigation for mobile viewports with a stacked layout.

#### Scenario: Mobile navigation
- **WHEN** the viewport is below 768px
- **THEN** the navigation elements stack vertically or collapse into a compact layout
