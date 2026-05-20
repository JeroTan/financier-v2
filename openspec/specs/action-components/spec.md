# action-components Specification

## Purpose
TBD - created by archiving change ai-action-components. Update Purpose after archive.
## Requirements
### Requirement: Card component
The system SHALL render a Card action as a transaction summary card showing: amount (data-display), type indicator (green/red), category icon, date, and description.

#### Scenario: Card rendered
- **WHEN** a Card action with valid JSON is parsed
- **THEN** a styled card component is displayed with the transaction details

### Requirement: Table component
The system SHALL render a Table action as a data table with header row and data rows, using the Harvest Moon ledger styling.

#### Scenario: Table rendered
- **WHEN** a Table action with headers and rows is parsed
- **THEN** a styled table is displayed with alternating row colors

### Requirement: Chart component
The system SHALL render a Chart action as a sparkline or mini chart showing data trends.

#### Scenario: Chart rendered
- **WHEN** a Chart action with data points is parsed
- **THEN** a sparkline visualization is displayed

### Requirement: Progress component
The system SHALL render a Progress action as a progress bar showing current value vs. target value with percentage.

#### Scenario: Progress rendered
- **WHEN** a Progress action with current and target values is parsed
- **THEN** a styled progress bar is displayed with percentage label

### Requirement: Alert component
The system SHALL render an Alert action as a styled alert box with type-based coloring (info=blue, warning=amber, success=green, error=red).

#### Scenario: Alert rendered
- **WHEN** an Alert action with text and type is parsed
- **THEN** a styled alert box is displayed with the appropriate color

### Requirement: List component
The system SHALL render a List action as a bullet or numbered list.

#### Scenario: List rendered
- **WHEN** a List action with newline-separated items is parsed
- **THEN** a styled list is displayed with bullet points

### Requirement: Image component
The system SHALL render an Image action as an image preview with the provided URL.

#### Scenario: Image rendered
- **WHEN** an Image action with a URL is parsed
- **THEN** an image preview is displayed with the image loaded from the URL

### Requirement: Divider component
The system SHALL render a Divider action as a horizontal line separator.

#### Scenario: Divider rendered
- **WHEN** a Divider action is parsed
- **THEN** a horizontal line is displayed

### Requirement: Insight component
The system SHALL render an Insight action as a highlighted text block with a lightbulb icon.

#### Scenario: Insight rendered
- **WHEN** an Insight action with text is parsed
- **THEN** a highlighted insight block is displayed with a lightbulb icon

### Requirement: Button component
The system SHALL render a Button action as one or more actionable buttons with labels and action types.

#### Scenario: Button rendered
- **WHEN** a Button action with button definitions is parsed
- **THEN** styled buttons are displayed that trigger the specified actions when clicked

