## ADDED Requirements

### Requirement: Color palette tokens
The system SHALL define all Liquid Gold Ledger color tokens as CSS custom properties and Tailwind theme extensions, including: surface colors (7 levels), primary colors (6 variants), secondary colors (6 variants), tertiary colors (6 variants), error colors (4 variants), outline colors (2 variants), and background/on-background colors.

#### Scenario: Primary color accessible
- **WHEN** a component uses `text-primary` or `bg-primary`
- **THEN** the color resolves to `#795900` or its CSS variable equivalent

#### Scenario: Surface hierarchy rendered
- **WHEN** a component uses surface container colors
- **THEN** the correct elevation level is applied (lowest → highest: `#ffffff` → `#e1e3e4`)

### Requirement: Typography tokens
The system SHALL define typography tokens matching the Hanken Grotesk scale: headline-lg (32px/700), headline-md (20px/600), body-lg (16px/400), body-sm (14px/400), label-md (12px/600), and data-display (28px/700).

#### Scenario: Data display value rendered
- **WHEN** a monetary value uses the data-display token
- **THEN** it renders at 28px, 700 weight, -0.01em letter-spacing

#### Scenario: Label metadata rendered
- **WHEN** a metadata label uses the label-md token
- **THEN** it renders at 12px, 600 weight, 0.05em letter-spacing, uppercase

### Requirement: Spacing tokens
The system SHALL define spacing tokens based on an 8px base: xs (4px), sm (12px), md (24px), lg (40px), chat-gap (16px), and container-max (1200px).

#### Scenario: Chat gap applied
- **WHEN** message bubbles use the chat-gap spacing
- **THEN** a 16px gap is applied between message clusters

### Requirement: Border radius tokens
The system SHALL define border radius tokens: sm (0.25rem), DEFAULT (0.5rem), md (0.75rem), lg (1rem), xl (1.5rem), and full (9999px).

#### Scenario: Financial card radius applied
- **WHEN** a financial card uses the lg radius token
- **THEN** it renders with 1rem (16px) border radius

#### Scenario: Button pill shape applied
- **WHEN** a button uses the full radius token
- **THEN** it renders as a pill shape (9999px border radius)
