## Context

The PRD specifies a manual entry form as an alternative to AI chat for transaction logging. The form lives behind an "Entry" tab in the sidebar and includes type, amount, date, category, description, and optional image fields. The `database-schema` change provides the transaction and category repositories. The `ui-design-system` change provides form input styles and validation state styling.

## Goals / Non-Goals

**Goals:**
- Complete manual entry form with all required fields and inline validation
- Custom category creation inline within the form
- Image attachment with preview
- Unsaved changes warning on navigation
- Transaction saved to D1 via POST `/api/transactions`

**Non-Goals:**
- Transaction editing or deletion (Phase 2)
- Recurring transaction templates (Phase 2)
- Bulk entry or CSV import

## Decisions

### 1. Form Architecture

**Decision**: Use React Hook Form with Zod resolver for form state management and validation.

**Rationale**: React Hook Form is performant (no re-renders on every keystroke), has excellent Zod integration, and handles complex form patterns (dynamic fields, conditional validation) cleanly.

**Alternatives considered**:
- Plain React state: More boilerplate, harder validation
- Formik: Heavier bundle, slower performance

### 2. Category Selection

**Decision**: Use a searchable dropdown for category selection with an "Add new" option that opens an inline category creation input.

**Rationale**: Users may have many categories. Searchable dropdown scales better than radio buttons. Inline creation avoids context switching.

### 3. Image Upload

**Decision**: Images are uploaded to R2 via a separate `POST /api/receipts` endpoint, returning a URL that is included in the transaction creation payload.

**Rationale**: Separating image upload from transaction creation allows retry logic and progress indicators. The transaction references the image URL.

### 4. Unsaved Changes Guard

**Decision**: Use `beforeunload` event listener + React Router navigation guard to warn users about unsaved form data.

**Rationale**: Standard browser pattern for unsaved changes. Covers both browser close and in-app navigation.

## Risks / Trade-offs

| Risk | Impact | Mitigation |
|------|--------|------------|
| Duplicate entries from double submission | Medium | Use idempotency key in request, disable submit button during submission |
| Image upload fails mid-form | Low | Allow form submission without image, retry upload separately |
| Category list grows large | Low | Searchable dropdown handles 100+ categories efficiently |
