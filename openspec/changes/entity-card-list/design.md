## Context

The PRD requires a paginated card list of all transactions with filtering, search, and date range. This is the primary browsing interface for reviewing past entries. The `database-schema` change provides the transaction repository with filtering and pagination support. The `ui-design-system` change provides card styling and layout patterns.

## Goals / Non-Goals

**Goals:**
- Paginated card view of all transactions
- Filters: All, Expense only, Income only
- Search by name, description, or category
- Date range filter
- Cards show: name, description, value, indicator, image, categories
- Responsive: card grid on desktop, single column on mobile

**Non-Goals:**
- Transaction editing or deletion (Phase 2)
- Export to CSV (Phase 2)
- Bulk selection or operations

## Decisions

### 1. API Design

**Decision**: Single `GET /api/transactions` endpoint with query parameters: `?type=&search=&startDate=&endDate=&page=&limit=`.

**Rationale**: One endpoint with composable filters is simpler than multiple specialized endpoints. Query parameters are cacheable and bookmarkable.

### 2. Pagination Strategy

**Decision**: Offset-based pagination with configurable page size (default 20). Return `{ transactions, total, page, limit, totalPages }`.

**Rationale**: Offset pagination is simple and sufficient for personal app scale. Cursor pagination is overkill for < 10K transactions.

### 3. Card Layout

**Decision**: CSS Grid card layout — 2 columns on desktop, 1 column on mobile. Each card uses the financial card styles from the design system (4px accent bar, data-display amount).

**Rationale**: Grid provides consistent card sizing. The design system already defines the card visual language.

### 4. Search Scope

**Decision**: Search queries match against transaction description, category name, and auto-generated name (e.g., "Burger" from AI parsing).

**Rationale**: Covers the most common search patterns without full-text search complexity. SQLite `LIKE` is sufficient for personal scale.

## Risks / Trade-offs

| Risk | Impact | Mitigation |
|------|--------|------------|
| Slow search with many transactions | Low | Index on description and category, LIMIT results |
| Date range filter edge cases | Low | Validate date format server-side, handle invalid ranges gracefully |
| Card image loading performance | Medium | Lazy load images, use R2 CDN URLs with resizing |
