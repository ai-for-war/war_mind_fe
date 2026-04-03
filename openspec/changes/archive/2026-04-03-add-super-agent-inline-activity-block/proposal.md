## Why

The `Super-Agent` chat workspace already streams assistant output, but it does not show what the agent is doing while a response is being assembled. Users need a compact inline execution trace so they can understand progress, build trust in tool-assisted responses, and distinguish between active work, completed tool calls, and failed steps without leaving the chat thread.

## What Changes

- Add an inline activity block inside the streaming assistant message in the `Super-Agent` chat thread
- Show one activity step per tool invocation, with only three execution states: `active`, `complete`, and `failed`
- Keep the activity block visible after the assistant message completes for the current in-memory session, while allowing it to disappear after a full page reload
- Display each step in a compact trace format with a status icon, a mapped tool label, and a summarized argument string
- Introduce frontend mapping from backend `tool_name` values to user-facing labels and icons, such as rendering `fetch_content` as `Crawl`
- Replace the generic streaming-only `Thinking...` placeholder with activity-aware execution feedback that coexists with streamed assistant text

## Capabilities

### New Capabilities

### Modified Capabilities
- `super-agent-chat-workspace`: Extend the chat thread requirements so streaming assistant turns can render an inline activity trace for tool execution, preserve completed traces during the current session, and present user-facing labels for backend tool events

## Impact

- **Affected frontend areas**: `src/features/super-agent/` chat thread components, socket lifecycle subscriptions, workspace store, and chat workspace types
- **UI behavior changes**: streaming assistant messages gain an inline execution card above the response text instead of showing only a generic thinking placeholder
- **State changes**: the workspace store will need ephemeral per-conversation activity steps that survive message completion in memory but are not rehydrated after reload
- **Socket event usage**: the frontend will consume existing tool lifecycle payloads such as `chat:message:tool_start` and `chat:message:tool_end` to build step-by-step activity rows
- **Presentation mapping**: a frontend-owned tool metadata map will translate backend tool identifiers into stable labels, icons, and argument summaries for display
- **No backend contract change required**: the proposal relies on the existing streaming and tool event payloads already emitted by the chat runtime
