# loading-skeletons Specification

## Purpose
TBD - created by archiving change app-shell-routing. Update Purpose after archive.
## Requirements
### Requirement: Skeleton components
The system SHALL provide skeleton loading components for: card lists, data tables, form fields, and stat cards.

#### Scenario: Card skeleton
- **WHEN** transaction cards are loading
- **THEN** card-shaped skeletons are displayed with the same dimensions

#### Scenario: Table skeleton
- **WHEN** a data table is loading
- **THEN** table-row-shaped skeletons are displayed

### Requirement: Skeleton animation
The system SHALL apply a shimmer/pulse animation to skeleton components to indicate loading state.

#### Scenario: Skeleton animates
- **WHEN** a skeleton component is displayed
- **THEN** it shows a subtle shimmer animation

### Requirement: Consistent skeleton usage
The system SHALL use skeleton components in place of content during loading states across all pages.

#### Scenario: Dashboard loading
- **WHEN** dashboard stats are loading
- **THEN** stat card skeletons are displayed

#### Scenario: Form loading
- **WHEN** form data (e.g., categories) is loading
- **THEN** form field skeletons are displayed

