## ADDED Requirements

### Requirement: Resolved component styles
All shared UI component classes SHALL compile to concrete CSS rules in Tailwind output.

#### Scenario: Button styles resolve
- **WHEN** a Button renders with the default variant
- **THEN** background, foreground, hover, focus ring, border radius, and disabled styles resolve to non-empty computed values

#### Scenario: Card styles resolve
- **WHEN** a Card renders
- **THEN** its background, foreground, border, radius, and shadow classes resolve to concrete styles

#### Scenario: Form field styles resolve
- **WHEN** Input, Textarea, Select, Switch, Tabs, Dialog, Tooltip, or Dropdown components render
- **THEN** referenced `border`, `input`, `ring`, `popover`, `accent`, `muted`, and `foreground` token classes resolve
