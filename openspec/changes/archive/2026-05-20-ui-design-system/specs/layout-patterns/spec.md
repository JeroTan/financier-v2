## ADDED Requirements

### Requirement: Desktop 3-pane layout
The system SHALL define a CSS Grid layout for desktop with three panes: left navigation/history, center chat stream, and right contextual data widgets. The layout SHALL have a maximum container width of 1200px.

#### Scenario: Desktop layout rendered
- **WHEN** the viewport is 1024px or wider
- **THEN** the three-pane grid layout is displayed with proper column proportions

### Requirement: Mobile single-pane layout
The system SHALL collapse the layout to a single pane on mobile viewports, with navigation moved to a bottom bar and data widgets accessible via snap cards pulled from the header.

#### Scenario: Mobile layout rendered
- **WHEN** the viewport is below 768px
- **THEN** a single-pane layout is displayed with bottom navigation bar

### Requirement: Responsive breakpoint system
The system SHALL use responsive breakpoints: mobile (< 768px), tablet (768px - 1023px), desktop (1024px+).

#### Scenario: Breakpoint transition
- **WHEN** the viewport crosses a breakpoint threshold
- **THEN** the layout transitions to the appropriate configuration

### Requirement: Chat content inset
The system SHALL inset chat content from screen edges by 24px on desktop and 16px on mobile.

#### Scenario: Desktop chat inset
- **WHEN** chat content is displayed on desktop
- **THEN** it has 24px horizontal padding

#### Scenario: Mobile chat inset
- **WHEN** chat content is displayed on mobile
- **THEN** it has 16px horizontal padding

### Requirement: Message cluster rhythm
The system SHALL apply a 4px gap between sibling messages (same sender) and a 16px gap between different senders to visually group thoughts.

#### Scenario: Same-sender messages grouped
- **WHEN** consecutive messages are from the same sender
- **THEN** they have a 4px gap between them

#### Scenario: Different-sender messages separated
- **WHEN** messages alternate between user and bot
- **THEN** they have a 16px gap between them
