## 1. Form Setup

- [ ] 1.1 Create directory structure: `src/features/entry/`, `src/pages/entry.astro`
- [ ] 1.2 Install React Hook Form and @hookform/resolvers dependencies
- [ ] 1.3 Create base Entry page layout with sidebar navigation

## 2. Form Component

- [ ] 2.1 Create `EntryForm` component with React Hook Form
- [ ] 2.2 Implement type toggle (income/expense) with visual indicator
- [ ] 2.3 Implement amount input with numeric keyboard on mobile
- [ ] 2.4 Implement date picker input
- [ ] 2.5 Implement category dropdown with search
- [ ] 2.6 Implement description text area
- [ ] 2.7 Implement submit button with loading state

## 3. Validation

- [ ] 3.1 Create Zod schema for transaction form validation
- [ ] 3.2 Wire Zod resolver to React Hook Form
- [ ] 3.3 Implement inline error messages for each field
- [ ] 3.4 Implement amount validation (positive, max 2 decimals)
- [ ] 3.5 Implement date validation (not in future)

## 4. Image Upload

- [ ] 4.1 Create `ImageUpload` component with file picker and preview
- [ ] 4.2 Implement file type and size validation
- [ ] 4.3 Create `POST /api/receipts` endpoint for R2 upload
- [ ] 4.4 Wire image upload to form submission flow

## 5. Category Creation

- [ ] 5.1 Add "Add new category" option to category dropdown
- [ ] 5.2 Implement inline category creation input
- [ ] 5.3 Wire category creation to category repository

## 6. Transaction API

- [ ] 6.1 Create `POST /api/transactions` endpoint
- [ ] 6.2 Implement Zod validation for request body
- [ ] 6.3 Wire endpoint to transaction repository createTransaction
- [ ] 6.4 Add auth middleware to endpoint

## 7. Unsaved Changes Guard

- [ ] 7.1 Implement `beforeunload` event listener for browser close warning
- [ ] 7.2 Implement in-app navigation guard with confirmation dialog
- [ ] 7.3 Clear unsaved changes flag on successful submission

## 8. Integration

- [ ] 8.1 Wire form submission to POST `/api/transactions`
- [ ] 8.2 Emit transaction saved event for stats refresh
- [ ] 8.3 Add success/error toast notifications
- [ ] 8.4 Test full flow: fill form → submit → confirmation → stats update
