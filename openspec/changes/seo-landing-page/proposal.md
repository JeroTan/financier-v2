## Why

The PRD MVP scope includes an SEO landing page (Phase 1). This is the first page unauthenticated visitors see — it must communicate Financier's value proposition, drive sign-ups, and rank in search engines. Currently no landing page, SEO metadata, or public route exists.

## What Changes

- Create a public landing page at `/` with hero section, features overview, and call-to-action
- Implement SEO meta tags (title, description, Open Graph, structured data)
- Add responsive design for mobile and desktop
- Include navigation with login/register links
- Use the Liquid Gold Ledger design system for consistent branding
- Ensure page loads without authentication (public route)

## Capabilities

### New Capabilities
- `landing-page`: Public homepage with hero, features, and CTA sections
- `seo-metadata`: Meta tags, Open Graph, structured data, and sitemap support
- `public-navigation`: Top navigation bar with login/register links for unauthenticated users

### Modified Capabilities
<!-- No existing specs to modify -->

## Impact

- New Astro page at `src/pages/index.astro`
- New layout component `src/layouts/landing.astro`
- Public route — no auth middleware applied
- Depends on `ui-design-system` for design tokens and component styles
- Independent of `auth-setup`, `database-schema`, and other backend features
