## 1. Font Setup

- [x] 1.1 Add Hanken Grotesk Google Fonts link to Astro layout head with weights 400, 600, 700
- [x] 1.2 Configure `font-display: swap` for font loading
- [x] 1.2 Assign Hanken Grotesk as default `font-sans` in Tailwind theme

## 2. Design Tokens

- [x] 2.1 Define all Liquid Gold Ledger color tokens as CSS custom properties in `:root`
- [x] 2.2 Configure Tailwind v4 `@theme` block mapping CSS variables to Tailwind utilities
- [x] 2.3 Define typography tokens (headline-lg, headline-md, body-lg, body-sm, label-md, data-display) as Tailwind utilities
- [x] 2.4 Define spacing tokens (xs, sm, md, lg, chat-gap, container-max) in Tailwind theme
- [x] 2.5 Define border radius tokens (sm, DEFAULT, md, lg, xl, full) in Tailwind theme

## 3. Dark Mode

- [x] 3.1 Configure Tailwind `darkMode: 'selector'` in theme configuration
- [x] 3.2 Define dark mode CSS variable overrides under `[data-theme="dark"]`
- [x] 3.3 Verify all dark mode color tokens meet WCAG AA contrast ratios
- [x] 3.4 Implement theme toggle logic with localStorage persistence

## 4. Component Styles

- [x] 4.1 Create chat bubble styles (user: gold bg/right-aligned, bot: gray bg/left-aligned, 12px radius)
- [x] 4.2 Create financial entry card styles (vertical stack, 4px accent bar, data-display amount)
- [x] 4.3 Create input field styles (borderless, top border, attachment icon, gold send button)
- [x] 4.4 Create chip styles (1px border, pill shape, hover fill)
- [x] 4.5 Create progress bar styles (8px thick, rounded ends, gold fill)
- [x] 4.6 Create financial card elevation shadow (0, 4px offset; 20px blur; 4% opacity)

## 5. Layout Patterns

- [x] 5.1 Create desktop 3-pane CSS Grid layout (nav, chat, widgets) with 1200px max width
- [x] 5.2 Create mobile single-pane layout with bottom navigation bar
- [x] 5.3 Implement responsive breakpoints (mobile < 768px, tablet 768-1023px, desktop 1024px+)
- [x] 5.4 Set chat content inset (24px desktop, 16px mobile)
- [x] 5.5 Implement message cluster rhythm (4px sibling gap, 16px sender gap)

## 6. Global CSS

- [x] 6.1 Expand `src/styles/global.css` with all design tokens, theme config, and component styles
- [x] 6.2 Add CSS reset and base element styles
- [x] 6.3 Verify all tokens are accessible via Tailwind utility classes
- [x] 6.4 Test light/dark mode toggle in browser
