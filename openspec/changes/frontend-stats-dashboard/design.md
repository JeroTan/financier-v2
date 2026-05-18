## Context

The stats dashboard displays financial data in a Harvest Moon-inspired ledger format with daily, monthly, and yearly views. It shares the dashboard page with the chat component and must dynamically hide when chat becomes active. The stats need real-time updates after each transaction save.

## Goals / Non-Goals

**Goals:**
- Clean ledger table UI with icons, color coding, and easy scanning
- Daily/monthly/yearly view toggles with income/expense breakdowns
- Goal tracking with user-settable goals and progress indicators
- Real-time stat refresh after transaction save
- Dynamic layout coordination with chat component
- Graceful empty states

**Non-Goals:**
- Data visualization charts (line graphs, pie charts)
- Export to CSV/PDF (Phase 2)
- Comparative period analysis (e.g., "this month vs last month")
- Budget planning or forecasting

## Decisions

### 1. Ledger Table Design

**Decision**: Use a table-based layout with icon prefixes, color-coded amounts (green for income, red for expenses), and summary rows.

**Rationale**: Matches the Harvest Moon aesthetic — clean, scannable, game-inspired. Tables are naturally accessible and responsive.

**Alternatives considered**:
- Card-based layout: Less scannable for ledger data
- Chart-based: Loses the specific transaction detail the PRD calls for

### 2. Stats API Design

**Decision**: Single endpoint `GET /api/stats?period=daily|monthly|yearly&date=YYYY-MM-DD` that returns aggregated income, expenses, and net for the specified period.

**Rationale**: One endpoint with a period parameter is simpler than three separate endpoints. The backend handles the date range calculation.

### 3. Goal Storage

**Decision**: Goals stored in D1 with fields: user_id, type (daily/monthly/yearly), target_amount, category (optional), start_date, end_date.

**Rationale**: Flexible enough to support various goal types. Optional category allows specific or general goals.

### 4. Real-Time Updates

**Decision**: Stats refresh via a simple re-fetch after the chat component receives a `transaction_saved` SSE event. No WebSocket or polling needed.

**Rationale**: Simple, reliable, and sufficient for single-user scale. The chat component can emit a custom event that the stats component listens for.

### 5. Empty States

**Decision**: Show friendly empty state messages with CTAs: "No transactions this month" → "Start tracking with chat" or "Add your first transaction".

**Rationale**: Guides new users toward the core action (logging transactions).

## Risks / Trade-offs

| Risk | Impact | Mitigation |
|------|--------|------------|
| Stats query slow with many transactions | Medium | Index on user_id + date, aggregate at query time |
| Goal progress calculation edge cases | Low | Handle division by zero, partial periods, and missing data |
| Layout conflict with chat component | Low | Use shared React context or state for `chatActive` flag |
| Mobile table readability | Medium | Horizontal scroll or card fallback on small screens |
