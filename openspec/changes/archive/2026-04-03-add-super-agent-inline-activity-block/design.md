## Context

`Super-Agent` already has a working chat workspace with:
- persisted message history loaded through React Query
- ephemeral streaming assistant text stored in `useSuperAgentChatWorkspaceStore`
- socket-driven lifecycle updates for `chat:message:started`, `chat:message:token`, `chat:message:completed`, and `chat:message:failed`

The current thread UI in `src/features/super-agent/components/chat-thread.tsx` only distinguishes between persisted messages and one streaming assistant bubble. While the type layer already defines tool lifecycle payloads, the subscription layer does not yet convert them into visible UI state. The requested behavior adds an inline execution trace that must:
- appear inside the assistant bubble above streamed text
- render one row per tool call
- support only `active`, `complete`, and `failed`
- survive message completion during the current in-memory session
- disappear after a full reload because it is not part of persisted history

This is a cross-cutting change because it touches socket subscriptions, local workspace state, UI composition, and presentation mapping.

## Goals / Non-Goals

**Goals:**
- Add a lightweight inline activity block for streaming and recently completed assistant turns
- Model tool execution state in the frontend store using `tool_call_id` as the stable step key
- Keep completed traces visible in the current session without changing the persisted message API contract
- Provide a frontend-owned mapping from backend `tool_name` values to display labels and icons
- Keep the assistant answer text streaming behavior unchanged below the activity block

**Non-Goals:**
- Persist activity traces to the backend or rehydrate them from conversation history
- Display raw tool results, raw JSON payloads, or chain-of-thought text
- Introduce grouped steps, phase summaries, or a `pending` state
- Redesign the full chat layout or move activity into a separate side panel

## Decisions

### 1. Store tool activity as ephemeral per-conversation trace state

We will extend `useSuperAgentChatWorkspaceStore` with an `activityTraceByConversation` record keyed by conversation id. Each trace will contain:
- a run-level status such as `streaming`, `completed`, or `failed`
- started/completed timestamps for optional duration display
- an ordered list of steps keyed by `tool_call_id`

Each step will store:
- `toolCallId`
- raw `toolName`
- mapped display metadata
- summarized arguments string
- `status` as `active | complete | failed`

Rationale:
- This matches the current workspace pattern, where streaming assistant text and thread errors are already ephemeral per conversation.
- It cleanly satisfies the “keep in session, drop on reload” requirement because Zustand memory resets naturally on full reload.

Alternatives considered:
- Reconstruct trace from persisted messages or tool messages: rejected because the current conversation history contract does not guarantee tool lifecycle fidelity and the requested UX explicitly does not need persistence.
- Attach trace state directly to `streamingAssistantByConversation`: rejected because completed traces must outlive streaming text completion and should remain visible even after streaming content is cleared.

### 2. Build steps from socket events instead of message history

We will add socket subscriptions for tool lifecycle events in `use-chat-lifecycle-subscriptions.ts`:
- `chat:message:tool_start` creates a new step or refreshes an existing one as `active`
- `chat:message:tool_end` marks the step `complete`
- `chat:message:failed` marks the active run failed and, if possible, marks the latest active step as `failed`
- `chat:message:completed` finalizes the trace but does not clear it

Rationale:
- Tool lifecycle is inherently real-time state, and the socket feed is already the source of truth for streaming assistant behavior.
- This keeps the implementation aligned with the existing chat runtime flow and avoids inventing a second synchronization path.

Alternatives considered:
- Polling or refetching conversation history after each tool event: rejected because it would increase network churn and still would not provide the requested in-flight granularity.

### 3. Render the activity block inside the assistant message component tree

We will introduce a dedicated presentation component, likely under `src/features/super-agent/components/`, for example:
- `super-agent-activity-block.tsx`
- `super-agent-activity-step.tsx`

`chat-thread.tsx` will pass the current trace into the existing streaming assistant bubble. The activity block will render above `MessageResponse`, using compact rows with:
- status icon
- mapped tool label
- summarized arguments

