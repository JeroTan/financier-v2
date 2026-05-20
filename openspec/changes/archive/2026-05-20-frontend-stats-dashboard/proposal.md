## Why

The Financier dashboard needs to display real-time financial stats in a clean, scannable format inspired by Harvest Moon's ledger screens. Users need daily, monthly, and yearly views with income/expense breakdowns, goal tracking, and progress indicators. The stats panel shares the dashboard with the chat component and must dynamically hide when the chat becomes active.

## What Changes

- Build stats dashboard component with daily/monthly/yearly view toggles
- Implement Harvest Moon-style ledger table UI (icon-based, color-coded, easy to scan)
- Create goal tracking display with user-settable goals and progress indicators
- Fetch stats from API with real-time updates after each transaction
- Handle dynamic layout: stats panel occupies 40% of dashboard, hides when chat starts
- Support empty states (no data for selected period, no goals set)

## Capabilities

### New Capabilities
- `stats-dashboard`: Main stats component with time period toggles and dynamic layout integration
- `stats-ledger-view`: Harvest Moon-style table display with icons, color coding, and breakdown rows
- `stats-goal-tracking`: Goal setting UI, progress calculation, and visual indicators
- `stats-api-integration`: Data fetching for income/expense aggregations by time period
- `stats-empty-states`: Graceful handling of no-data scenarios with helpful messaging

### Modified Capabilities
<!-- No existing specs to modify -->

## Impact

- New React components in `src/components/` or `src/features/`
- Depends on `database-schema` for transaction aggregation queries
- Depends on `frontend-chat-ui` for shared dashboard layout coordination
- API endpoints needed: `GET /api/stats/daily`, `GET /api/stats/monthly`, `GET /api/stats/yearly`, `GET /api/stats/goals`
- Real-time stat refresh triggered after transaction save (via SSE or polling)
