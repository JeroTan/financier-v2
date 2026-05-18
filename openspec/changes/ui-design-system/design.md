## Context

The `docs/ui-design.md` file defines a complete design system called "Liquid Gold Ledger" with a Modern Corporate aesthetic. It includes a full Material Design 3-style color palette (40+ tokens), Hanken Grotesk typography scale, spacing system (8px base), border radius tokens, and component specifications for chat bubbles, financial cards, widgets, and input fields. The current codebase has Tailwind CSS v4 configured via `@tailwindcss/vite` in `astro.config.mjs` but `src/styles/global.css` contains only `@import "tailwindcss"` with no custom tokens.

## Goals / Non-Goals

**Goals:**
- Translate the Liquid Gold Ledger design tokens into Tailwind CSS v4 custom properties and theme extensions
- Import Hanken Grotesk font and configure the typographic scale
- Create base component styles for all specified UI elements
- Support both light and dark mode variants
- Establish responsive layout patterns for desktop (3-pane) and mobile (single-pane)

**Non-Goals:**
- Building actual React components (that's the job of `frontend-chat-ui` and `frontend-stats-dashboard` changes)
- Animation libraries or motion design
- Icon library selection (though icon sizing and spacing is covered)
- Accessibility audit beyond color contrast compliance

## Decisions

### 1. Tailwind CSS v4 with CSS Custom Properties

**Decision**: Use Tailwind CSS v4's native CSS variable approach. Define all design tokens as CSS custom properties in `:root` and reference them in `@theme` blocks.

**Rationale**: Tailwind v4 has first-class CSS variable support. This approach is cleaner than v3's `tailwind.config.js` and enables runtime theme switching (light/dark mode) by changing variable values on `[data-theme="dark"]`.

```css
@theme {
  --color-primary: var(--primary);
  --color-primary-container: var(--primary-container);
  --font-family-sans: "Hanken Grotesk", sans-serif;
  /* ... */
}
```

**Alternatives considered**:
- Tailwind v3 config object: More verbose, harder to switch themes at runtime
- CSS-in-JS: Overhead not needed for a static design system

### 2. Font Loading Strategy

**Decision**: Load Hanken Grotesk from Google Fonts via `<link>` in the Astro layout head, with `font-display: swap`.

**Rationale**: Simple, reliable, and Astro handles font preloading automatically. The `swap` strategy ensures text is visible immediately.

**Alternatives considered**:
- Self-hosted fonts: Better performance but adds build complexity
- `@fontsource` package: Good alternative, adds npm dependency

### 3. Component Style Approach

**Decision**: Use Tailwind utility classes composed into reusable `@utility` patterns in `global.css`, rather than separate CSS class names.

**Rationale**: Keeps the Tailwind workflow intact. Components use utility classes directly. Common patterns are documented as "recipes" in comments.

**Alternatives considered**:
- BEM-style CSS classes: Breaks from Tailwind philosophy
- `@apply` directives: Works but creates hidden dependencies

### 4. Dark Mode Strategy

**Decision**: Use `data-theme="dark"` attribute on `<html>` element to switch CSS variable values. Tailwind's `dark:` variant will be configured to use `selector` mode.

**Rationale**: Matches the PRD's settings requirement (dark/light mode toggle). The attribute approach gives full control over when dark mode activates.

### 5. Layout Pattern

**Decision**: Use CSS Grid for the desktop 3-pane layout and Flexbox for mobile single-pane. The grid collapses to a single column on mobile breakpoints.

**Rationale**: CSS Grid is ideal for the 3-pane architecture. Flexbox handles the mobile bottom nav and stacked content naturally.

## Risks / Trade-offs

| Risk | Impact | Mitigation |
|------|--------|------------|
| Tailwind v4 theme syntax changes | Medium | Follow official v4 docs, test tokens after setup |
| Google Fonts loading delay | Low | Use `font-display: swap`, preload font files |
| Color contrast failures on gold text | Medium | Test all color combinations against WCAG AA standards |
| Dark mode token mapping incomplete | Low | Derive dark tokens from MD3 color relationships |
