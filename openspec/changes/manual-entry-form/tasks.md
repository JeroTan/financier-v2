## 1. Form Setup

- [x] 1.1 Create directory structure: `src/features/entry/`, `src/pages/entry.astro`
- [x] 1.2 Install React Hook Form and @hookform/resolvers dependencies
- [x] 1.3 Create base Entry page layout with sidebar navigation

## 2. Form Component

- [x] 2.1 Create `EntryForm` component with React Hook Form
- [x] 2.2 Implement type toggle (income/expense) with visual indicator
- [x] 2.3 Implement amount input with numeric keyboard on mobile
- [x] 2.4 Implement date picker input
- [x] 2.5 Implement category dropdown with search
- [x] 2.6 Implement description text area
- [x] 2.7 Implement submit button with loading state

## 3. Validation

- [x] 3.1 Create Zod schema for transaction form validation
- [x] 3.2 Wire Zod resolver to React Hook Form
- [x] 3.3 Implement inline error messages for each field
- [x] 3.4 Implement amount validation (positive, max 2 decimals)
- [x] 3.5 Implement date validation (not in future)

## 4. Image Upload

- [x] 4.1 Create `ImageUpload` component with file picker and preview
- [x] 4.2 Implement file type and size validation
- [x] 4.3 Create `POST /api/receipts` endpoint for R2 upload
- [x] 4.4 Wire image upload to form submission flow
- [x] 4.5 Add `routeDetail()` — summary, tags, multipart body schema, response with URL

## 5. Category Creation

- [x] 5.1 Add "Add new category" option to category dropdown
- [x] 5.2 Implement inline category creation input
- [x] 5.3 Wire category creation to category repository

## 6. Transaction API

- [x] 6.1 Create `POST /api/transactions` endpoint
- [x] 6.2 Implement Zod validation for request body
- [x] 6.3 Wire endpoint to transaction repository createTransaction
- [x] 6.4 Add auth middleware to endpoint
- [x] 6.5 Add `routeDetail()` — summary, tags, body schema, response schema, error codes

## 7. Unsaved Changes Guard

- [x] 7.1 Implement `beforeunload` event listener for browser close warning
- [x] 7.2 Implement in-app navigation guard with confirmation dialog
- [x] 7.3 Clear unsaved changes flag on successful submission

## 8. Integration

- [x] 8.1 Wire form submission to POST `/api/transactions`
- [x] 8.2 Emit transaction saved event for stats refresh
- [x] 8.3 Add success/error toast notifications
- [x] 8.4 Test full flow: fill form → submit → confirmation → stats update
