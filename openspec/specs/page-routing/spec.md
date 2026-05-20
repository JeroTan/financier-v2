# page-routing Specification

## Purpose
TBD - created by archiving change app-shell-routing. Update Purpose after archive.
## Requirements
### Requirement: Page structure
The system SHALL define the following page routes:
- `/dashboard` — Main dashboard with stats + chat
- `/entry` — Manual transaction entry form
- `/entity` — Transaction card list with filters
- `/stats` — Detailed stats view with goal tracking
- `/settings` — User account settings and preferences

#### Scenario: Dashboard page
- **WHEN** the user navigates to `/dashboard`
- **THEN** the dashboard page renders within the app layout

#### Scenario: Entry page
- **WHEN** the user navigates to `/entry`
- **THEN** the entry form page renders within the app layout

#### Scenario: Entity page
- **WHEN** the user navigates to `/entity`
- **THEN** the entity card list page renders within the app layout

#### Scenario: Stats page
- **WHEN** the user navigates to `/stats`
- **THEN** the stats view page renders within the app layout

#### Scenario: Settings page
- **WHEN** the user navigates to `/settings`
- **THEN** the settings page renders within the app layout

### Requirement: Default route
The system SHALL redirect authenticated users from `/` to `/dashboard`.

#### Scenario: Authenticated user visits root
- **WHEN** an authenticated user visits `/`
- **THEN** they are redirected to `/dashboard`

