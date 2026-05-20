## 1. Project Setup

- [x] 1.1 Create directory structure: `src/components/chat/`, `src/features/chat/`
- [x] 1.2 Set up shadcn/ui components needed (Button, Input, Card, Avatar)

## 2. Chat Component

- [x] 2.1 Create `ChatMessage` component for displaying individual messages (user/AI)
- [x] 2.2 Create `ChatMessageList` component with scrollable message container
- [x] 2.3 Create `ChatInput` component with text field and send button
- [x] 2.4 Implement chat state machine: idle, typing, loading, streaming, confirm, success, error
- [x] 2.5 Wire state transitions to UI rendering

## 3. SSE Consumer

- [x] 3.1 Create `useChatSSE` hook that manages EventSource connection
- [x] 3.2 Implement SSE event parser for `message`, `done`, `error` events
- [x] 3.3 Map events to chat state transitions
- [x] 3.4 Implement connection error handling with retry logic

## 4. Message Trail

- [x] 4.1 Create `useMessageTrail` hook for localStorage management
- [x] 4.2 Implement trail save/load with key `financier:chat:trail`
- [x] 4.3 Implement trail trimming (last 10 exchanges) before API send
- [x] 4.4 Implement trail clear function for new conversations

## 5. Confirmation UI

- [x] 5.1 Create `ChatConfirmationCard` component with parsed transaction fields
- [x] 5.2 Implement inline field editing for amount, type, category, date, description
- [x] 5.3 Implement Confirm and Cancel button handlers
- [x] 5.4 Wire confirmation data back to chat message flow

## 6. Image Upload

- [x] 6.1 Create `ChatImagePreview` component for attached image display
- [x] 6.2 Implement file type validation (JPEG, PNG, WebP, GIF, max 10MB)
- [x] 6.3 Implement base64 encoding for image attachment
- [x] 6.4 Wire image attachment to chat message send flow

## 7. Layout Transition

- [x] 7.1 Create `DashboardLayout` component with 40/60 split
- [x] 7.2 Implement `chatActive` state for layout toggle
- [x] 7.3 Add CSS transitions for smooth layout animation
- [x] 7.4 Implement stats panel hide/show on chat activation
- [x] 7.5 Implement stats restore on page load (split layout default)

## 8. Integration

- [x] 8.1 Wire chat component to POST `/api/chat` endpoint
- [x] 8.2 Connect message trail to API request body
- [x] 8.3 Connect SSE consumer to chat state machine
- [x] 8.4 Connect confirmation UI to second API call (user confirms)
- [x] 8.5 Emit `transaction_saved` custom event for stats refresh
