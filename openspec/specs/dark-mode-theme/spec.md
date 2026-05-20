# dark-mode-theme Specification

## Purpose
TBD - created by archiving change ui-design-system. Update Purpose after archive.
## Requirements
### Requirement: Dark mode color variables
The system SHALL define dark mode CSS variable overrides for all color tokens when `[data-theme="dark"]` is set on the `<html>` element. Dark mode surface colors SHALL use darker values (inverse-surface `#2e3132` as base) with adjusted contrast ratios.

#### Scenario: Dark mode activated
- **WHEN** `data-theme="dark"` is set on the html element
- **THEN** all color tokens switch to their dark mode values

#### Scenario: Dark mode surface hierarchy
- **WHEN** dark mode is active
- **THEN** surface containers use appropriately darkened values maintaining the elevation hierarchy

### Requirement: Dark mode Tailwind configuration
The system SHALL configure Tailwind's `darkMode` to use `selector` mode, enabling `dark:` prefix utilities that respond to the `data-theme="dark"` attribute.

#### Scenario: Dark utility class applied
- **WHEN** a component uses `dark:bg-surface-container`
- **THEN** the dark mode surface color is applied when dark mode is active

### Requirement: Dark mode typography adjustments
The system SHALL adjust text colors for dark mode: primary text SHALL use `inverse-on-surface` (`#eff1f2`), and semantic colors SHALL maintain WCAG AA contrast ratios against dark backgrounds.

#### Scenario: Dark mode text readable
- **WHEN** dark mode is active
- **THEN** all text meets WCAG AA contrast ratios against dark backgrounds

### Requirement: Theme toggle integration
The system SHALL support theme switching via a `data-theme` attribute toggle on the `<html>` element, persisting the preference in localStorage.

#### Scenario: Theme preference saved
- **WHEN** a user toggles dark mode
- **THEN** the `data-theme` attribute is updated and the preference is saved to localStorage

#### Scenario: Theme preference restored
- **WHEN** the page loads with a saved theme preference
- **THEN** the correct `data-theme` attribute is applied before first paint

