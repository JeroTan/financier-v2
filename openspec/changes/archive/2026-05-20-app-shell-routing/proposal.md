## Why

The Financier app needs a unified application shell that ties all features together: sidebar navigation, page routing, authenticated route protection, and shared UI infrastructure. Currently there's no app layout, no page structure, no route guards, and no shared components like toasts, error boundaries, or loading skeletons. Without this foundation, each feature change would duplicate layout logic and have inconsistent UX patterns.

## What Changes

- Create the app shell layout with sidebar navigation (Dashboard, Entry, Entity, Stats, Settings)
- Set up Astro page routing structure for all app pages
- Implement authenticated route protection via Astro middleware
- Initialize shadcn/ui component library
- Create global error boundary for React rendering errors
- Implement toast/notification system for success/error feedback
- Create loading skeleton patterns for consistent loading states
- Build reusable API client utility with JWT token injection

## Capabilities

### New Capabilities
- `app-layout`: Main application shell with sidebar navigation and content area
- `page-routing`: Astro page structure for dashboard, entry, entity, stats, settings routes
- `route-protection`: Auth middleware that redirects unauthenticated users to login
- `shadcn-setup`: shadcn/ui initialization with Tailwind CSS v4 compatibility
- `global-error-boundary`: React error boundary catching rendering errors with recovery UI
- `toast-system`: Global toast/notification system for success, error, warning, and info messages
- `loading-skeletons`: Consistent skeleton loading patterns for cards, tables, and forms
- `api-client`: Reusable fetch wrapper with JWT token injection, error handling, and typed responses

### Modified Capabilities
<!-- No existing specs to modify -->

## Impact

- New layout at `src/layouts/app.astro` wrapping all authenticated pages
- New sidebar component in `src/components/layout/Sidebar.tsx`
- New pages: `src/pages/dashboard.astro`, `src/pages/entry.astro`, `src/pages/entity.astro`, `src/pages/stats.astro`, `src/pages/settings.astro`
- New middleware at `src/middleware.ts` for route protection
- shadcn/ui components initialized via CLI
- All feature changes (`frontend-chat-ui`, `manual-entry-form`, etc.) consume this shell
- Depends on `auth-setup` for JWT validation in middleware
- Depends on `ui-design-system` for design tokens
- Uses `cross-env` / `CLOUDFLARE_ENV` pattern from `package.json` for environment-aware behavior
