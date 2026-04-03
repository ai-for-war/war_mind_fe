## Context

`Super-Agent` already has a usable chat workspace with a thread, a composer, optimistic user-message insertion, and streaming assistant state. The current implementation is intentionally narrow:

- [chat-workspace.tsx](/home/kinghuynh/Project/war_mind_fe/src/features/super-agent/components/chat-workspace.tsx) coordinates fresh-chat state, selected-conversation state, and prompt submission
- [composer-panel.tsx](/home/kinghuynh/Project/war_mind_fe/src/features/super-agent/components/composer-panel.tsx) currently only handles prompt text and submit
- [messages-api.ts](/home/kinghuynh/Project/war_mind_fe/src/features/super-agent/api/messages-api.ts) currently sends only `content` and optional `conversation_id`
- [chat-thread.tsx](/home/kinghuynh/Project/war_mind_fe/src/features/super-agent/components/chat-thread.tsx) renders messages without per-turn runtime metadata
- the workspace store currently tracks prompt drafts, run state, thread errors, and streaming assistant content, but no model-selection state

The backend now exposes a dedicated runtime catalog documented in [lead_agent_catalog_frontend_guide.md](/home/kinghuynh/Project/war_mind_fe/docs/catalog/lead_agent_catalog_frontend_guide.md). That guide makes several constraints explicit:

- the catalog is the frontend source of truth for provider, model, and reasoning options
- defaults come from backend, not frontend hardcoding
- `reasoning` must only be sent when the selected model exposes non-empty `reasoning_options`
- provider/model/reasoning availability can change over time, so frontend must tolerate invalidation and fallback

The product direction is also now clear:

- model selection is not a conversation-level setting
- users may switch runtime between any two messages
- the selector must live in the message composition area
- the composer should stay compact, so provider should not be a standalone visible control
- `Choose model` should open a grouped picker where provider is the group and model is the item
- `Reasoning` should appear only when the current model supports it

This is a good candidate for a design artifact because the change crosses API shape, client state, composer UI, responsive interaction, optimistic message behavior, and thread rendering.

## Goals / Non-Goals

**Goals:**
- Keep runtime selection in the same interaction surface as prompt submission so each message clearly uses the currently visible runtime
- Stay fully catalog-driven, including defaults, model availability, reasoning options, and fallback behavior
- Preserve a compact composer layout by exposing one `Choose model` control plus conditional `Reasoning`
- Allow users to switch runtime between messages in the same conversation without introducing conversation-level locking semantics
- Make the runtime used for a submitted turn visible in the thread so users can understand mixed-model conversations
- Fit the implementation into the existing `super-agent` feature slice and current query/store patterns without adding a new top-level route or global settings surface

**Non-Goals:**
- Adding a dedicated runtime settings page, sidebar control, or conversation-level setup step
- Hardcoding provider/model lists or introducing frontend-only runtime aliases
- Allowing unsupported provider/model/reasoning combinations to pass through optimistic UI unchecked
- Redesigning the whole composer shell or replacing the existing thread/composer architecture
- Introducing a fully generic cross-feature model selector abstraction before a second concrete use case exists

## Decisions

### 1. Keep runtime selection feature-local to `super-agent`

**Choice:** Implement the catalog query, composer runtime state, request mapping, and thread runtime display inside `src/features/super-agent/`, adding only small shared UI reuse where it already exists.

**Rationale:** The behavior is tied to `Super-Agent` message composition semantics, not to a global model-setting concept. The existing `model-selector` component in `src/components/ai/` is useful as a visual primitive and interaction precedent, but this change still needs feature-specific state rules such as fresh-chat persistence, catalog invalidation fallback, and turn-level runtime snapshots.

**Alternatives considered:**
- build a new app-wide runtime settings store: rejected because the setting is per message, not global
- move the whole behavior into `src/components/ai/`: rejected because the API and state semantics are lead-agent-specific today

### 2. Use a compact composer footer with one visible model trigger plus conditional reasoning

**Choice:** Add runtime controls to the composer footer, next to the submit affordance, rather than placing full provider/model/reasoning controls above the textarea or elsewhere on the page.

**Rationale:** The selected runtime should be visible at the exact point of send. A compact footer control keeps the composer readable and matches the product decision to avoid three always-visible selectors. The visible controls become:

- `Choose model` trigger showing the currently selected `provider / model`
- `Reasoning` trigger only when the selected model supports reasoning
- existing submit control

