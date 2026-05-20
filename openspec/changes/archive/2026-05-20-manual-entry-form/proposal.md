## Why

The PRD requires a manual transaction entry form as an alternative to AI chat (Story 2, Feature 2). Users need a traditional form to log expenses and income when chat is impractical — ambiguous inputs, offline scenarios, or preference for structured entry. Currently no form component, validation logic, or entry page exists.

## What Changes

- Create a manual entry form page accessible from sidebar "Entry" tab
- Implement form with fields: type (income/expense), amount, date, category, description, optional image
- Add inline validation with Zod schemas for all required fields
- Implement custom category creation within the form
- Add unsaved changes warning when navigating away
- Create POST `/api/transactions` endpoint for manual submission
- Emit transaction saved event to refresh dashboard stats

## Capabilities

### New Capabilities
- `entry-form`: Manual transaction entry form with all required fields and inline validation
- `entry-form-validation`: Zod-based validation for amount, date, category, and description fields
- `entry-form-image`: Optional image attachment for manual entries with preview and upload
- `transaction-api`: POST endpoint for creating transactions from manual entry
- `unsaved-changes-guard`: Navigation warning when form has unsaved data

### Modified Capabilities
<!-- No existing specs to modify -->

## Impact

- New page at `/entry` or sidebar "Entry" tab route
- New React form component in `src/features/entry/`
- New API endpoint `POST /api/transactions`
- Depends on `database-schema` for transaction repository and category repository
- Depends on `ui-design-system` for form styling (input fields, buttons, validation states)
- Depends on `auth-setup` for authenticated access
