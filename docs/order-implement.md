# Financier - Implementation Order

**Last updated**: 2026-05-18
**Total changes**: 13
**Total tasks**: 381

---

## Dependency Graph

```
Phase 1: Foundation (must be done first, in order)
┌─────────────────────┐
│  1. database-schema  │  ← No dependencies
└────────┬────────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌──────────┐ ┌──────────────────┐
│ 2. auth  │ │ 3. ui-design-    │  ← No dependencies (can do parallel with #1)
│ -setup   │ │    system        │
└────┬─────┘ └────────┬─────────┘
     │                │
     └───────┬────────┘
             ▼
┌─────────────────────┐
│ 4. app-shell-routing│  ← Depends on #2 (auth), #3 (design)
└────────┬────────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌──────────┐ ┌─────────────────────┐
│ 5. ai-   │ │ 8. api-rate-        │  ← Depends on #4 (middleware)
│ chat-    │ │    limiting         │
│ arch     │ └─────────────────────┘
└────┬─────┘
     │
┌────┴────────────┐
▼                 ▼
┌──────────────┐ ┌─────────────────────┐
│ 6. ai-       │ │ 7. ai-action-       │
│ personality  │ │    components       │
└──────────────┘ └─────────────────────┘

Phase 2: Features (can be done in parallel after Phase 1)
┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐
│ 9. frontend-chat-ui │ │ 10. manual-entry    │ │ 11. entity-card     │
│                     │ │     form            │ │     list            │
│ Depends: #5, #7, #3 │ │ Depends: #1, #3, #2 │ │ Depends: #1, #3, #2 │
└─────────────────────┘ └─────────────────────┘ └─────────────────────┘

┌─────────────────────┐ ┌─────────────────────┐
│ 12. frontend-stats  │ │ 13. seo-landing     │
│     dashboard       │ │     page            │
│ Depends: #1, #3     │ │ Depends: #3 only    │
└─────────────────────┘ └─────────────────────┘
```

---

## Phase 1: Foundation (sequential)

These must be completed in order. Each builds on the previous.

### 1. `database-schema` (35 tasks)
**Why first**: Everything needs data tables, repositories, and DTOs.
**Key outputs**: D1 tables (users, transactions, categories, goals), Drizzle ORM setup, 4 repositories, Zod DTOs.
**Time estimate**: 2-3 sessions

### 2. `auth-setup` (37 tasks)
**Why second**: All protected routes and API endpoints need authentication.
**Key outputs**: JWT auth, Google OAuth, auth middleware, rate limiting for auth endpoints, user settings API.
**Depends on**: `database-schema` (user repository)
**Time estimate**: 2-3 sessions

### 3. `ui-design-system` (27 tasks)
**Why third**: All frontend components need design tokens and base styles.
**Key outputs**: Tailwind tokens, Hanken Grotesk font, component styles (chat bubbles, cards, inputs), dark mode, layout patterns.
**Time estimate**: 1-2 sessions

### 4. `app-shell-routing` (44 tasks)
**Why fourth**: Provides the app layout, sidebar, page routes, shadcn/ui, error boundary, toast system, and API client that all features consume.
**Depends on**: `auth-setup` (middleware), `ui-design-system` (design tokens)
**Key outputs**: App layout, sidebar navigation, 5 page routes, route protection middleware, shadcn/ui init, error boundary, toast system, loading skeletons, API client.
**Time estimate**: 2-3 sessions

### 5. `ai-chat-architecture` (21 tasks)
**Why fifth**: The AI service is the core differentiator. Chat UI and personality depend on it.
**Depends on**: `database-schema` (tool schemas need repositories)
**Key outputs**: AI chat service, tool calling loop, SSE streaming protocol, message trail management, `POST /api/chat` endpoint.
**Time estimate**: 1-2 sessions

