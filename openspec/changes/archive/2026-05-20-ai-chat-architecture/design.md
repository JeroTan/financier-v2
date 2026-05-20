## Context

Financier's AI chat is the primary transaction entry method. The backend uses Cloudflare Workers with the `env.AI` binding to run Kimi 2.6 (`@cf/moonshotai/kimi-k2.6`). The current codebase has empty directories at `src/server/ai/llm/`, `src/server/ai/tooling/`, `src/server/controller/`, and `src/server/services/`. The PRD establishes the confirmation-before-save flow: AI parses natural language, presents details for confirmation, and only calls database tools after the user confirms.

## Goals / Non-Goals

**Goals:**
- Backend-managed tool calling loop that is transparent to the frontend
- SSE streaming protocol with typed events for predictable frontend consumption
- Message trail strategy that optimizes context window while preserving conversation continuity
- Tool schemas for createTransaction, getTransactions, getCategories that the AI can call
- Confirmation-gated saves: AI never calls createTransaction without explicit user confirmation

**Non-Goals:**
- Frontend tool execution (tools run server-side only)
- Multi-model support (Kimi 2.6 only for MVP)
- AI-powered insights or predictions (Phase 3)
- Chat message persistence in database (localStorage only per PRD)

## Decisions

### 1. Backend-Managed Tool Loop

**Decision**: The tool calling loop runs entirely on the backend. The frontend sends messages and receives streamed text — it never sees tool calls or results.

**Rationale**: Keeps the frontend simple, prevents client-side tool manipulation, and allows the backend to control max tool rounds, error handling, and fallback behavior.

**Alternatives considered**:
- Frontend-managed loop: More complex client, security risk (client controls tool execution)
- Hybrid: Unnecessary complexity for a single-user app

### 2. SSE Event Format

**Decision**: Use typed SSE events with a `done` event that carries metadata about the AI's final state.

```
event: message
data: {"type": "text", "content": "..."}

event: done
data: {"type": "confirmation", "parsedData": {...}}
```

**Rationale**: Typed events let the frontend handle different AI completion states (confirmation needed, transaction saved, error) without parsing prose.

**Alternatives considered**:
- Plain text stream: Frontend must parse AI text to detect confirmation — fragile
- JSON-only responses: Loses the streaming UX benefit

### 3. Message Trail Strategy

**Decision**: Keep last 10 exchanges (20 messages) in the message trail sent to the AI. Older exchanges are summarized into a single system-level context note.

**Rationale**: Kimi 2.6 has a large context window, but sending the full history on every request increases latency. Completed transactions are in D1 — the AI can query them via tools if needed.

**Alternatives considered**:
- Full history: Simpler but wasteful for long conversations
- No history: Loses conversational context for follow-up questions

### 4. Tool Schema Design

**Decision**: Define tools as JSON schemas that the AI can call. Each tool maps to a repository method.

```
Tools:
├── createTransaction(amount, type, category, date, description?, imageUrl?)
├── getTransactions(dateRange?, type?, category?, limit, offset)
├── getCategories()
└── uploadReceipt(base64Image) → R2 key
```

**Rationale**: Simple, direct mapping to database operations. The AI receives structured results it can incorporate into its response.

### 5. Confirmation Flow

**Decision**: The AI is instructed via system prompt to never call createTransaction until the user explicitly confirms. The AI first parses the input, presents details, asks for confirmation, and only then calls the tool.

**Rationale**: Matches the PRD requirement. The system prompt is the enforcement mechanism — no code-level gate needed.

**Alternatives considered**:
- Two-phase API (parse endpoint, then save endpoint): More endpoints, but explicit enforcement
- Backend validation of AI tool calls: Adds complexity, system prompt is sufficient for MVP

## Risks / Trade-offs

| Risk | Impact | Mitigation |
|------|--------|------------|
| AI ignores system prompt and calls tools without confirmation | High | Add backend validation layer that intercepts tool calls and requires a confirmation flag |
| Kimi 2.6 model unavailable or rate limited | High | Fallback message + graceful degradation to manual entry |
| Message trail grows large, increasing latency | Medium | Trim to last 10 exchanges, summarize older ones |
| Tool call JSON parsing fails | Medium | Retry with error message, max 5 rounds to prevent infinite loops |
| SSE connection drops mid-stream | Low | Frontend detects disconnect, shows retry button |
