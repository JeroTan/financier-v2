## Context

The PRD MVP requires an SEO landing page as the first touchpoint for unauthenticated visitors. This page must communicate Financier's value proposition (frictionless AI-powered expense tracking), drive sign-ups, and be discoverable via search engines. It is the only public-facing page before authentication.

## Goals / Non-Goals

**Goals:**
- Hero section with clear value proposition and CTA
- Features overview section highlighting AI chat, manual entry, stats, and goals
- SEO meta tags for search engine discoverability
- Responsive design matching the Liquid Gold Ledger design system
- Navigation with login/register links

**Non-Goals:**
- Blog or content marketing pages
- Pricing page (free app)
- Testimonials or social proof sections
- Footer with legal pages (terms, privacy) — add post-launch

## Decisions

### 1. Page Technology

**Decision**: Build as an Astro page (`src/pages/index.astro`) with embedded React components for interactive sections.

**Rationale**: Astro is ideal for content-heavy, SEO-optimized pages. It ships zero JavaScript by default. React components are used only where interactivity is needed (e.g., animated counters).

**Alternatives considered**:
- Pure React page: Ships unnecessary JS, slower initial load
- Static HTML: Harder to maintain, no component reuse

### 2. SEO Strategy

**Decision**: Use Astro's built-in `<head>` management for meta tags, Open Graph, and structured data. Generate a `sitemap.xml` at build time.

**Rationale**: Astro has native SEO support. Structured data (JSON-LD) helps search engines understand the app's purpose.

### 3. Navigation

**Decision**: Simple top bar with logo, "Features" anchor link, and "Sign In" / "Get Started" buttons. No hamburger menu on mobile — stack vertically.

**Rationale**: Minimal navigation keeps focus on the CTA. The app is simple enough that a features section is sufficient.

### 4. Performance

**Decision**: Target Lighthouse score of 90+ on all metrics. Use Astro's image optimization, font preloading, and minimal JS.

**Rationale**: Landing page performance directly impacts conversion and SEO ranking.

## Risks / Trade-offs

| Risk | Impact | Mitigation |
|------|--------|------------|
| Landing page too generic | Medium | Focus on AI chat as the key differentiator, use specific examples |
| SEO takes time to rank | Low | Add structured data, ensure fast load, submit sitemap to Google Search Console |
| Design inconsistency with app | Low | Use the same design system tokens from `ui-design-system` |
