## Context

`war_mind_fe` already has the shell needed for a realtime multi-agent workspace:
- an authenticated route at `/multi-agent`, but the page is still a placeholder
- a shared Socket.IO foundation mounted inside authenticated routes
- organization-aware socket subscriptions via `useSocketSubscription()`
- reusable shadcn/ui primitives and internally vendored AI-style components for conversation, messages, reasoning, and tasks

The backend already exposes the minimum chat contract required to ship a first version:
- `POST /chat/messages`
- `GET /chat/conversations`
- `GET /chat/conversations/{conversation_id}/messages`
- socket events for message start, token streaming, tool start, tool end, completion, and failure

However, the current backend contract is still optimized for a single streamed assistant response rather than a fully structured multi-agent UI. In particular, the frontend does not currently receive a stable `request_id`, a pre-created `assistant_message_id`, or explicit public fields such as `agent_id`, `stage`, or `step_id`. That means the initial UX should present a chat-first workspace with execution insights, rather than pretending the system already supports true per-agent swimlanes.

There is also a frontend integration constraint: the internal `src/components/ai/` package is a strong design reference, but some files still import via `~/*` aliases while the app only defines `@/*` in TypeScript path mapping. The workspace should therefore reuse patterns from those components, but should not depend on them as-is until imports are normalized.

Stakeholders:
- frontend developers implementing the `/multi-agent` route
- backend developers evolving the chat and orchestration event contract
- end users who need a realtime, understandable, low-friction workspace for agent-assisted conversations

## Goals / Non-Goals

**Goals:**
- Implement a dedicated multi-agent workspace feature under `src/features/multi-agent/`
- Deliver a three-pane desktop layout: conversation rail, chat workspace, and execution insight panel
- Use the existing REST + socket contract to support conversation history, optimistic sends, streamed assistant responses, and live activity feedback
- Keep chat as the primary interaction model, with orchestration surfaced as summary and timeline rather than raw system internals
- Split durable server state and ephemeral realtime UI state cleanly so the feature remains maintainable as the backend evolves
- Make the frontend resilient to incomplete backend metadata by deriving safe fallback UI states
- Keep the design responsive so the same feature can collapse cleanly to tablet and mobile layouts

**Non-Goals:**
- No true per-agent lane visualization in the first version
- No attempt to expose raw chain-of-thought or hidden internal reasoning
- No new transport layer beyond the existing shared Socket.IO client/provider
- No backend API changes as part of this design artifact
- No message branching, artifact gallery, or advanced source/citation UI in the first implementation
- No attempt to fully adopt the vendored `src/components/ai/` package without first normalizing imports and integration boundaries

## Decisions

### 1. Build the feature as a dedicated `src/features/multi-agent/` vertical slice

**Choice**: Implement the workspace as a self-contained feature module with `api/`, `components/`, `hooks/`, `stores/`, and `types/` folders, following the existing feature-first architecture.

**Rationale**: The page has enough logic to justify a real feature boundary: conversation list queries, active thread state, socket event mapping, streaming UI state, execution timeline state, and responsive layout composition. Keeping everything in one vertical slice avoids leaking chat-specific concerns into generic app modules.

**Alternatives considered**:
- Put everything directly in `src/app/` or a page file: too hard to scale and test
- Treat the page as a widget: incorrect because this is a primary business feature, not a reusable shell block
- Split chat and execution into separate top-level features immediately: premature while the contracts are still stabilizing

### 2. Use a three-pane layout with chat at the center of the experience

**Choice**: Desktop layout will use:
- left rail for conversation navigation
- center pane for chat thread and composer
- right rail for execution insights

Tablet/mobile will progressively collapse the left and right rails into drawers/sheets.

**Rationale**: The system is multi-agent internally, but the user goal is still conversational. A chat-first layout keeps the experience familiar while still exposing orchestration value. The execution panel adds transparency without forcing users to think in terms of workflow graphs.

**Alternatives considered**:
- Full control-room dashboard with equal-weight panes: attractive visually, but too operational for the current product goal
- Agent swimlanes in the main canvas: misleading because the backend does not yet expose enough agent-level structure
- Single-column chat only: simpler, but wastes the opportunity to make orchestration legible

