## Why

The Financier app needs a cohesive, production-ready design system that translates the "Liquid Gold Ledger" UI design (`docs/ui-design.md`) into implementable Tailwind CSS v4 tokens, component styles, and layout patterns. Currently, `src/styles/global.css` only imports Tailwind with no custom configuration. Without a design system, each feature will develop inconsistent styles, breaking the Modern Corporate aesthetic the PRD calls for.

## What Changes

- Configure Tailwind CSS v4 with the Liquid Gold Ledger color palette, typography, spacing, and border radius tokens
- Import and configure Hanken Grotesk font family
- Create CSS custom properties (CSS variables) for all design tokens
- Define base component styles for chat bubbles, financial cards, input fields, chips, and progress bars
- Set up dark mode variant of the color palette
- Establish layout patterns for desktop (3-pane) and mobile (single-pane with bottom nav)

## Capabilities

### New Capabilities
- `tailwind-design-tokens`: Tailwind CSS v4 configuration with Liquid Gold Ledger color palette, typography, spacing, and radius tokens
- `font-setup`: Hanken Grotesk font integration with defined typographic scale
- `base-component-styles`: Reusable CSS component classes for chat bubbles, financial cards, input fields, chips, progress bars
- `layout-patterns`: Desktop 3-pane and mobile single-pane layout patterns with responsive breakpoints
- `dark-mode-theme`: Dark mode variant of the Liquid Gold Ledger color palette

### Modified Capabilities
<!-- No existing specs to modify -->

## Impact

- `src/styles/global.css` will be expanded with design tokens and component styles
- `astro.config.mjs` already configures Tailwind CSS v4 via `@tailwindcss/vite`
- All frontend components (`frontend-chat-ui`, `frontend-stats-dashboard`) will consume these tokens
- No breaking changes — this is foundational styling that features build on top of
