## 1. Project Setup

- [ ] 1.1 Create directory structure: `src/components/chat/`, `src/features/chat/`
- [ ] 1.2 Set up shadcn/ui components needed (Button, Input, Card, Avatar)

## 2. Chat Component

- [ ] 2.1 Create `ChatMessage` component for displaying individual messages (user/AI)
- [ ] 2.2 Create `ChatMessageList` component with scrollable message container
- [ ] 2.3 Create `ChatInput` component with text field and send button
- [ ] 2.4 Implement chat state machine: idle, typing, loading, streaming, confirm, success, error
- [ ] 2.5 Wire state transitions to UI rendering

## 3. SSE Consumer

- [ ] 3.1 Create `useChatSSE` hook that manages EventSource connection
- [ ] 3.2 Implement SSE event parser for `message`, `done`, `error` events
- [ ] 3.3 Map events to chat state transitions
- [ ] 3.4 Implement connection error handling with retry logic

## 4. Message Trail

- [ ] 4.1 Create `useMessageTrail` hook for localStorage management
- [ ] 4.2 Implement trail save/load with key `financier:chat:trail`
- [ ] 4.3 Implement trail trimming (last 10 exchanges) before API send
- [ ] 4.4 Implement trail clear function for new conversations

## 5. Confirmation UI

- [ ] 5.1 Create `ChatConfirmationCard` component with parsed transaction fields
- [ ] 5.2 Implement inline field editing for amount, type, category, date, description
- [ ] 5.3 Implement Confirm and Cancel button handlers
- [ ] 5.4 Wire confirmation data back to chat message flow

## 6. Image Upload

- [ ] 6.1 Create `ChatImagePreview` component for attached image display
- [ ] 6.2 Implement file type validation (JPEG, PNG, WebP, GIF, max 10MB)
- [ ] 6.3 Implement base64 encoding for image attachment
- [ ] 6.4 Wire image attachment to chat message send flow

## 7. Layout Transition

- [ ] 7.1 Create `DashboardLayout` component with 40/60 split
- [ ] 7.2 Implement `chatActive` state for layout toggle
- [ ] 7.3 Add CSS transitions for smooth layout animation
- [ ] 7.4 Implement stats panel hide/show on chat activation
- [ ] 7.5 Implement stats restore on page load (split layout default)

## 8. Integration

- [ ] 8.1 Wire chat component to POST `/api/chat` endpoint
- [ ] 8.2 Connect message trail to API request body
- [ ] 8.3 Connect SSE consumer to chat state machine
- [ ] 8.4 Connect confirmation UI to second API call (user confirms)
- [ ] 8.5 Emit `transaction_saved` custom event for stats refresh