### 3. Keep server truth in React Query and ephemeral stream state in Zustand

**Choice**:
- React Query owns fetchable server state:
  - conversation list
  - message history by conversation
  - send message mutation
- Zustand owns ephemeral client state:
  - active conversation id
  - composer draft
  - temporary streaming assistant message
  - execution activity timeline
  - derived run stage
  - UI-only panel expansion/collapse state

**Rationale**: The workspace has two clearly different state categories. Query state is durable and refetchable. Streaming state is transient, optimistic, and often not yet persisted server-side. Separating them prevents overloading React Query with ephemeral websocket state or polluting the UI store with cached server truth.

**Alternatives considered**:
- React Query for everything: awkward for token-by-token streaming and temporary messages
- Zustand for everything: loses server caching and invalidation patterns already used elsewhere in the app
- Component-local state only: fragile across route changes and harder to coordinate

### 4. Represent assistant streaming with a local ephemeral message model

**Choice**: When a user sends a message, the frontend will:
1. append an optimistic user message locally
2. wait for `chat:message:started`
3. create a temporary assistant message in local UI state
4. append streamed tokens into that temporary assistant message
5. replace or merge it when `chat:message:completed` arrives

**Rationale**: The backend currently emits `conversation_id` at stream start and only returns the final `message_id` at completion. Without an upfront `assistant_message_id`, the frontend needs a local placeholder so the thread can stream smoothly and maintain stable layout.

**Alternatives considered**:
- Wait until completion to show the assistant bubble: poor UX, loses realtime value
- Refetch message history after every token: wasteful and visually unstable
- Render tokens outside the message list: creates duplicate mental models and jumpy transitions

### 5. Model orchestration as summary-first execution insights, not explicit agent lanes

**Choice**: The right panel will expose three levels of orchestration feedback:
- `Run Summary`: high-level stage and elapsed time
- `Live Activity`: timeline of tool and run events
- `System Insight`: user-friendly digest of what happened

The UI will not claim there are explicit planner/researcher/executor lanes unless the backend later provides stable public metadata for them.

**Rationale**: This is the most honest representation of the current system. The backend already exposes useful event hooks such as tool start/end, but not a durable multi-agent topology. Summary-first UI communicates progress without overfitting to implementation details.

**Alternatives considered**:
- Hidden orchestration with no insight panel: simple, but reduces trust and debuggability
- Full graph visualization: interesting, but unsupported by current public payloads
- One card per guessed internal node: too brittle and likely to drift from backend behavior

### 6. Derive a small frontend stage machine from existing socket events

**Choice**: The initial run state model will be:
- `idle`
- `initiating`
- `tool-using`
- `synthesizing`
- `completed`
- `failed`

Stage derivation rules:
- `chat:message:started` -> `initiating`
- first `chat:message:tool_start` -> `tool-using`
- `chat:message:token` without an active tool -> `synthesizing`
- `chat:message:completed` -> `completed`
- `chat:message:failed` -> `failed`

**Rationale**: The backend does not currently expose a formal public `stage` field. A small derived stage machine gives the UI enough clarity for badges, summaries, and progress language without inventing fine-grained system phases.

**Alternatives considered**:
- Show raw socket event names directly: too technical for end users
- Infer many granular stages like routing/planning/researching: appealing, but unsupported by stable payloads
- No run-stage model at all: makes the execution panel less valuable

### 7. Scope socket subscriptions by active conversation and active organization

**Choice**: Reuse the existing `useSocketSubscription()` hook with organization scoping, then add feature-level guards so the workspace only mutates local state for the active conversation or known pending runs.

**Rationale**: The app already has organization-aware filtering at the subscription layer. The multi-agent feature should build on that rather than creating a new transport pattern. Conversation scoping on top keeps unrelated runs from leaking into the visible thread.

**Alternatives considered**:
- Global event handling in the provider: too broad and harder to reason about
- Per-component direct socket listeners: duplicates cleanup logic and increases race-condition risk

### 8. Normalize conversation rail behavior around existing backend list capabilities

**Choice**: The rail will use `GET /chat/conversations` as its source of truth, then derive display-friendly fields on the client where needed:
- selected state
- currently streaming state
- local last preview if available

