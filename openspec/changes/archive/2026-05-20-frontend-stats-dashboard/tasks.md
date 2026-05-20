## 1. Project Setup

- [x] 1.1 Create directory structure: `src/components/stats/`, `src/features/stats/`
- [x] 1.2 Set up shadcn/ui components needed (Card, Button, Progress, Tabs)

## 2. Stats Dashboard

- [x] 2.1 Create `StatsDashboard` component with period toggle (daily/monthly/yearly)
- [x] 2.2 Implement total income, expenses, and net display
- [x] 2.3 Implement net color coding (green positive, red negative)
- [x] 2.4 Implement period toggle state management

## 3. Ledger View

- [x] 3.1 Create `StatsLedgerTable` component with icon prefixes and color-coded amounts
- [x] 3.2 Implement time period grouping (day/month/year) with subtotals
- [x] 3.3 Apply Harvest Moon styling (clean table, alternating rows, clear typography)
- [x] 3.4 Implement responsive table fallback for mobile (card view)

## 4. Goal Tracking

- [x] 4.1 Create `GoalCard` component with progress bar
- [x] 4.2 Create `GoalCreationForm` with type, target amount, and optional category
- [x] 4.3 Implement goal progress calculation display
- [x] 4.4 Implement goal deletion with confirmation

## 5. API Integration

- [x] 5.1 Create `useStats` hook that fetches from `GET /api/stats?period=&date=`
- [x] 5.2 Create `GET /api/stats` endpoint with period/date query params
- [x] 5.3 Wire endpoint to transaction repository aggregateTransactions
- [x] 5.4 Add auth middleware to endpoint
- [x] 5.5 Add `routeDetail()` — summary, tags, query params schema, response schema (income/expenses/net), error codes
- [x] 5.6 Implement loading state with skeleton/spinner
- [x] 5.7 Implement error state with retry option
- [x] 5.8 Implement real-time refresh on `transaction_saved` custom event

## 6. Empty States

- [x] 6.1 Create `StatsEmptyState` component for no transactions
- [x] 6.2 Create `GoalsEmptyState` component with CTA to create goal
- [x] 6.3 Implement first-time user CTA ("Start tracking with chat")

## 7. Layout Integration

- [x] 7.1 Integrate stats dashboard into the 40/60 split layout
- [x] 7.2 Wire `chatActive` state to stats panel visibility
- [x] 7.3 Ensure stats refresh triggers on dashboard mount and transaction save
