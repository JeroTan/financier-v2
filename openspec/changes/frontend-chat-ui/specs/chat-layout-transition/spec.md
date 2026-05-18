## ADDED Requirements

### Requirement: Dynamic layout split
The system SHALL display a 40% stats / 60% chat split on the dashboard by default.

#### Scenario: Default layout
- **WHEN** the dashboard loads with no active chat
- **THEN** the stats panel occupies 40% and the chat occupies 60%

### Requirement: Stats hide on chat start
The system SHALL hide the stats panel (100% chat view) when the user starts a conversation.

#### Scenario: Chat becomes active
- **WHEN** the user sends their first message
- **THEN** the stats panel is hidden and the chat occupies 100% of the dashboard

### Requirement: Layout transition animation
The system SHALL animate the layout transition between split and full-chat views using CSS transitions.

#### Scenario: Smooth transition
- **WHEN** the layout changes from split to full-chat
- **THEN** the transition is animated smoothly

### Requirement: Stats restore on page load
The system SHALL restore the split layout on page load, even if there is an existing conversation in localStorage.

#### Scenario: Page refresh with existing chat
- **WHEN** the page is refreshed with messages in localStorage
- **THEN** the split layout is shown (stats 40%, chat 60%) with message history loaded
