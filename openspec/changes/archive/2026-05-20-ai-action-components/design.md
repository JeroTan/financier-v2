## Context

The AI chat needs a structured content format so the AI can send renderable components within its conversational responses. The format `@#=_ACTION=> content <=ACTION=#@` embeds structured data that the frontend parser extracts and renders as specialized React components. This enables the AI to display transaction cards, data tables, progress bars, and alerts inline with its text.

## Goals / Non-Goals

**Goals:**
- Define 10 action types with content schemas
- Frontend parser extracts action blocks from streamed text
- React components render each action type inline
- Graceful handling of partial/malformed blocks during streaming

**Non-Goals:**
- Nested action blocks (actions cannot contain other actions)
- Custom action types defined by users
- Action blocks in the message trail history (only parsed from fresh responses)

## Decisions

### 1. Action Format Syntax

**Decision**: Use `@#=_ACTION=> content <=ACTION=#@` as the delimiter format.

**Rationale**: The `@#=` prefix and `=#@` suffix are unlikely to appear in natural text. The `_ACTION=>` and `<=ACTION=` markers are explicit and easy to parse with regex. The format is symmetric and self-closing for empty-content actions like Divider.

**Alternatives considered**:
- XML-style `<Action>content</Action>`: Could conflict with natural text containing HTML
- JSON blocks: Harder for the AI to generate inline with prose
- Markdown extensions: Less explicit, harder to parse reliably

### 2. Streaming Parser Strategy

**Decision**: Use a state machine parser that accumulates text chunks and detects action block boundaries. Partial blocks are held until complete, then rendered.

**Rationale**: During SSE streaming, action blocks may arrive in fragments. A state machine handles partial content gracefully — showing text immediately while buffering incomplete action blocks.

```
States: TEXT → DETECTING_ACTION → PARSING_ACTION → TEXT
```

### 3. Action Content Format

**Decision**: Action content is JSON for structured actions (Card, Table, Chart, Progress, Button) and plain text for simple actions (Alert, List, Insight, Divider, Image).

**Rationale**: Structured data needs JSON for reliable parsing. Simple text actions don't need the overhead.

### 4. Fallback Rendering

**Decision**: If an action block is malformed or an unknown action type is encountered, render it as plain text with the raw content visible.

**Rationale**: Never lose information. If parsing fails, the user still sees the content.

## Risks / Trade-offs

| Risk | Impact | Mitigation |
|------|--------|------------|
| AI generates malformed action blocks | Medium | Fallback to plain text rendering, validate JSON before rendering |
| Action block split across SSE chunks | Medium | State machine parser buffers partial blocks until complete |
| Action format appears in user messages | Low | Only parse actions from AI responses, not user messages |
| Too many action types confuse the AI | Medium | System prompt includes clear examples for each action type |