Search and status filters will map to existing API fields where possible. Anything not available server-side will remain a soft UI enhancement rather than a hard dependency.

**Rationale**: The backend already supports pagination, status filtering, and search. Using those capabilities directly keeps the rail scalable while still allowing small UI enrichments from local state.

**Alternatives considered**:
- Load all conversations once and filter entirely on the client: less scalable and not aligned with the API
- Delay the rail until richer summary data exists: unnecessary, since the current contract is already usable

### 9. Reuse AI component patterns, but do not depend on the current vendored package as-is

**Choice**: The implementation will borrow structure and styling ideas from `src/components/ai/` and [shadcn.io/ai](https://www.shadcn.io/ai), but the feature should wrap or reimplement only the parts it can safely compile under the current app aliasing and architecture.

**Rationale**: The internal AI package already demonstrates good UX primitives such as sticky conversation scrolling and message bubbles. But some imports still use `~/*` aliases while the app is configured for `@/*`, so blindly adopting those files would create integration friction during implementation.

**Alternatives considered**:
- Rewrite everything from scratch: safe, but wastes useful existing work
- Refactor the entire AI component package first: potentially useful later, but out of scope for this change
- Copy the files unchanged: high risk of broken imports and mixed conventions

### 10. Prefer graceful degradation over blocking on backend contract improvements

**Choice**: The first implementation will work with the current backend contract, while explicitly identifying upgrade points for later improvements such as:
- `request_id`
- `assistant_message_id` at stream start
- structured `stage`
- `agent_id` / `agent_label`
- richer completion metadata

**Rationale**: The page can ship meaningful value now. Waiting for a perfect multi-agent event model would block the user-facing workspace entirely. The design therefore separates "required for MVP" from "high-value backend follow-up".

**Alternatives considered**:
- Block implementation until the backend expands the contract: safer long-term, but delays visible progress
- Build a frontend-only pseudo-agent model: visually impressive, but brittle and potentially misleading

## Risks / Trade-offs

- **[Concurrent sends in the same conversation are hard to correlate]** -> Without a stable `request_id`, the frontend should initially restrict or strongly discourage overlapping sends in one conversation, and document this dependency for backend follow-up
- **[Execution insight quality is limited by current payload richness]** -> Keep summaries high-level and generic where needed; avoid surfacing guessed internal agent identities
- **[Temporary assistant message merge logic can drift from server history]** -> On run completion or reconnect, invalidate and refetch the active conversation messages to re-anchor the thread to server truth
- **[Socket events may arrive while a different conversation is selected]** -> Guard feature state updates by active conversation id and pending run registry
- **[Current AI component package has import incompatibilities]** -> Reuse patterns selectively and normalize imports before any direct adoption
- **[Three-pane desktop layout can become cramped on smaller screens]** -> Collapse rails responsively and keep the center thread as the protected primary region
- **[Summary-first UX may underrepresent advanced orchestration later]** -> The right panel is intentionally extensible so richer agent- or artifact-level cards can be added when the backend exposes structured metadata

## Migration Plan

1. Create the `src/features/multi-agent/` module structure with types, query keys, hooks, components, and UI store
2. Implement the static three-pane page layout and responsive containers
3. Integrate conversation list querying and active conversation selection
4. Integrate message history loading for the selected conversation
5. Add composer submission with optimistic user messages
6. Add socket-driven streaming assistant message handling and execution timeline updates
7. Add error, reconnect, empty, and offline states
8. Normalize or wrap any reused AI-style components needed by the feature
9. Validate the experience against the current backend contract, then identify follow-up backend deltas separately

Rollback is straightforward because this change is frontend-only:
- remove or disable the `/multi-agent` feature module
- keep the rest of the app shell and socket infrastructure untouched
- no data migration or backend rollback is required

## Open Questions

- Should the initial UX allow multiple in-flight sends within the same conversation, or should the composer lock until the current run completes?
- Can the backend add a stable `request_id` and `assistant_message_id` in a follow-up change soon after the first frontend release?
- Should conversation list items eventually show richer previews such as last responder, last run status, or unread activity, or is a minimal rail sufficient for the first release?
- Is the current internal `src/components/ai/` package intended to become a supported shared library, or should the multi-agent feature treat it as reference-only for now?
