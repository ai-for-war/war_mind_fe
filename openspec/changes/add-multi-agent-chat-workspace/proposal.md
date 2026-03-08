## Why

The frontend already exposes a `Multi-Agent` route, authenticated Socket.IO infrastructure, and reusable AI-style UI primitives, but the actual page is still a placeholder. Users cannot yet start, monitor, or continue agent-assisted conversations in a workspace that makes realtime orchestration understandable and usable.

## What Changes

- Add a dedicated multi-agent chat workspace page with a three-pane layout: conversation rail, main chat thread, and execution insight panel
- Add conversation discovery and navigation for existing chat sessions, including search, recency ordering, and empty/loading/error states
- Add a chat-first interaction model with message history, prompt composer, optimistic user messages, and streamed assistant responses over the existing chat REST and Socket.IO contracts
- Add a summary-first execution panel that surfaces run status, live tool/activity timeline, and system insights without requiring per-agent swimlanes
- Define graceful fallback behavior for missing structured backend metadata so the UI can ship against the current API while remaining ready for richer multi-agent events later

## Capabilities

### New Capabilities
- `multi-agent-chat-workspace`: Multi-agent page shell and chat experience covering conversation list, active thread, prompt composer, responsive layout, and user-facing empty/loading/error/offline states
- `multi-agent-execution-insights`: Realtime execution panel covering run summary, live activity timeline, socket connection status, and derived orchestration insights from chat events

### Modified Capabilities
- None

## Impact

- **New frontend feature module**: `src/features/multi-agent/` for page components, hooks, API bindings, types, and UI state
- **Existing infrastructure consumed**: authenticated socket provider/client, organization context, app shell layout, and shared shadcn/ui primitives
- **Existing UI assets reused or normalized**: internal AI conversation/message-style components and patterns inspired by [shadcn.io/ai](https://www.shadcn.io/ai)
- **Existing backend contracts consumed**: `POST /chat/messages`, `GET /chat/conversations`, `GET /chat/conversations/{conversation_id}/messages`, plus current chat socket events
- **Backend follow-up likely**: richer request/run correlation and structured execution metadata would improve the UX, but the initial frontend scope should work with the current contract
