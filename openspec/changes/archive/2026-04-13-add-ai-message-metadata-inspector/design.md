## Context

Both chat workspaces already render persisted assistant messages from conversation history:

- [chat-thread.tsx](/home/kinghuynh/Project/war_mind_fe/src/features/super-agent/components/chat-thread.tsx) and [chat-workspace.tsx](/home/kinghuynh/Project/war_mind_fe/src/features/super-agent/components/chat-workspace.tsx) for `Super-Agent`
- [chat-thread.tsx](/home/kinghuynh/Project/war_mind_fe/src/features/multi-agent/components/chat-thread.tsx) and [chat-workspace.tsx](/home/kinghuynh/Project/war_mind_fe/src/features/multi-agent/components/chat-workspace.tsx) for `Multi-Agent`

The current UI shows message content and copy actions, but it does not expose assistant metadata that is already present in the message payload. Sample payloads show several metadata fields, but the requested UI only needs:

- `model`
- `skill` information (`skill_id`, optional `skill_version`, optional `loaded_skills`)
- `tool_calls`

The requested behavior is also intentionally product-facing rather than debug-facing:

- metadata should open from an assistant-message action
- details should appear in a right-side inspector
- tools should reuse the existing chain-of-thought execution style
- timestamps and raw JSON payloads must stay hidden

This deserves a design artifact because the change crosses two feature slices, adds a new secondary workspace surface, and benefits from a shared metadata-presentation strategy without introducing unnecessary global state.

## Goals / Non-Goals

**Goals:**
- Add a metadata-inspector action to assistant messages in both chat workspaces
- Show metadata in a dedicated right-side inspector instead of expanding the message bubble
- Reuse the existing chain-of-thought and tool-presentation language for tool-call display
- Keep the inspector focused on `Model`, `Skill`, and `Tools`, hiding empty sections
- Keep metadata selection scoped to the active workspace and clear it when conversation context changes
- Support responsive behavior with a desktop right panel and a mobile right-side sheet

**Non-Goals:**
- Showing metadata for user messages
- Displaying timestamps, raw JSON argument dumps, raw backend payloads, or low-level debugging fields
- Replacing the existing inline `Super-Agent` activity block used during streaming
- Introducing a global cross-app inspector store or a generic conversation-debugger framework
- Changing backend contracts, message APIs, or conversation-history persistence rules

## Decisions

### 1. Keep inspector selection state inside each workspace, not in shared global state

**Choice:** Each workspace will own its own selected assistant-message metadata target. `ChatThread` receives a callback such as `onOpenMetadata(message)` and remains responsible only for rendering thread rows and message actions.

**Rationale:** The selected metadata target is view-local UI state tied to the active conversation and layout of a single workspace. Keeping it local:

- matches the existing architecture where each workspace already owns run-state and thread-specific UI behavior
- avoids coupling `Super-Agent` and `Multi-Agent` through a shared store
- makes reset-on-conversation-change straightforward

**Alternatives considered:**
- a shared Zustand inspector store: rejected because it adds cross-feature coordination for a purely local interaction
- state inside each message row: rejected because the inspector belongs to the workspace layout, not to an individual bubble

### 2. Use a shared metadata normalizer and presentation component

**Choice:** Create a small shared normalization layer for assistant metadata plus a shared inspector presentation component under shared AI UI, while still letting each feature own the selection state and layout wiring.

The normalizer should safely convert raw `metadata: Record<string, unknown> | null` into a display-oriented shape such as:

- `model: string | null`
- `skillId: string | null`
- `skillVersion: string | null`
- `loadedSkills: string[]`
- `toolCalls: Array<{ id: string; name: string; arguments: Record<string, unknown> }>`
- `hasDisplayableMetadata: boolean`

**Rationale:** The backend metadata shape is not strongly typed enough in both features to render directly in JSX without repetitive guards. A shared normalizer:

- keeps parsing rules in one place
- prevents duplicate `unknown` casting across two workspaces
- makes action visibility and empty-section logic deterministic

**Alternatives considered:**
- parse metadata independently in `super-agent` and `multi-agent`: rejected because it duplicates brittle runtime checks
- fully strengthen every feature type first: rejected because this change only needs a safe presentation subset

### 3. Reuse existing tool presentation rules instead of inventing a second tool-display language

**Choice:** Tool calls in the inspector will reuse the same mapped labels, icons, and compact argument summaries already established by the `Super-Agent` tool presentation helpers and chain-of-thought-style rows.

Implementation-wise, the current `super-agent` helper in [tool-presentation.ts](/home/kinghuynh/Project/war_mind_fe/src/features/super-agent/utils/tool-presentation.ts) should be moved or wrapped so both workspaces can consume the same formatting rules.

**Rationale:** The user explicitly wants tools to feel “giống như trong conversation”. Reusing the existing execution vocabulary gives:

- stable tool naming such as `fetch_content` -> `Crawl`
- consistent summaries for arguments such as URLs and queries
- no second visual language for tool history

