## Why

The PRD requires a paginated card view of all transactions with filtering, search, and date range (Story 5, Feature 5). Users need to browse, find, and review specific entries. Currently no entity list component, card display, or filtering API exists.

## What Changes

- Create transaction card list page accessible from sidebar "Entity" tab
- Display transactions as cards with: name, description, value, positive/negative indicator, optional image, optional categories
- Implement filters: All, Expense only, Income only
- Implement search by name, description, or category
- Implement date range filter
- Implement pagination with configurable page size
- Create GET `/api/transactions` endpoint with filtering, search, and pagination support
- Support grouping/categorical views via entity metadata

## Capabilities

### New Capabilities
- `entity-card-list`: Paginated card view of all transactions with filtering and search
- `entity-card-component`: Individual transaction card displaying name, description, value, indicator, image, categories
- `entity-filters`: Filter controls for type (all/expense/income), search, and date range
- `entity-pagination`: Pagination controls with page size and navigation
- `entity-api`: GET endpoint for transactions with filtering, search, pagination, and aggregation

### Modified Capabilities
<!-- No existing specs to modify -->

## Impact

- New page at `/entity` or sidebar "Entity" tab route
- New React components in `src/features/entity/`
- New API endpoint `GET /api/transactions` with query parameters
- Depends on `database-schema` for transaction repository with filtering/pagination
- Depends on `ui-design-system` for card styling and layout
- Depends on `auth-setup` for authenticated access
