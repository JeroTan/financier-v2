## Context

The Financier app has 11 feature changes but no unified application structure. Pages, navigation, route protection, shared UI patterns, and API utilities need to be established first so all other features have a consistent foundation to build on. The codebase currently has `src/pages/` with no pages, `src/layouts/` with no layouts, and `src/components/` with no components.

## Goals / Non-Goals

**Goals:**
- App shell with sidebar navigation for all authenticated pages
- Astro page routing for dashboard, entry, entity, stats, settings
- Route protection via middleware redirecting to login
- shadcn/ui initialized and configured
- Global error boundary, toast system, loading skeletons
- Reusable API client with JWT injection

**Non-Goals:**
- Building actual feature pages (content comes from other changes)
- Mobile bottom navigation (covered by `ui-design-system` layout patterns)
- Deep linking or URL-based state management

## Decisions

### 1. Astro Routing vs. React Router

**Decision**: Use Astro's file-based routing for page structure. Each page is an `.astro` file that imports a React component for the interactive content.

**Rationale**: Astro is the framework. Its routing is simple, file-based, and SSR-friendly. React Router would add unnecessary complexity since we don't need client-side navigation between pages — each page is a full route.

**Alternatives considered**:
- React Router SPA: Loses Astro's SSR benefits, more complex setup
- Astro endpoints + React SPA: Overkill for this app size

### 2. Sidebar Navigation

**Decision**: Fixed left sidebar with navigation links, collapsible on mobile. Active state highlights current page.

**Rationale**: Standard pattern for dashboard apps. Matches the PRD's "sidebar tab" references. Collapsible on mobile saves screen space.

### 3. Route Protection

**Decision**: Astro middleware checks for valid JWT in cookies. If missing or invalid, redirect to `/login`. Public routes (`/`, `/login`, `/register`) are exempt.

**Rationale**: Server-side protection is more secure than client-side guards. Astro middleware runs before page rendering.

### 4. shadcn/ui Setup

**Decision**: Initialize shadcn/ui with the `new-york` style variant, configured for Tailwind CSS v4. Components are copied into `src/components/ui/`.

**Rationale**: shadcn/ui provides accessible, well-designed primitives. The `new-york` variant has better mobile defaults. Tailwind v4 compatibility requires the latest shadcn CLI.

### 5. API Client

**Decision**: Create a typed `apiClient` utility that wraps `fetch`, automatically injects the JWT from cookies, parses JSON responses into `ApiSuccess<T>` or `ApiError<D>` types, and throws on errors.

**Rationale**: Every feature needs to call APIs. A shared client prevents duplication of auth headers, error parsing, and type casting.

### 6. Toast System

**Decision**: Use `sonner` (the toast library shadcn/ui recommends) for global toast notifications. Mounted in the app layout, triggered via `toast.success()`, `toast.error()`, etc.

**Rationale**: Sonner is lightweight, accessible, and integrates with shadcn/ui's design system.

### 7. Error Boundary

**Decision**: React Error Boundary wrapping the entire app content area. On error, displays a friendly message with a retry button.

**Rationale**: Catches rendering errors that middleware can't handle. Prevents white screens of death.

## Risks / Trade-offs

| Risk | Impact | Mitigation |
|------|--------|------------|
| Astro middleware conflicts with API routes | Medium | API routes are in `src/pages/api/`, middleware excludes `/api/*` paths |
| shadcn/ui Tailwind v4 compatibility issues | Medium | Use latest shadcn CLI, test token compatibility |
| Sidebar takes too much space on small screens | Low | Collapsible on mobile, use bottom nav pattern from design system |
| API client cookie access in Astro SSR | Medium | Use Astro's `Astro.request` to read cookies server-side, pass to React via props |
