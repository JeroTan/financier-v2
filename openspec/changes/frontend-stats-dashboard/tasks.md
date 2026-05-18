## 1. Project Setup

- [ ] 1.1 Create directory structure: `src/components/stats/`, `src/features/stats/`
- [ ] 1.2 Set up shadcn/ui components needed (Card, Button, Progress, Tabs)

## 2. Stats Dashboard

- [ ] 2.1 Create `StatsDashboard` component with period toggle (daily/monthly/yearly)
- [ ] 2.2 Implement total income, expenses, and net display
- [ ] 2.3 Implement net color coding (green positive, red negative)
- [ ] 2.4 Implement period toggle state management

## 3. Ledger View

- [ ] 3.1 Create `StatsLedgerTable` component with icon prefixes and color-coded amounts
- [ ] 3.2 Implement time period grouping (day/month/year) with subtotals
- [ ] 3.3 Apply Harvest Moon styling (clean table, alternating rows, clear typography)
- [ ] 3.4 Implement responsive table fallback for mobile (card view)

## 4. Goal Tracking

- [ ] 4.1 Create `GoalCard` component with progress bar
- [ ] 4.2 Create `GoalCreationForm` with type, target amount, and optional category
- [ ] 4.3 Implement goal progress calculation display
- [ ] 4.4 Implement goal deletion with confirmation

## 5. API Integration

- [ ] 5.1 Create `useStats` hook that fetches from `GET /api/stats?period=&date=`
- [ ] 5.2 Implement loading state with skeleton/spinner
- [ ] 5.3 Implement error state with retry option
- [ ] 5.4 Implement real-time refresh on `transaction_saved` custom event

## 6. Empty States

- [ ] 6.1 Create `StatsEmptyState` component for no transactions
- [ ] 6.2 Create `GoalsEmptyState` component with CTA to create goal
- [ ] 6.3 Implement first-time user CTA ("Start tracking with chat")

## 7. Layout Integration

- [ ] 7.1 Integrate stats dashboard into the 40/60 split layout
- [ ] 7.2 Wire `chatActive` state to stats panel visibility
- [ ] 7.3 Ensure stats refresh triggers on dashboard mount and transaction save
