## Context

The `Multi-Agent` page now has a working conversation rail, but the center region still renders as a placeholder. That leaves the current page in an awkward intermediate state: users can discover and select conversations, but they cannot yet read message history, observe a live response stream, or send the next prompt from the same workspace.

This change fills in the middle pane of the multi-agent workspace. It must integrate cleanly with the feature-scoped rail that already exists, reuse the current REST and Socket.IO contracts without requiring a blocking backend rewrite, and stay compatible with a later right-side execution panel. The backend already exposes the minimum data needed for a first chat workspace:
- `GET /chat/conversations/{conversation_id}/messages` for message history
- `POST /chat/messages` for prompt submission
- Socket events for started, token, tool start, tool end, completed, and failed response lifecycle

Constraints:
- the center pane belongs to `src/features/multi-agent/` and must not become a generic cross-feature chat system
- the current backend does not provide `request_id` or a stable `assistant_message_id` at response start time
- the rail already owns `activeConversationId`, search/filter state, and mobile sheet state
- the project already contains local AI-oriented UI components inspired by [shadcn.io/ai](https://www.shadcn.io/ai), plus reusable `shadcn/ui` primitives available through the local component system and the `shadcn.ui` MCP component catalog
- the right-side execution panel is intentionally out of scope for this change, but this design should not block it later

## Goals / Non-Goals

**Goals:**
- Add a dedicated center chat workspace to the `Multi-Agent` page
- Render message history for the active conversation selected from the existing rail
- Support a fresh-chat state when no conversation is active
- Provide a composer that can submit prompts for both new and existing conversations
- Show clear loading, empty, streaming, and failed states in the thread area
- Reuse existing local AI-style components where they fit semantically
- Reuse `shadcn/ui` primitives for layout, input, skeleton, alert, and responsive affordances
- Keep the center pane as the primary surface on tablet and mobile
- Preserve a clean path for a future execution panel and richer orchestration states

**Non-Goals:**
- Building the right-side execution panel, tool timeline, or reasoning summary in this change
- Redesigning or replacing the conversation rail that was just implemented
- Introducing a new backend contract as a prerequisite for the first center-pane implementation
- Solving advanced capabilities such as message branching, citations, attachment upload, or per-agent lane rendering
- Turning the `multi-agent` feature into a generic shared chat framework used by other pages

## Decisions

### 1. Implement the center workspace as a feature-scoped `main` pane inside the existing page shell

**Choice**: Keep the current `MultiAgentPage` as the page shell and replace its placeholder center region with a feature-scoped `main` pane that owns the thread and composer surfaces.

**Rationale**: The rail is already implemented as a dedicated `aside`, and the future execution panel will likely become a sibling region. The cleanest structure is therefore a three-region page shell:
- left `aside`: conversation rail
- center `main`: chat workspace
- right `aside`: future execution panel

This keeps the center pane clearly primary, avoids conflating it with app-shell navigation, and aligns with the workspace direction previously agreed for the page.

**Alternatives considered**:
- Replace the whole page with a monolithic `chat-page.tsx`: rejected because it would bury the existing rail work and make the future execution panel harder to add incrementally
- Put the center workspace into `src/widgets/`: rejected because the workspace is tightly coupled to `multi-agent` data, socket events, and page-local state

**Planned structure**:
- `multi-agent-page.tsx`: page shell and high-level layout composition
- `chat-workspace.tsx`: center pane container
- `chat-thread.tsx`: message thread with load, empty, ready, streaming, and failed views
- `composer-panel.tsx`: prompt input and submit action
- `empty-state.tsx` and `error-state.tsx`: state surfaces specific to the center pane

### 2. Reuse local AI-style thread primitives for conversation rendering, but keep composer and shell built from `shadcn/ui` primitives

**Choice**: Use the local `src/components/ai/` primitives for the thread where they already match conversational semantics, and use `shadcn/ui` primitives for the surrounding pane and composer controls.

**Rationale**: The local AI components are already aligned with the patterns documented by [shadcn.io/ai](https://www.shadcn.io/ai): a scroll-aware conversation container, message bubbles, and suggestion pills are better starting points than rebuilding those patterns from scratch. At the same time, the page shell and composer do not need a full imported AI block. They are better served by standard `shadcn/ui` primitives with app-specific composition.

Components that fit the center pane well:
- local AI components:
  - `Conversation`
  - `ConversationContent`
  - `ConversationEmptyState`
  - `ConversationScrollButton`
  - `Message`
  - `MessageContent`
  - `Suggestion` / `Suggestions`
- `shadcn.io/ai` concepts to mirror:
  - `Conversation`
  - `Message`
  - `Prompt Input`
  - `Suggestion`
  - later, `Tool`, `Reasoning`, and `Task` when the execution panel is introduced [shadcn.io/ai](https://www.shadcn.io/ai)

Components confirmed as available from the `shadcn.ui` MCP component catalog and useful here:
- `card`
- `button`
- `textarea`
- `scroll-area`
- `skeleton`
- `alert`
- `badge`
- `sheet`
- `tabs`
- `separator`
- `tooltip`
- `popover`
- `collapsible`
- `resizable`

**Reusable primitive decisions**:
- use `Card` or a card-like bordered container for the center pane shell
- use `Textarea` + `Button` for the composer instead of introducing a brand-new prompt primitive immediately
- use `Skeleton` for thread loading and composer submission feedback
- use `Alert` for thread failure and load failure states
- keep `Resizable` out of phase 1 even though it is available, because user-resizable panes add complexity before the base workspace is stable

**Alternatives considered**:
- Build the entire center workspace from generic primitives only: rejected because it would reimplement message-thread behavior that the local AI components already cover
- Copy a full external AI block pattern wholesale: rejected because the project already has local components and the middle pane does not yet need the full execution or reasoning stack

### 3. Keep server truth in React Query and put ephemeral thread/run state into a dedicated chat UI store

**Choice**: Continue using React Query for fetched server state and add a dedicated feature store for ephemeral center-pane state rather than overloading the existing rail store.

**Rationale**: The rail store currently owns only rail-specific state:
- `activeConversationId`
- `searchDraft`
- `selectedStatus`
- `isRailSheetOpen`

The center workspace needs additional state with a different lifecycle:
- composer draft
- active send/submission status
- ephemeral streaming assistant message
- per-conversation run status
- transient thread error state

Overloading the rail store with these concerns would blur responsibilities and make future expansion harder. A small dedicated store keeps the split clear:
- React Query:
  - message history for a conversation
  - send-message mutation
- rail store:
  - active conversation selection
  - rail search/filter/sheet behavior
- chat workspace store:
  - composer draft
  - optimistic user message state
  - ephemeral streaming assistant state
  - local per-conversation lifecycle status

**Alternatives considered**:
- Put all chat state in React Query cache: rejected because transient streaming state would become awkward, especially without a stable assistant message ID at stream start
- Extend the rail store into a full page store: rejected because rail concerns and thread concerns would become too entangled
- Use component-local state only: rejected because multiple center-pane subcomponents need shared access to active run state

**Proposed store shape**:
- `composerDraftByConversation`
- `streamingAssistantByConversation`
- `runStatusByConversation`
- `threadErrorByConversation`

### 4. Use an optimistic-overlay model for prompt submission and streaming instead of mutating server history aggressively

**Choice**: Treat the fetched message list as server truth and overlay optimistic and streaming rows in the center pane while a run is active.

**Rationale**: The backend contract is good enough for a first chat experience, but it does not provide a stable assistant message identifier when streaming starts. The response lifecycle today looks like this:
1. `POST /chat/messages` saves the user message and returns `conversation_id`
2. Socket emits `chat:message:started`
3. Socket emits one or more `chat:message:token`
4. Socket emits `chat:message:completed` with the final assistant `message_id`

Because there is no server-issued placeholder assistant record at `started`, directly mutating the fetched thread as though the assistant message already exists would be fragile. An optimistic-overlay model is safer:
- add a local optimistic user row immediately after submit
- create a local ephemeral assistant row when `chat:message:started` arrives
- append streaming tokens to that local assistant row
- on `completed`, either merge into the fetched list and invalidate/refetch, or replace the local ephemeral row with the final server-backed record

**Alternatives considered**:
- Wait for refetch after every send before showing anything: rejected because it would feel laggy and undermine the realtime chat experience
- Mutate the React Query cache as if the final assistant message existed from the start: rejected because the backend does not provide the required stable ID at stream start

**Behavioral rules**:
- never leave stale streaming content visible after a conversation switch
- if the active conversation changes mid-stream, preserve local run state by conversation ID so the user can return without losing the stream snapshot
- refetch message history on run completion to reconcile local overlay state with server truth

### 5. Bridge Socket.IO events into a conversation-scoped thread state machine using the existing subscription hook

**Choice**: Use the existing `useSocketSubscription` hook as the integration point for chat lifecycle events and translate those events into a conversation-scoped state machine owned by the workspace store.

**Rationale**: The project already has an organization-aware socket hook that filters events by `organization_id`. Reusing that hook avoids duplicate socket wiring and keeps the center-pane logic focused on how events affect UI state rather than how the transport is managed.

The center-pane thread state machine should be intentionally simple for phase 1:
- `idle`
- `loading-history`
- `ready`
- `submitting`
- `streaming`
- `completed`
- `failed`

Socket event mapping:
- `chat:message:started` -> create or activate ephemeral assistant row, set status to `streaming`
- `chat:message:token` -> append token to the ephemeral assistant row for that conversation
- `chat:message:tool_start` / `chat:message:tool_end` -> do not render a rich tool UI in the center pane yet, but optionally record a subtle processing status for future use
- `chat:message:completed` -> finalize the run, clear ephemeral-only flags, refetch message history
- `chat:message:failed` -> mark the latest run as failed and surface an error state near the thread

**Alternatives considered**:
- Ignore socket events and rely only on refetching REST history: rejected because it would abandon the realtime behavior the backend already provides
- Subscribe only for the currently active conversation: rejected because a user can switch away and back during a run, and future rail badges benefit from keeping local run state scoped by conversation

### 6. Make the fresh-chat state a first-class center-pane mode rather than an absence of UI

**Choice**: Treat `New chat` as an explicit center-pane mode with its own empty-state presentation, suggestion chips, and active composer.

**Rationale**: The middle pane should remain useful even when no existing conversation is selected. The fresh-chat state is not an error or a blank state; it is an intentional starting mode. Giving it a first-class layout avoids flashing placeholders and keeps the user oriented.

The fresh-chat state should include:
- a title and short description
- suggestion chips using the existing `Suggestion` components
- an immediately usable composer

**Alternatives considered**:
- Show only a plain text placeholder in the center pane: rejected because it underuses the workspace and makes `New chat` feel incomplete
- Auto-create a new empty conversation record as soon as `New chat` is clicked: rejected because it creates server records before the user sends any content

### 7. Keep the center pane responsive and primary; the rail may collapse, but the thread and composer should not

**Choice**: The center workspace remains the primary visible region on tablet and mobile while the rail becomes secondary. The center pane should not collapse behind the rail.

**Rationale**: On smaller viewports, reading and replying in the current conversation is more important than keeping the list constantly visible. This continues the responsive pattern already established by the rail change.

**Implementation direction**:
- desktop: persistent rail + center workspace
- tablet/mobile: rail opens as `Sheet`; center workspace remains the main visible content
- composer stays sticky or visually anchored near the bottom of the center pane

**Alternatives considered**:
- Collapse the center pane into tabs with the rail: rejected because it adds navigation friction to the core chat experience
- Always keep both visible with narrow columns: rejected because thread readability would degrade sharply on smaller screens

## Risks / Trade-offs

- **[The backend does not provide a stable assistant message ID at stream start]** -> Use a local ephemeral assistant overlay and reconcile with server truth on completion
- **[Local streaming state can drift from server history if reconnection happens mid-run]** -> On reconnect or completion, refetch the active conversation history and prefer server truth over stale local overlays
- **[Reusing local AI components may expose gaps or import mismatches]** -> Limit reuse to components already aligned with the app alias structure and compose missing behavior from standard `shadcn/ui` primitives
- **[The center pane could become tightly coupled to the future execution panel]** -> Keep tool and reasoning handling minimal here and reserve richer orchestration UI for a later, separate change
- **[Switching conversations during a live response could confuse users]** -> Scope ephemeral run state by conversation ID and show streaming content only for the currently active conversation
- **[Composer draft behavior can become inconsistent across fresh-chat and existing-conversation modes]** -> Define draft ownership early and keep submission rules identical in both modes except for how `conversation_id` is resolved

## Migration Plan

1. Add `design.md` to lock the center-pane architecture before implementation
2. Introduce feature-scoped center-pane components under `src/features/multi-agent/components/`
3. Add message-history query hooks and send-message mutation hooks under `src/features/multi-agent/`
4. Add a dedicated chat workspace store for ephemeral draft and streaming state
5. Replace the current center placeholder in `multi-agent-page.tsx` with the real `ChatWorkspace`
6. Wire Socket.IO chat lifecycle events into the workspace state machine using the existing subscription hook
7. Add reconciliation refetch on completed and reconnect paths
8. Verify desktop and mobile rail-to-workspace handoff behavior

Rollback is low risk: the center-pane implementation is isolated to the `multi-agent` feature and can fall back to the current placeholder without affecting the app shell, auth flow, or rail API integration.

## Open Questions

- Should the center pane own a new `useMultiAgentChatStore`, or should there be a broader page-level store that composes the existing rail store and future execution-panel state together?
- On `chat:message:completed`, should the UI immediately replace the ephemeral assistant row with the completion payload, or should it always invalidate and fully refetch the message list for simplicity?
- Do we want the fresh-chat state to remember a draft separately from drafts associated with existing conversations?
- When the execution panel lands, should tool start/end events remain hidden from the thread entirely, or should the thread show a subtle inline processing indicator in addition to the right-side panel?
