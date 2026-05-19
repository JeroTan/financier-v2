## 1. API Endpoint

- [ ] 1.1 Create `GET /api/transactions` endpoint with query parameter parsing
- [ ] 1.2 Implement Zod validation for query parameters
- [ ] 1.3 Wire endpoint to transaction repository getTransactions with filters
- [ ] 1.4 Add auth middleware to endpoint
- [ ] 1.5 Implement pagination response format `{ transactions, total, page, limit, totalPages }`
- [ ] 1.6 Add `routeDetail()` — summary, tags, query params schema, paginated response schema, error codes

## 2. Card Component

- [ ] 2.1 Create `TransactionCard` component with accent bar, amount, category icon, date
- [ ] 2.2 Implement income (green) and expense (red) color variants
- [ ] 2.3 Add optional image thumbnail display
- [ ] 2.4 Add optional category tags display
- [ ] 2.5 Implement hover elevation effect

## 3. Card List

- [ ] 3.1 Create `EntityCardList` component with CSS Grid layout
- [ ] 3.2 Implement 2-column grid on desktop, single column on mobile
- [ ] 3.3 Wire card list to GET `/api/transactions` endpoint
- [ ] 3.4 Implement loading state with skeleton cards
- [ ] 3.5 Implement empty state message

## 4. Filters

- [ ] 4.1 Create `EntityFilters` component with type toggle buttons (All/Expense/Income)
- [ ] 4.2 Create search input with debounce
- [ ] 4.3 Create date range picker with start and end date inputs
- [ ] 4.4 Wire filters to API query parameters
- [ ] 4.5 Implement filter combination logic
- [ ] 4.6 Implement "no results" empty state

## 5. Pagination

- [ ] 5.1 Create `EntityPagination` component with page numbers, prev/next buttons
- [ ] 5.2 Implement page size selector (10, 20, 50)
- [ ] 5.3 Wire pagination to API query parameters
- [ ] 5.4 Implement current page highlighting
- [ ] 5.5 Handle pagination edge cases (first page, last page)

## 6. Page Layout

- [ ] 6.1 Create Entity page layout with sidebar navigation
- [ ] 6.2 Integrate filters, card list, and pagination components
- [ ] 6.3 Implement responsive layout for mobile and desktop
- [ ] 6.4 Add page title and transaction count header

## 7. Integration

- [ ] 7.1 Wire filter changes to API refetch
- [ ] 7.2 Wire pagination changes to API refetch
- [ ] 7.3 Implement URL query parameter sync for shareable filtered views
- [ ] 7.4 Test full flow: apply filters → paginate → verify results
