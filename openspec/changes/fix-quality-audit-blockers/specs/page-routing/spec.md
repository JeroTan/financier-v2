## ADDED Requirements

### Requirement: Page components import in Astro frontmatter
Astro pages and layouts SHALL import components used in templates from frontmatter or valid module scripts.

#### Scenario: App layout imports
- **WHEN** `AppLayout.astro` is type-checked
- **THEN** `Sidebar` and `Toaster` are recognized as template components

#### Scenario: Stats page imports
- **WHEN** `stats.astro` is type-checked
- **THEN** it contains no duplicate unused client-side imports for server-rendered components

### Requirement: Authenticated page token props
Authenticated pages SHALL pass a valid auth mechanism to hydrated React components.

#### Scenario: Dashboard hydration
- **WHEN** `/dashboard` renders for an authenticated user
- **THEN** hydrated chat components receive auth data needed for protected API calls
