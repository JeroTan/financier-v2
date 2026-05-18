## Context

The chat UI is the primary user interaction point for Financier. It needs to handle streaming AI responses, display confirmation dialogs, manage message history in localStorage, and coordinate with the stats panel for dynamic layout transitions. The frontend uses Astro + React 19 with shadcn/ui components and Tailwind CSS v4.

## Goals / Non-Goals

**Goals:**
- Responsive chat component with streaming text animation
- Confirmation UI that shows parsed transaction data with edit/confirm controls
- localStorage-based message trail with context window optimization
- SSE event consumption with proper state machine transitions
- Dynamic 40/60 → 100% layout transition when chat becomes active
- Image/receipt upload with preview

**Non-Goals:**
- Chat message persistence in database (localStorage only per PRD)
- Rich text formatting in messages
- Voice input
- Multi-conversation threads

## Decisions

### 1. State Machine for Chat States

**Decision**: Use a finite state machine for chat UI states: `idle → typing → loading → streaming → confirm → success/error → idle`.

**Rationale**: Clear state transitions prevent race conditions (e.g., receiving SSE while in confirm state). Each state maps to a specific UI rendering.

### 2. Message Trail Storage

**Decision**: Store message trail in localStorage under key `financier:chat:trail`. Trim to last 10 exchanges before sending to API.

**Rationale**: localStorage is sufficient for personal app scale. Trimming keeps API requests fast. The key is transaction data in D1, not chat history.

### 3. SSE Consumption

**Decision**: Use `EventSource` API for SSE consumption with a custom parser for typed events (`message`, `done`, `error`).

**Rationale**: Native browser API, no dependencies needed. Typed events map directly to state machine transitions.

**Alternatives considered**:
- fetch + ReadableStream: More control but more boilerplate
- WebSocket: Overkill for one-way streaming

### 4. Confirmation UI Design

**Decision**: Show a card with parsed transaction fields (amount, type, category, date, description) that are editable inline, with Confirm/Cancel buttons.

**Rationale**: Users may need to correct AI parsing errors. Inline editing is faster than a separate form.

### 5. Layout Transition

**Decision**: Use a React state `chatActive` that toggles between `flex-col` (40% stats / 60% chat) and `flex-col` (100% chat). Animate with CSS transitions.

**Rationale**: Simple state-driven layout. CSS transitions provide smooth UX without animation libraries.

## Risks / Trade-offs

| Risk | Impact | Mitigation |
|------|--------|------------|
| localStorage cleared, chat history lost | Low | By design — transactions are in D1, only message history is lost |
| SSE connection drops mid-stream | Medium | Frontend detects disconnect, shows retry button |
| Confirmation UI complexity with many fields | Low | Keep parsed data minimal (amount, type, category, date, description) |
| Layout transition jank on mobile | Low | Use CSS `transition` with `will-change` for smooth rendering |
