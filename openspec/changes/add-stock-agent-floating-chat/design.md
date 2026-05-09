## Context

The authenticated shell already hosts market workflows under `MainLayout`, with Markets navigation entries for stock catalog, backtests, watchlists, and stock research. The app also already has a mature `super-agent` feature slice with conversation APIs, message history, optimistic sending, runtime selection, socket lifecycle subscriptions, streaming assistant state, inline tool activity, and shared AI primitives.

The requested Stock Agent is not contextual to the current market page. It is a normal chat agent like Super-Agent, but it should be launched from a floating button visible only while the user is in Markets routes. The backend contract is expected to match Super-Agent's contract, using `/stock-agent/...` instead of `/lead-agent/...`.

Relevant existing frontend assets:
- `src/components/ai/conversation.tsx` for sticky chat scrolling and jump-to-latest behavior
- `src/components/ai/message.tsx` for user and assistant message rendering with markdown
- `src/components/ai/prompt-input.tsx` for composer composition through shadcn `InputGroup`
- `src/components/ai/suggestion.tsx` for fresh-chat prompt suggestions
- installed shadcn/ui primitives including `Button`, `Badge`, `ScrollArea`, `Separator`, `Skeleton`, `Empty`, `Popover`, `Tooltip`, `Sheet`, `Drawer`, `Spinner`, and `sonner`
- `motion/react` for smooth activity-line replacement animation

## Goals / Non-Goals

**Goals:**
- Add a floating Stock Agent launcher that appears only in Markets routes inside the authenticated shell.
- Open a large desktop mini-workspace with a fixed conversation rail beside the chat surface.
- Keep the Stock Agent state, query keys, API layer, and lifecycle subscriptions separate from Super-Agent.
- Use the same stock-agent conversation and message behavior as Super-Agent, including normal conversation history, fresh chat, optimistic message submission, runtime payloads, streaming, and socket-driven completion/error handling.
- Replace Super-Agent's multi-step activity block with a Stock Agent one-line activity status where each new action replaces the previous action and a badge shows the action count for the current run.
- Reuse shared AI primitives and installed shadcn/ui components before creating custom UI primitives.
- Preserve organization scoping and reset Stock Agent state on organization changes.

**Non-Goals:**
- Do not inject selected stock, watchlist, report, backtest, route, or any page-specific context into Stock Agent prompts.
- Do not add a full Stock Agent route or sidebar destination in v1.
- Do not add shadcn registry blocks or third-party packages in v1.
- Do not rehydrate historical tool activity lines after a full page reload unless the backend later provides a persisted activity contract.
- Do not build a complex conversation filter system for the rail. V1 uses search and new chat only.

## Decisions

### 1. Implement Stock Agent as a separate feature slice rather than parameterizing Super-Agent

**Choice:** Create `src/features/stock-agent/` with its own API modules, hooks, stores, query keys, types, and UI orchestration, while reusing shared AI components and small generic helpers where they already exist.

**Rationale:** The stock-agent backend namespace, route visibility rules, floating layout, and one-line activity UX are different enough that parameterizing the existing Super-Agent workspace would create hidden coupling. A separate slice keeps state resets, query invalidation, runtime naming, and future stock-specific changes isolated.

**Alternatives considered:**
- Reuse Super-Agent components directly with injected endpoint strings: rejected because the floating layout and activity-line behavior diverge from the full-page workspace.
- Create a generic agent-chat framework first: rejected for v1 because it would be a larger refactor before proving the Stock Agent surface.

### 2. Mount the floating launcher from `MainLayout` and gate it by Markets paths

**Choice:** Render a Stock Agent floating launcher inside `MainLayout`, after the routed content, and hide it unless `location.pathname` is a supported Markets route prefix.

**Rationale:** The launcher is a shell-level affordance, not a page-specific control. Mounting it once avoids duplicating it in every market page and preserves chat state when the user moves between market routes.

Supported v1 route prefixes:
- `/stocks`
- `/stocks/watchlists`
- `/stocks/research`
- `/backtests`

**Alternatives considered:**
- Add the launcher to each market page: rejected because it duplicates layout and lifecycle concerns.
- Add a new sidebar item and route first: rejected because the user asked for a floating button/panel, not a full route.

### 3. Use a large desktop floating mini-workspace with a fixed rail

**Choice:** On desktop, the open panel uses a fixed bottom-right overlay around `760-880px` wide and `calc(100dvh - 6.5rem)` tall. It has a rail column around `240px` and a chat column taking the remaining width.

**Rationale:** A small support-chat bubble is too cramped for conversation history, message thread, runtime controls, and streaming feedback. A fixed rail satisfies the requested simple conversation list without introducing a drawer on desktop.

**Alternatives considered:**
- Drawer-based conversation list: rejected because the user prefers a persistent list beside the chat.
- Full-width route: rejected for v1 because the requested behavior is a floating panel.

### 4. Keep the conversation rail simple

**Choice:** The rail contains a title, compact search, new chat action, loading/error/empty states, and conversation rows. It does not include Active/Archived toggles in v1.