This keeps the composer dense but not crowded and makes it obvious that the selection applies to the next message.

**Alternatives considered:**
- put provider, model, and reasoning all inline as independent controls: rejected because it is visually heavy and duplicates provider exposure
- place runtime selection in a separate settings row above the composer: rejected because it weakens the per-message mental model

### 3. Model picker uses grouped selection, not multi-step provider-first selection

**Choice:** The `Choose model` trigger opens a single picker grouped by provider, with provider names rendered as block headers and models rendered as selectable items beneath them. Desktop should use a `Dialog` or command-style surface; mobile should use a `Sheet`.

**Rationale:** The backend shape is provider-first, but the user task is model selection. A single grouped picker makes scanning faster, preserves provider context, and avoids adding a second visible provider control to the composer. It also maps naturally to the existing `Command`-style UI already present in `src/components/ai/model-selector.tsx`.

**Interaction rules:**
- opening the picker shows providers in catalog order
- model items within a provider stay in catalog order unless filtered by search
- selecting a model implicitly sets both `provider` and `model`
- the closed trigger must still display both provider and model so the active runtime is unambiguous

**Alternatives considered:**
- standalone provider dropdown followed by model dropdown: rejected because it takes more space and adds one extra decision step to every change
- ungrouped flat searchable model list: rejected because provider context becomes too easy to miss

### 4. Reasoning is derived from the selected model and is never stale

**Choice:** Treat `reasoning` as a dependent field driven entirely by the currently selected model entry from the catalog. When the model supports reasoning, show the control and initialize from `default_reasoning` when present. When the model does not support reasoning, hide the control and clear any prior reasoning selection from the active request state.

**Rationale:** This mirrors the backend contract exactly and prevents the most likely UI bug in this flow: carrying over a reasoning value from a previously selected model to a new model that does not support it.

**State rules:**
- `reasoning_options.length > 0` => render reasoning control
- `reasoning_options.length === 0` => hide control and ensure outbound request omits `reasoning`
- refreshed catalog invalidates stale reasoning values and falls back to a valid default when possible

**Alternatives considered:**
- leave the reasoning control disabled when unavailable: rejected because it adds dead UI and implies a missing step
- keep stale reasoning in hidden state for later reuse: rejected because it risks invalid submissions

### 5. Catalog data is loaded with React Query and validated at submit time

**Choice:** Add a dedicated catalog query hook under `super-agent`, backed by TanStack Query. The composer will initialize its runtime selection from the loaded catalog defaults, and submission logic will validate the active selection against the latest loaded catalog before sending.

**Rationale:** The catalog is server-owned, cacheable state, so Query is the right fit. Validation at submit time matters because the catalog can change while the user is on the page. The UI should feel fast, but correctness still depends on checking that the selected provider/model/reasoning tuple remains valid at the moment of send.

**Expected split:**
- Query: catalog response
- Feature-local or workspace store state: active composer runtime selection
- Submit mapping: normalize selection into request payload and omit `reasoning` when unsupported

**Alternatives considered:**
- fetch catalog once on app boot and treat it as static: rejected because the backend guide explicitly frames it as runtime-driven
- keep catalog only in component-local state without Query: rejected because it would make refetch/error/retry behavior clumsier

### 6. Persist runtime selection for the next message, but snapshot runtime per submitted turn

**Choice:** The composer keeps the current runtime selection after a successful send so the next message starts from the last used model. At the same time, each submitted turn gets its own immutable runtime snapshot for thread display and optimistic rendering.

**Rationale:** Users often send several consecutive prompts with the same model, so resetting to backend default after every send would be frustrating. But because the product wants per-message switching, each turn still needs its own recorded runtime so later changes in the composer do not rewrite history.

**Implications for state/data:**
- active composer selection is mutable
- submitted message metadata is immutable once attached to a turn
- optimistic user messages for existing conversations should carry the runtime snapshot immediately
- fresh-chat optimistic state should also include the runtime snapshot so the first turn is not visually blank while waiting for the server

**Alternatives considered:**
- reset runtime to backend default after each send: rejected because it adds friction for repeated use
- treat the whole conversation as locked to the last sent model: rejected by product direction

### 7. Runtime snapshot should live in message metadata, with a safe local fallback for optimistic turns

**Choice:** Extend the frontend message/request types so runtime can be included in send payloads and represented in message metadata or a frontend-owned runtime display field. For optimistic turns, attach the runtime snapshot locally at creation time. For server-returned messages, prefer metadata from the backend if present; otherwise preserve the frontend-known snapshot for already-submitted turns in the current session.

