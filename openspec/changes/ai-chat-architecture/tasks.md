## 1. Project Setup

- [ ] 1.1 Create directory structure: `src/server/ai/llm/`, `src/server/ai/tooling/`, `src/server/controller/`, `src/server/services/`
- [ ] 1.2 Create `src/assets/chat_instruction.md` with system prompt template
- [ ] 1.3 Add AI chat endpoint route at `src/pages/api/chat.ts`

## 2. AI Chat Service

- [ ] 2.1 Implement `chatService` in `src/server/services/chatService.ts` that calls `env.AI.run()` with Kimi 2.6
- [ ] 2.2 Implement system prompt loader that reads from `src/assets/chat_instruction.md`
- [ ] 2.3 Implement fallback handling for AI service unavailability
- [ ] 2.4 Implement SSE response streaming with proper headers

## 3. Tool Calling

- [ ] 3.1 Define tool schemas for `createTransaction`, `getTransactions`, `getCategories`, `uploadReceipt`
- [ ] 3.2 Implement tool execution loop in `src/server/services/toolExecutor.ts` with max 5 rounds
- [ ] 3.3 Implement confirmation gate that intercepts `createTransaction` calls without prior user confirmation
- [ ] 3.4 Implement tool result formatting for AI consumption

## 4. Message Trail

- [ ] 4.1 Implement message trail trimming logic (last 10 exchanges, summarize older)
- [ ] 4.2 Implement message array construction: [system prompt, trimmed trail, new user message]

## 5. Streaming Protocol

- [ ] 5.1 Implement SSE event formatter with `message`, `done`, and `error` event types
- [ ] 5.2 Implement `done` event metadata for confirmation, saved, and error states
- [ ] 5.3 Implement `withFallbackContent` wrapper for error scenarios
- [ ] 5.4 Implement `aiChatController` in `src/server/controller/aiChatController.ts`

## 6. API Endpoint

- [ ] 6.1 Create POST `/api/chat` endpoint that accepts `{ messageTrail, newMessage, image? }`
- [ ] 6.2 Wire controller → service → AI → SSE response pipeline
- [ ] 6.3 Add Zod validation for request body
- [ ] 6.4 Add error handling with proper HTTP status codes
- [ ] 6.5 Add `routeDetail()` — summary, tags, body schema, SSE response description, error codes
