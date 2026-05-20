## Why

The AI chat is the primary transaction entry method for Financier. Users need a responsive, intuitive chat interface that handles streaming responses, confirmation dialogs, and seamless transitions from the dashboard stats view. The frontend chat UI must manage message history in localStorage, consume SSE streams, and display parsed transaction data for user confirmation before saving.

## What Changes

- Build React chat component with message display, input, and streaming text animation
- Implement confirmation UI that shows parsed transaction details with Yes/No controls
- Manage message trail in localStorage with context window optimization (keep last N exchanges)
- Handle SSE event consumption (message, done, error) with proper state transitions
- Implement dynamic layout: 40% stats / 60% chat → transitions to 100% chat when conversation starts
- Support image/receipt upload with preview and optional text caption

## Capabilities

### New Capabilities
- `chat-component`: React chat UI with message list, input, streaming, and state management
- `chat-confirmation-ui`: Confirmation dialog showing parsed transaction data with edit/confirm controls
- `chat-message-trail`: localStorage-based message history with trimming and summarization
- `chat-sse-consumer`: SSE event parsing and state machine for streaming responses
- `chat-image-upload`: Image/receipt upload with preview, base64 encoding, and optional caption
- `chat-layout-transition`: Dynamic 40/60 → 100% layout transition when chat becomes active

### Modified Capabilities
<!-- No existing specs to modify -->

## Impact

- New React components in `src/components/` or `src/features/`
- Depends on `ai-chat-architecture` for SSE protocol and API endpoint
- Depends on `frontend-stats-dashboard` for the stats panel that shares the dashboard layout
- localStorage key convention for message trail persistence
- Client-side only — no direct database access (all data operations via API)