**Rationale:** The current message shape already has a `metadata` field, which is the natural place for runtime annotations if the backend includes them. But the thread needs stable runtime display even before every backend payload is enriched, so the frontend should not depend exclusively on future metadata availability for its own submitted turns.

**Alternatives considered:**
- show runtime only in transient UI and not in the thread: rejected because mixed-model conversations become hard to reason about
- rely entirely on backend history payloads to contain runtime metadata from day one: rejected because the current frontend can still provide useful per-turn visibility for newly submitted messages

### 8. Catalog invalidation should auto-fallback, not strand the composer in an invalid state

**Choice:** When a refetch reveals that the active provider/model/reasoning selection is no longer valid, the composer should automatically repair the selection using backend defaults and show a lightweight notice. The UI must not allow the user to submit with a stale invalid tuple.

**Rationale:** Runtime catalogs are explicitly dynamic. Letting the composer remain in an invalid state until the user manually fixes it would create confusing submission failures. Auto-repair keeps the experience resilient while still informing the user that a change occurred.

**Fallback order:**
- if current model disappears, replace with backend default provider/model
- if model remains but reasoning disappears, replace with model default reasoning when available
- if catalog load fails entirely, disable runtime-dependent submission and show retry/error state

**Alternatives considered:**
- preserve invalid selection and fail only on submit: rejected because the error would arrive too late
- silently replace invalid selection without notice: rejected because unexplained model changes are jarring

### 9. Keep the implementation additive to the existing workspace architecture

**Choice:** Extend `ChatWorkspace`, `ComposerPanel`, `messagesApi`, `useSendMessage`, and message/thread types rather than introducing a second orchestration layer.

**Rationale:** The current `super-agent` implementation already has clear ownership boundaries:
- `ChatWorkspace` orchestrates state and submission
- `ComposerPanel` renders the compose surface
- `useSendMessage` handles optimistic send behavior
- `ChatThread` renders visible turn history

This feature should deepen those seams, not replace them. The main additions are:
- catalog query hook
- runtime selection state and helpers
- request payload extension
- thread rendering of runtime metadata

**Alternatives considered:**
- build a new combined `runtime-aware-chat-shell` wrapper: rejected because it duplicates current orchestration responsibilities

## Risks / Trade-offs

- **[Runtime selection state can drift from the latest catalog]** -> Validate selection against the latest query data and auto-fallback before send
- **[Per-turn runtime display may be inconsistent for older history if backend does not yet return runtime metadata]** -> Guarantee stable display for newly submitted turns in the current session and treat deeper historical backfill as an incremental enhancement if needed
- **[Adding controls into the composer footer can crowd small screens]** -> Use a compact trigger label on mobile and move the picker into a bottom sheet instead of a narrow dropdown
- **[Optimistic messages can lose runtime context if request and optimistic object shapes diverge]** -> Derive optimistic message runtime from the exact normalized request payload used for submission
- **[Auto-fallback after catalog refresh can surprise users]** -> Show a visible but lightweight notice whenever the active selection changes because the previous choice is no longer available
- **[Feature-local implementation may duplicate some future generic model-selection logic]** -> Accept this for now and extract only after a second feature needs the same runtime-catalog semantics

## Migration Plan

1. Add runtime catalog types and a `useLeadAgentRuntimeCatalog` query hook under `src/features/super-agent/`
2. Extend send-message request typing and API mapping to include `provider`, `model`, and optional `reasoning`
3. Add runtime selection state plus validation/fallback helpers to the workspace flow
4. Update `ComposerPanel` to render the `Choose model` trigger and conditional `Reasoning` control
5. Implement grouped model picker behavior for desktop and mobile
6. Extend optimistic message creation and thread rendering to carry and display per-turn runtime metadata
7. Verify fresh-chat, existing-conversation, loading, error, and catalog-refresh invalidation flows end to end

Rollback is low risk because this is an additive UI enhancement within an existing feature. Reverting the runtime-selection controls and request-shape extensions would restore the previous prompt-only chat behavior without affecting routing or the conversation rail.

## Open Questions

- Does the backend already persist and return runtime metadata in conversation history, or does phase one need frontend-local display only for newly submitted turns?
- Should catalog refetch happen only on page load plus explicit retry, or also on window refocus / reconnect to reduce stale runtime availability?
- Does product want a search field inside the grouped model picker from phase one, or is grouped browsing alone sufficient for the initial model count?
