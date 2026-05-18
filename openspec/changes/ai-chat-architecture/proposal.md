## Why

The Financier app's core differentiator is its AI-powered chat interface for frictionless transaction entry. Currently, the AI chat architecture is only sketched in `docs/cloudflare_ai_chat.md` with no concrete implementation plan. We need a well-defined architecture for the AI service layer, tool calling loop, streaming protocol, and message trail management before building the frontend chat UI.

## What Changes

- Create the AI chat service layer using Cloudflare AI (`@cf/moonshotai/kimi-k2.6`)
- Implement tool calling with a backend-managed execution loop (frontend is unaware of tools)
- Design SSE streaming protocol with typed events for frontend consumption
- Establish message trail strategy (localStorage-based with context window optimization)
- Create system prompt structure for AI behavior (parsing, confirmation, tool usage)
- Define tool schemas for database operations (createTransaction, getTransactions, getCategories)

## Capabilities

### New Capabilities
- `ai-chat-service`: Cloudflare AI integration with Kimi 2.6, streaming responses, and fallback handling
- `ai-tool-calling`: Tool schemas, execution loop, and confirmation-gated database operations
- `ai-message-trail`: Client-side message history management with context window optimization
- `ai-streaming-protocol`: SSE event format (message, done, error) with typed metadata

### Modified Capabilities
<!-- No existing specs to modify -->

## Impact

- New files in `src/server/ai/` (llm/, tooling/), `src/server/controller/`, `src/server/services/`
- New API route at `/api/chat` for AI chat endpoint
- Depends on `database-schema` change for tool schemas (createTransaction, getTransactions)
- Depends on `frontend-chat-ui` change for SSE consumption and message trail management
- Wrangler AI binding already configured in dev and production environments