### 6. `ai-personality-system` (25 tasks)
**Why sixth**: Extends the AI chat with personality injection.
**Depends on**: `ai-chat-architecture` (system prompt loading), `auth-setup` (user settings for personality preference)
**Key outputs**: 10 personality prompt files, personality selector UI, runtime personality injection.
**Time estimate**: 1 session

### 7. `ai-action-components` (28 tasks)
**Why seventh**: Extends the AI chat with structured content rendering.
**Depends on**: `ai-chat-architecture` (streaming pipeline), `ui-design-system` (component styling)
**Key outputs**: Action format parser, 10 React action components, system prompt action instructions.
**Time estimate**: 2 sessions

### 8. `api-rate-limiting` (18 tasks)
**Why here**: General rate limiting for all API endpoints. Can be done anytime after `app-shell-routing`.
**Depends on**: `app-shell-routing` (middleware infrastructure)
**Key outputs**: Rate limiting middleware, endpoint category config, 429 responses with headers.
**Time estimate**: 1 session

---

## Phase 2: Features (parallel)

These can be implemented in any order after Phase 1 is complete. They can even be done in parallel by different developers.

### 9. `frontend-chat-ui` (33 tasks)
**Depends on**: `ai-chat-architecture` (#5), `ai-action-components` (#7), `ui-design-system` (#3)
**Key outputs**: Chat component, confirmation UI, message trail (localStorage), SSE consumer, image upload, layout transition.
**Time estimate**: 2-3 sessions

### 10. `manual-entry-form` (32 tasks)
**Depends on**: `database-schema` (#1), `ui-design-system` (#3), `auth-setup` (#2)
**Key outputs**: Entry form component, validation, image upload, `POST /api/transactions` endpoint, unsaved changes guard.
**Time estimate**: 2 sessions

### 11. `entity-card-list` (33 tasks)
**Depends on**: `database-schema` (#1), `ui-design-system` (#3), `auth-setup` (#2)
**Key outputs**: Card list component, filters, search, pagination, `GET /api/transactions` endpoint.
**Time estimate**: 2 sessions

### 12. `frontend-stats-dashboard` (24 tasks)
**Depends on**: `database-schema` (#1), `ui-design-system` (#3)
**Key outputs**: Stats dashboard, ledger view, goal tracking, stats API integration, empty states.
**Time estimate**: 1-2 sessions

### 13. `seo-landing-page` (24 tasks)
**Depends on**: `ui-design-system` (#3) only — can be done anytime after design system is ready.
**Key outputs**: Landing page (hero, features), SEO metadata, public navigation, sitemap.
**Time estimate**: 1 session

---

## Quick Reference: What to build when

```
Session 1-2:  database-schema
Session 3-4:  auth-setup
Session 5:    ui-design-system
Session 6-7:  app-shell-routing
Session 8:    ai-chat-architecture
Session 9:    ai-personality-system
Session 10:   ai-action-components
Session 11:   api-rate-limiting
Session 12-13: frontend-chat-ui
Session 14-15: manual-entry-form
Session 16-17: entity-card-list
Session 18:    frontend-stats-dashboard
Session 19:    seo-landing-page
```

---

## Parallel Opportunities

After Phase 1 (sessions 1-7), these can be done simultaneously:

```
Developer A: frontend-chat-ui + ai-action-components (if not done)
Developer B: manual-entry-form + entity-card-list
Developer C: frontend-stats-dashboard + seo-landing-page
```

---

## Checklist

- [ ] 1. database-schema
- [ ] 2. auth-setup
- [ ] 3. ui-design-system
- [ ] 4. app-shell-routing
- [ ] 5. ai-chat-architecture
- [ ] 6. ai-personality-system
- [ ] 7. ai-action-components
- [ ] 8. api-rate-limiting
- [ ] 9. frontend-chat-ui
- [ ] 10. manual-entry-form
- [ ] 11. entity-card-list
- [ ] 12. frontend-stats-dashboard
- [ ] 13. seo-landing-page