Rationale:
- This keeps `chat-thread.tsx` responsible for assembly while moving formatting rules into a dedicated component.
- The repo already uses small focused components for thread subregions, so this matches the existing structure.

Alternatives considered:
- Reuse `src/components/ai/chain-of-thought.tsx` directly as-is: rejected because the existing primitive assumes richer collapsible content and status options than this feature needs. We may still reuse styling ideas or primitives, but a super-agent-specific wrapper keeps the UX compact and avoids coupling the thread to a generic demo-oriented component.

### 4. Keep completed traces visible until local workspace reset

On `chat:message:completed`, we will:
- mark the run completed
- keep the trace rows intact
- clear only the streaming assistant text state if the persisted assistant message now exists

The trace will be removed only when conversation-local workspace state is reset, such as:
- manual workspace reset
- full page reload
- explicit store cleanup for that conversation

Rationale:
- This matches the requirement that completed traces stay visible during the current session but are not historical records.
- It avoids duplicating the assistant response while still preserving the tool execution context near the final answer.

Alternatives considered:
- Removing the trace immediately on completion: rejected because it would erase the just-finished tool feedback the user asked to preserve.
- Persisting the trace indefinitely in local storage: rejected because it adds lifecycle complexity and conflicts with the agreed “reload loses it” behavior.

### 5. Use a frontend-owned tool presentation registry

We will create a small mapping module in the super-agent feature, for example `tool-presentation.ts`, that converts backend `tool_name` values into:
- display label
- icon component
- argument formatting strategy

Example mappings:
- `search` -> `Search`
- `fetch_content` -> `Crawl`

Argument formatting will be normalized by helper functions:
- short strings render inline
- URLs render as hostname or shortened host/path
- numbers and booleans render directly
- long strings truncate
- nested objects/arrays collapse into a compact placeholder

Rationale:
- The backend should not own presentation wording.
- Centralizing the registry makes new tools easy to add without scattering conditional logic across UI files.

Alternatives considered:
- Display raw `tool_name` everywhere: rejected because backend identifiers are not always user-friendly.
- Let each component format its own tool independently: rejected because it would make behavior inconsistent and harder to maintain.

## Risks / Trade-offs

- [Socket ordering can be imperfect] -> Mitigation: key updates by `tool_call_id`, append unknown completions defensively, and tolerate missing end events without breaking the thread.
- [Activity rows may linger if a run fails abruptly] -> Mitigation: mark the run failed, preserve visible rows, and clear the trace during existing conversation workspace reset paths.
- [Argument summaries may become noisy for future tools] -> Mitigation: keep the formatting registry centralized so each new tool can opt into a more specific formatter when needed.
- [The completed trace is ephemeral and may confuse users after navigation] -> Mitigation: scope the behavior clearly to the current in-memory session and avoid implying the trace is part of permanent conversation history.
- [More local state increases store complexity] -> Mitigation: reuse the existing per-conversation store pattern and keep the trace model intentionally minimal.

## Migration Plan

1. Extend super-agent chat workspace types with activity trace and step models.
2. Add store actions for starting a trace, appending/updating steps, marking completion/failure, and clearing trace state.
3. Subscribe to `chat:message:tool_start` and `chat:message:tool_end` in the lifecycle hook.
4. Add the tool presentation registry and argument summary helpers.
5. Render the inline activity block inside the streaming assistant bubble in `chat-thread.tsx`.
6. Verify the trace persists after `chat:message:completed` during the current session and disappears after reload.

Rollback is low risk because the change is frontend-only. If needed, we can remove the activity block UI and unsubscribe from tool lifecycle events while leaving the rest of the chat flow intact.

## Open Questions

- Should failed runs mark only the last active step as `failed`, or should the trace also expose a run-level failed banner inside the activity block?
- Do we want to show a compact duration in the header on the first implementation, or defer duration until the core trace behavior is stable?
