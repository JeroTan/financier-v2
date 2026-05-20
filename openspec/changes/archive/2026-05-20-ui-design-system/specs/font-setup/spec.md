## ADDED Requirements

### Requirement: Hanken Grotesk font loading
The system SHALL load the Hanken Grotesk font family from Google Fonts with weights 400, 600, and 700, using `font-display: swap`.

#### Scenario: Font loaded on page render
- **WHEN** the page first renders
- **THEN** system fallback font displays until Hanken Grotesk loads, then swaps

### Requirement: Font family assignment
The system SHALL assign Hanken Grotesk as the default sans-serif font family for all text elements via Tailwind's `font-sans` utility.

#### Scenario: Default font applied
- **WHEN** a component uses `font-sans`
- **THEN** Hanken Grotesk is applied as the font family

### Requirement: Typographic utility classes
The system SHALL provide Tailwind utility classes for each typographic role: `text-headline-lg`, `text-headline-md`, `text-body-lg`, `text-body-sm`, `text-label-md`, and `text-data-display`.

#### Scenario: Headline styling applied
- **WHEN** an element uses `text-headline-lg`
- **THEN** it renders at 32px, 700 weight, 1.2 line-height, -0.02em letter-spacing

#### Scenario: Body text styling applied
- **WHEN** an element uses `text-body-lg`
- **THEN** it renders at 16px, 400 weight, 1.6 line-height
