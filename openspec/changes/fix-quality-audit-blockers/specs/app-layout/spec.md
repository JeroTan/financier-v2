## ADDED Requirements

### Requirement: Responsive width integrity
The app shell SHALL preserve usable widths for navigation, content, forms, cards, and chat panes across supported breakpoints.

#### Scenario: Desktop app content width
- **WHEN** an authenticated app page renders at 1280px width
- **THEN** the sidebar and content area are visible and the main content does not collapse

#### Scenario: Mobile app content width
- **WHEN** an authenticated app page renders below 768px width
- **THEN** content uses available viewport width without horizontal overflow

#### Scenario: Login form width
- **WHEN** the login or register page renders
- **THEN** form controls are wide enough for readable input on mobile and desktop
