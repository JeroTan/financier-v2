# Financier - Implementation Order

**Last updated**: 2026-05-19
**Total changes**: 14
**Total tasks**: 407

---

## Dependency Graph

```
Phase 1: Foundation (must be done first, in order)
┌─────────────────────┐
│  1. database-schema  │  ← No dependencies ✅ DONE
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  2. openapi-docs    │  ← Depends on #1 (DTO schemas)
│  (ALL API schemas)  │     After this: /api/docs shows EVERY endpoint contract
└────────┬────────────┘
         │
    ┌────┴────────────────────┐
    ▼                         ▼
┌──────────┐          ┌──────────────────┐
│ 3. auth  │          │ 4. ui-design-    │  ← No dependencies (parallel with #3)
│ -setup   │          │    system        │
└────┬─────┘          └────────┬─────────┘
     │                         │
     └──────────┬──────────────┘
                ▼
┌─────────────────────┐
│ 5. app-shell-routing│  ← Depends on #3 (auth), #4 (design)
└────────┬────────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌──────────┐ ┌─────────────────────┐
│ 6. ai-   │ │ 9. api-rate-        │  ← Depends on #5 (middleware)
│ chat-    │ │    limiting         │
│ arch     │ └─────────────────────┘
└────┬─────┘
     │
┌────┴────────────┐
▼                 ▼
┌──────────────┐ ┌─────────────────────┐
│ 7. ai-       │ │ 8. ai-action-       │
│ personality  │ │    components       │
└──────────────┘ └─────────────────────┘

Phase 2: Features (can be done in parallel after Phase 1)
┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐
│ 10. frontend-chat-ui│ │ 11. manual-entry    │ │ 12. entity-card     │
│                     │ │     form            │ │     list            │
│ Depends: #6, #8, #4 │ │ Depends: #1, #4, #3 │ │ Depends: #1, #4, #3 │
└─────────────────────┘ └─────────────────────┘ └─────────────────────┘

┌─────────────────────┐ ┌─────────────────────┐
│ 13. frontend-stats  │ │ 14. seo-landing     │
│     dashboard       │ │     page            │
│ Depends: #1, #4     │ │ Depends: #4 only    │
└─────────────────────┘ └─────────────────────┘
```

---

## Phase 1: Foundation (sequential)

These must be completed in order. Each builds on the previous.

### 1. `database-schema` (35 tasks) ✅ DONE
**Why first**: Everything needs data tables, repositories, and DTOs.
**Key outputs**: D1 tables (users, transactions, categories, goals), Drizzle ORM setup, 4 repositories, Zod DTOs.
**Time estimate**: 2-3 sessions

