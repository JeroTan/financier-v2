## ADDED Requirements

### Requirement: Personality selector UI
The system SHALL display a grid of personality preview cards in the settings page, each showing: personality name, icon, description, and example dialogue.

#### Scenario: Personality grid displayed
- **WHEN** the user opens the personality settings section
- **THEN** 10 personality cards are displayed in a responsive grid

#### Scenario: Selected personality highlighted
- **WHEN** a personality is currently selected
- **THEN** its card is visually highlighted with a border or background

### Requirement: Personality preview
The system SHALL show an example dialogue for each personality when the user hovers or taps on the personality card.

#### Scenario: Preview shown
- **WHEN** the user interacts with a personality card
- **THEN** an example dialogue demonstrating the personality's tone is displayed

### Requirement: Personality selection
The system SHALL allow the user to select a personality by clicking/tapping its card. The selection SHALL be saved immediately.

#### Scenario: Personality selected
- **WHEN** the user clicks a personality card
- **THEN** the personality is saved as the user's preference and a confirmation is shown

#### Scenario: Selection confirmation
- **WHEN** a new personality is selected
- **THEN** a brief toast or message confirms the change (e.g., "Personality changed to Influencer")
