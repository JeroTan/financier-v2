## ADDED Requirements

### Requirement: Dropdown full-width
The user menu dropdown SHALL stretch to the full width of its trigger (the user section in the sidebar).

#### Scenario: Dropdown matches trigger width
- **WHEN** user opens the user menu dropdown
- **THEN** the dropdown width SHALL match the width of the trigger button

### Requirement: Appearance toggle
The user menu SHALL include a "Change appearance" menu item that toggles between dark and light mode.

#### Scenario: Click toggles theme
- **WHEN** user clicks "Change appearance" in the user menu
- **THEN** the theme SHALL toggle between dark and light mode
- **AND** the preference SHALL be persisted in `localStorage`

#### Scenario: Icon reflects action
- **WHEN** the "Change appearance" menu item is rendered
- **THEN** it SHALL display a `SunMoon` icon alongside the label

### Requirement: Visual separation
The user menu SHALL use a separator between grouped menu items (appearance toggle and logout are in different groups).

#### Scenario: Separator renders between groups
- **WHEN** the user menu dropdown is open
- **THEN** a visual separator SHALL appear between "Change appearance" and "Logout"