### 2. `openapi-docs` (33 tasks)
**Why second**: Define ALL endpoint schemas upfront. After this, `/api/docs` shows every API contract — you can see what each endpoint accepts and returns before any are implemented.
**Depends on**: `database-schema` (#1, DTO schemas used in OpenAPI components)
**Key outputs**: `routeDetail()` helper, OpenAPI spec generator, Swagger UI at `/api/docs`, ALL endpoint schemas defined (auth, chat, transactions, stats, settings, receipts).
**Time estimate**: 1-2 sessions

### 3. `auth-setup` (37 tasks)
**Why third**: All protected routes and API endpoints need authentication. Endpoint schemas are already defined in #2.
**Key outputs**: JWT auth, Google OAuth, auth middleware, rate limiting for auth endpoints, user settings API.
**Depends on**: `database-schema` (user repository)
**Time estimate**: 2-3 sessions

### 4. `ui-design-system` (27 tasks)
**Why here**: All frontend components need design tokens and base styles. Can be done in parallel with #3.
**Key outputs**: Tailwind tokens, Hanken Grotesk font, component styles (chat bubbles, cards, inputs), dark mode, layout patterns.
**Time estimate**: 1-2 sessions

### 5. `app-shell-routing` (44 tasks)
**Why fifth**: Provides the app layout, sidebar, page routes, shadcn/ui, error boundary, toast system, and API client that all features consume.
**Depends on**: `auth-setup` (#3, middleware), `ui-design-system` (#4, design tokens)
**Key outputs**: App layout, sidebar navigation, 5 page routes, route protection middleware, shadcn/ui init, error boundary, toast system, loading skeletons, API client.
**Time estimate**: 2-3 sessions

### 6. `ai-chat-architecture` (21 tasks)
**Why sixth**: The AI service is the core differentiator. Chat endpoint schema already defined in #2.
**Depends on**: `database-schema` (#1, tool schemas need repositories)
**Key outputs**: AI chat service, tool calling loop, SSE streaming protocol, message trail management, `POST /api/chat` endpoint.
**Time estimate**: 1-2 sessions

### 7. `ai-personality-system` (25 tasks)
**Why seventh**: Extends the AI chat with personality injection.
**Depends on**: `ai-chat-architecture` (#6, system prompt loading), `auth-setup` (#3, user settings for personality preference)
**Key outputs**: 10 personality prompt files, personality selector UI, runtime personality injection.
**Time estimate**: 1 session

### 8. `ai-action-components` (28 tasks)
**Why eighth**: Extends the AI chat with structured content rendering.
**Depends on**: `ai-chat-architecture` (#6, streaming pipeline), `ui-design-system` (#4, component styling)
**Key outputs**: Action format parser, 10 React action components, system prompt action instructions.
**Time estimate**: 2 sessions

### 9. `api-rate-limiting` (17 tasks)
**Why here**: General rate limiting for all API endpoints. Can be done anytime after `app-shell-routing`.
**Depends on**: `app-shell-routing` (#5, middleware infrastructure)
**Key outputs**: Rate limiting middleware, endpoint category config, 429 responses with headers.
**Time estimate**: 1 session

---

## Phase 2: Features (parallel)

These can be implemented in any order after Phase 1 is complete. They can even be done in parallel by different developers.

### 10. `frontend-chat-ui` (33 tasks)
**Depends on**: `ai-chat-architecture` (#6), `ai-action-components` (#8), `ui-design-system` (#4)
**Key outputs**: Chat component, confirmation UI, message trail (localStorage), SSE consumer, image upload, layout transition.
**Time estimate**: 2-3 sessions

### 11. `manual-entry-form` (32 tasks)
**Depends on**: `database-schema` (#1), `ui-design-system` (#4), `auth-setup` (#3)
**Key outputs**: Entry form component, validation, image upload, `POST /api/transactions` endpoint, unsaved changes guard.
**Time estimate**: 2 sessions

### 12. `entity-card-list` (33 tasks)
**Depends on**: `database-schema` (#1), `ui-design-system` (#4), `auth-setup` (#3)
**Key outputs**: Card list component, filters, search, pagination, `GET /api/transactions` endpoint.
**Time estimate**: 2 sessions

### 13. `frontend-stats-dashboard` (24 tasks)
**Depends on**: `database-schema` (#1), `ui-design-system` (#4)
**Key outputs**: Stats dashboard, ledger view, goal tracking, stats API integration, empty states.
**Time estimate**: 1-2 sessions

### 14. `seo-landing-page` (24 tasks)
**Depends on**: `ui-design-system` (#4) only — can be done anytime after design system is ready.
**Key outputs**: Landing page (hero, features), SEO metadata, public navigation, sitemap.
**Time estimate**: 1 session

---

## Quick Reference: What to build when

```
Session 1-2:  database-schema          ✅ DONE
Session 3-4:  openapi-docs             ← /api/docs ready with ALL endpoint schemas!
Session 5-6:  auth-setup
Session 7:    ui-design-system
Session 8-9:  app-shell-routing
Session 10:   ai-chat-architecture
Session 11:   ai-personality-system
Session 12-13: ai-action-components
Session 14:    api-rate-limiting
Session 15-16: frontend-chat-ui
Session 17-18: manual-entry-form
Session 19-20: entity-card-list
Session 21:    frontend-stats-dashboard
Session 22:    seo-landing-page
```

---

## Parallel Opportunities

After Phase 1 (sessions 1-9), these can be done simultaneously:

```
Developer A: frontend-chat-ui + ai-action-components (if not done)
Developer B: manual-entry-form + entity-card-list
Developer C: frontend-stats-dashboard + seo-landing-page
```

---

## Checklist

- [x] 1. database-schema
- [ ] 2. openapi-docs
- [ ] 3. auth-setup
- [ ] 4. ui-design-system
- [ ] 5. app-shell-routing
- [ ] 6. ai-chat-architecture
- [ ] 7. ai-personality-system
- [ ] 8. ai-action-components
- [ ] 9. api-rate-limiting
- [ ] 10. frontend-chat-ui
- [ ] 11. manual-entry-form
- [ ] 12. entity-card-list
- [ ] 13. frontend-stats-dashboard
- [ ] 14. seo-landing-page
