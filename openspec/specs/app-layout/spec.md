# app-layout Specification

## Purpose
TBD - created by archiving change app-shell-routing. Update Purpose after archive.
## Requirements
### Requirement: App layout shell
The system SHALL provide a main application layout with a fixed left sidebar and a scrollable content area. The layout SHALL wrap all authenticated pages.

#### Scenario: Layout renders
- **WHEN** an authenticated user visits any app page
- **THEN** the sidebar and content area are displayed

#### Scenario: Content area scrolls
- **WHEN** page content exceeds viewport height
- **THEN** the content area scrolls independently of the sidebar

### Requirement: Sidebar navigation
The system SHALL display a sidebar with navigation links to: Dashboard, Entry, Entity, Stats, and Settings. The active page SHALL be visually highlighted.

#### Scenario: Sidebar links displayed
- **WHEN** the app layout renders
- **THEN** all 5 navigation links are visible with icons and labels

#### Scenario: Active page highlighted
- **WHEN** the user is on the Entry page
- **THEN** the Entry link is visually highlighted in the sidebar

### Requirement: Sidebar collapse on mobile
The system SHALL collapse the sidebar to a hamburger menu or bottom navigation on mobile viewports (below 768px).

#### Scenario: Mobile sidebar
- **WHEN** the viewport is below 768px
- **THEN** the sidebar is hidden and accessible via a toggle or bottom nav