**Alternatives considered:**
- show raw tool names and plain text argument strings: rejected because it would feel less polished than the current conversation UI
- render a generic key/value table for tool calls: rejected because it drifts toward debugging UI and away from the agreed product experience

### 4. Keep the desktop inspector inline to the workspace, with a sheet fallback on smaller screens

**Choice:** On larger viewports, the workspace will render a persistent right-side inspector panel inside the chat workspace layout. On smaller viewports, the same content will render inside a right-side `Sheet`.

**Rationale:** The request explicitly calls for a “right bar,” which on desktop reads better as an inline inspector than as a modal overlay. At the same time, the existing codebase already uses `Sheet` patterns for responsive secondary surfaces, so mobile should follow that precedent.

This leads to a layout split:

- desktop: thread + inspector coexist visibly
- smaller viewports: thread stays primary, inspector appears as a transient sheet

**Alternatives considered:**
- use `Sheet` at every breakpoint: rejected because it weakens the inspector feel on desktop
- use a resizable split panel immediately: rejected for phase one because it adds more layout complexity than the feature needs

### 5. Only assistant messages with displayable metadata get the action

**Choice:** The metadata action appears only on assistant messages whose normalized metadata has at least one populated display section.

Displayable sections are:

- `Model`
- `Skill`
- `Tools`

User messages never get this action. Assistant messages with fully empty or irrelevant metadata also do not get the action.

**Rationale:** This keeps the thread clean and prevents dead-end interactions. It also aligns with the requested product scope: the metadata is about how the AI response was produced.

**Alternatives considered:**
- show the action on every assistant message and open an empty inspector: rejected because it creates noise and weakens confidence in the feature
- show the action on user messages too: rejected because there is no requested value there

### 6. Hide empty sections instead of rendering placeholders

**Choice:** The inspector should only render sections that contain real data. If a selected assistant response has a model and tools but no skill, the `Skill` section disappears entirely.

**Rationale:** This keeps the panel compact and makes the metadata feel intentional rather than diagnostic. It also avoids having to invent placeholder copy for missing values that do not help the user.

**Alternatives considered:**
- render all sections with `N/A`: rejected because it adds visual weight without insight
- collapse everything into one generic metadata card: rejected because `Model`, `Skill`, and `Tools` are distinct mental buckets

### 7. Do not conflate persisted message metadata with live streaming activity

**Choice:** The metadata inspector reads historical `message.metadata` attached to a selected assistant message. It does not reuse live `activityTrace` state as its data source, even though both features can share presentation primitives.

**Rationale:** `activityTrace` in `Super-Agent` is ephemeral session state for a currently streaming or recently completed response. The metadata inspector is about the persisted assistant message the user clicked. Treating them as separate sources avoids subtle mismatches when:

- a message has stored `tool_calls` but no current trace
- a live trace is still updating before persisted metadata arrives
- the user opens metadata for an older historical response

**Alternatives considered:**
- derive inspector content from `activityTrace` when available: rejected because it would make the inspector inconsistent across persisted and historical messages

## Risks / Trade-offs

- [Shared normalization may lag behind future backend metadata fields] -> Mitigation: keep the normalizer intentionally narrow and focused on the three approved display sections
- [Desktop layout can feel cramped if the inspector is too wide] -> Mitigation: use a fixed moderate width for phase one and keep sections visually compact
- [Tool-call presentation reuse may create dependency tension between feature-local and shared code] -> Mitigation: extract only the label/icon/summary helpers that are genuinely shared, while keeping feature-specific live-trace logic where it already lives
- [Responsive inspector behavior can diverge between workspaces] -> Mitigation: use one shared inspector component and consistent open/close semantics across both pages
- [Older assistant messages may lack some metadata fields] -> Mitigation: gate the action by `hasDisplayableMetadata` and hide empty sections rather than forcing partial or placeholder UI

## Migration Plan

1. Add a shared assistant-metadata normalization helper for `model`, `skill`, and `tool_calls`.
2. Extract or wrap tool-presentation helpers so both `Super-Agent` and `Multi-Agent` can render tool-call summaries consistently.
3. Create a shared metadata inspector component that renders `Model`, `Skill`, and `Tools`, with chain-of-thought-style tool rows.
4. Add a new assistant-message metadata action in both chat-thread implementations.
5. Extend each workspace with local selected-message metadata state plus responsive inspector rendering.
6. Clear the selected metadata target whenever the active conversation changes.
7. Verify desktop inline panel behavior, mobile sheet behavior, empty-section hiding, and action gating across both workspaces.

Rollback is low risk because the change is frontend-only and additive. Removing the new message action and inspector layout wiring would restore the previous thread behavior without affecting message loading or send flows.

## Open Questions

- No blocking open questions at this stage. The product constraints for phase one are already clear: assistant-only action, no timestamp, no raw JSON, and tool display that matches the existing conversation style.