**Rationale:** The Stock Agent widget should stay fast to scan. Super-Agent's rail can retain richer filtering, but Stock Agent's floating panel should avoid crowding.

**Alternatives considered:**
- Clone Super-Agent rail exactly: rejected because status filters add complexity the user explicitly does not need.

### 5. Build a Stock Agent one-line activity component

**Choice:** Create a dedicated `StockAgentActivityLine` component instead of using `SuperAgentActivityBlock` or `ChainOfThought`. It renders only the newest activity label and a `Badge` with the number of actions seen in the active run.

**Rationale:** The requested behavior is not a timeline. It is a compact live status line where new actions replace older actions with a smooth visual transition. A dedicated component avoids fighting timeline-style components.

Animation behavior:
- New action text enters via opacity and translateY.
- Previous text exits via opacity and translateY.
- The step-count badge updates in place with a subtle scale transition.
- The component does not animate height repeatedly; it mounts/collapses at stable boundaries.

**Alternatives considered:**
- Reuse `ChainOfThought`: rejected because it is collapsible and multi-step.
- Reuse `SuperAgentActivityBlock`: rejected because it renders each tool invocation as a separate visible step.

### 6. Preserve Super-Agent request semantics for Stock Agent endpoints

**Choice:** Use equivalent API functions under `/stock-agent`:
- `GET /stock-agent/conversations`
- `GET /stock-agent/conversations/{conversation_id}/messages`
- `GET /stock-agent/catalog`
- `POST /stock-agent/messages`

Message submission includes the same payload shape as Super-Agent:
- `content`
- `conversation_id`
- `provider`
- `model`
- optional `reasoning`
- `subagent_enabled`

**Rationale:** The user confirmed the contract is the same. Keeping canonical field names avoids speculative normalization and follows the repo guidance for third-party/provider integration.

**Alternatives considered:**
- Remove runtime controls from the widget: rejected for now because the confirmed contract matches Super-Agent.
- Add broad fallback payload mappings: rejected because there is no evidence of alternate field names in this runtime path.

### 7. Use existing UI primitives and avoid new shadcn installs

**Choice:** Compose from existing AI and shadcn components. Do not install new shadcn registry blocks in v1.

**Rationale:** The project already has the primitives needed for this UI. Registry search did not surface a chat/prompt block that fits better than the existing AI components, and adding external blocks would increase cleanup work.

Primary component mapping:
- Floating launcher and header actions: `Button`, `Tooltip`
- Status and activity count: `Badge`, `Spinner`
- Conversation rail: `ScrollArea`, `Skeleton`, `Empty`, `Button`
- Layout separators: `Separator`
- Composer: `PromptInput` and shadcn `InputGroup` through the existing AI primitive
- Runtime/settings: existing Super-Agent runtime picker patterns, with `Popover` if compacting controls is necessary
- Errors: `sonner` toast for request failures, small in-thread retry surfaces only where persistent context is needed

## Risks / Trade-offs

- [Risk] The backend socket events may not identify stock-agent runs separately if they share the same `chat:message:*` channel names as Super-Agent. -> Mitigation: scope handling by active Stock Agent conversation id and use Stock Agent query keys for invalidation. If the backend emits an agent namespace later, isolate that mapping inside the Stock Agent lifecycle hook.
- [Risk] Duplicating Super-Agent logic can drift over time. -> Mitigation: keep shared rendering in `components/ai` and duplicate only orchestration that truly differs: endpoints, query keys, floating layout, simple rail, and activity line.
- [Risk] A large floating panel can cover market data. -> Mitigation: make minimize persistent and do not auto-open the panel. Keep the panel anchored and bounded to viewport height.
- [Risk] Runtime controls can crowd the compact composer. -> Mitigation: move runtime/subagent controls into a compact header or composer popover while preserving request semantics.
- [Risk] The one-line activity indicator loses detail compared with Super-Agent's timeline. -> Mitigation: use the badge count to communicate total activity volume and keep detailed metadata/actions out of v1 unless product asks for an inspector later.
- [Risk] Mobile two-column layout would be cramped. -> Mitigation: mobile opens a full-screen sheet/drawer with chat as the primary view and conversation list as a secondary surface.

## Migration Plan

1. Add the Stock Agent feature slice behind route-based visibility only on Markets routes.
2. Mount the launcher in `MainLayout` without changing existing market page layout contracts.
3. Wire organization-change reset alongside existing Super-Agent and Multi-Agent resets.
4. Verify Stock Agent and Super-Agent can be used independently without shared cache or store collisions.
5. Rollback by removing the `MainLayout` launcher mount and the additive `stock-agent` feature slice; no persistent frontend migration is required.

## Open Questions

- Does the backend use the exact same socket event names for Stock Agent as Super-Agent, or is there a stock-agent-specific event namespace?
- Should the open/minimized panel state persist across page reloads, or is in-memory state enough for v1?
- Should archived conversations be visible in the Stock Agent rail in v1, or should search only cover active conversations?
