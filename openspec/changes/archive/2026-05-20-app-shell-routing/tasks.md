## 1. shadcn/ui Setup

- [x] 1.1 Initialize shadcn/ui with `npx shadcn@latest init` using new-york style
- [x] 1.2 Configure shadcn for Tailwind CSS v4 compatibility
- [x] 1.3 Install base components: Button, Input, Card, Tabs, Progress, Avatar, Dialog, DropdownMenu, Select, Label, Textarea, Switch, Separator, Skeleton, Toast, Badge, Tooltip
- [x] 1.4 Install `sonner` for toast notifications

## 2. App Layout

- [x] 2.1 Create `src/layouts/app.astro` with sidebar + content area structure
- [x] 2.2 Create `src/components/layout/Sidebar.tsx` with navigation links
- [x] 2.3 Implement active page highlighting based on current route
- [x] 2.4 Implement sidebar collapse/hide on mobile viewports
- [x] 2.5 Mount `<Toaster />` in app layout
- [x] 2.6 Mount `<ErrorBoundary>` wrapper around app content

## 3. Page Routing

- [x] 3.1 Create `src/pages/dashboard.astro` — imports Dashboard React component
- [x] 3.2 Create `src/pages/entry.astro` — imports EntryForm React component
- [x] 3.3 Create `src/pages/entity.astro` — imports EntityCardList React component
- [x] 3.4 Create `src/pages/stats.astro` — imports StatsDashboard React component
- [x] 3.5 Create `src/pages/settings.astro` — imports Settings React component
- [x] 3.6 Configure `/` to redirect authenticated users to `/dashboard`

## 4. Route Protection

- [x] 4.1 Create `src/middleware.ts` with JWT validation logic
- [x] 4.2 Implement cookie-based JWT extraction and validation
- [x] 4.3 Implement redirect to `/login` for unauthenticated page requests
- [x] 4.4 Implement 401 response for unauthenticated API requests
- [x] 4.5 Exempt public routes: `/`, `/login`, `/register`, `/api/auth/*`, static assets
- [ ] 4.6 Test middleware with authenticated and unauthenticated requests

## 5. Error Boundary

- [x] 5.1 Create `src/components/ErrorBoundary.tsx` React error boundary
- [x] 5.2 Implement fallback UI with friendly message and "Try Again" button
- [x] 5.3 Implement error logging (console in dev, logging service in prod)
- [x] 5.4 Wrap app content area with ErrorBoundary in app layout

## 6. Loading Skeletons

- [x] 6.1 Create `src/components/ui/SkeletonCard.tsx` — card-shaped skeleton
- [x] 6.2 Create `src/components/ui/SkeletonTable.tsx` — table-row skeleton
- [x] 6.3 Create `src/components/ui/SkeletonForm.tsx` — form field skeleton
- [x] 6.4 Create `src/components/ui/SkeletonStat.tsx` — stat card skeleton
- [x] 6.5 Apply shimmer/pulse animation to all skeleton components

## 7. API Client

- [x] 7.1 Create `src/lib/api/client.ts` with typed `apiClient` utility
- [x] 7.2 Implement JWT token injection from cookies
- [x] 7.3 Implement response parsing into `ApiSuccess<T>` / `ApiError<D>`
- [x] 7.4 Implement error throwing for non-2xx responses
- [x] 7.5 Implement request ID tracking in errors
- [ ] 7.6 Write unit tests for apiClient with mocked fetch

## 8. Integration

- [x] 8.1 Verify all pages render within app layout
- [x] 8.2 Verify sidebar navigation works across all pages
- [x] 8.3 Verify route protection redirects unauthenticated users
- [x] 8.4 Verify toasts display correctly from any page
- [x] 8.5 Verify error boundary catches and displays rendering errors
- [x] 8.6 Verify skeletons display during loading states
- [ ] 8.7 Verify apiClient works with authenticated API calls
