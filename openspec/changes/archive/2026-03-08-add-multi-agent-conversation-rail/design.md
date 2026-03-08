## Context

The `Multi-Agent` route already exists inside the authenticated application shell, but the page still renders as a blank placeholder. The backend already provides the minimum REST contract needed for a first conversation rail experience through conversation listing, including pagination, status filtering, title search, and recency metadata. That means the left-side rail can be implemented as a frontend-first slice without waiting for a new backend API.

This rail is the first navigational surface inside the multi-agent workspace. It must support three jobs at once:
- help users find existing conversations quickly
- let users switch the active conversation without leaving the page
- provide a clear way to start a new chat before the rest of the workspace is fully built

Constraints:
- the rail belongs to the `multi-agent` feature and must not become a second global app sidebar
- the existing backend list payload does not yet include a guaranteed preview snippet or active-run status
- the project already has reusable `shadcn/ui` primitives and a local `src/components/ai/` library inspired by [shadcn.io/ai](https://www.shadcn.io/ai)
- the rail should feel visually consistent with the future chat workspace, but it should not force reuse of chat-thread components where they do not fit semantically

## Goals / Non-Goals

**Goals:**
- Add a dedicated feature-scoped conversation rail to the `Multi-Agent` page
- Use the existing conversation list API for server-backed search and status filtering
- Keep the rail usable before the main thread and execution panel are implemented
- Reuse existing `shadcn/ui` primitives where possible instead of inventing new base controls
- Reuse local AI-style components only where their semantics match the rail
- Support desktop-first layout with a responsive drawer/sheet fallback for smaller viewports
- Keep the design compatible with a later multi-agent workspace that includes a thread pane and execution panel

**Non-Goals:**
- Building the full multi-agent chat thread, composer, or execution panel
- Introducing a second global navigation system under `src/widgets/sidebar/`
- Creating a new backend endpoint only for the initial rail
- Solving message preview generation perfectly before backend preview support exists
- Implementing advanced behaviors such as pinned conversations, drag reordering, unread counters, or branch-aware grouping

## Decisions

### 1. Implement the rail as a feature-scoped `aside`, not as a nested app sidebar

**Choice**: Build the conversation rail under `src/features/multi-agent/components/` as a page-level `aside` composed from standard layout primitives instead of reusing the global `Sidebar` widget.

**Rationale**: The global sidebar in `src/widgets/sidebar/` represents application navigation. The conversation rail is page-local workspace navigation. Reusing the global sidebar pattern would create a nested-sidebar mental model and make responsive behavior harder to reason about.

**Alternatives considered**:
- Reuse the global `Sidebar` widget directly: rejected because it would blur app navigation and page navigation responsibilities
- Put the rail into `src/widgets/`: rejected because this rail is tightly coupled to the `multi-agent` feature and is not cross-feature infrastructure

**Planned structure**:
- `multi-agent-page.tsx`: three-region page shell later, but only the rail needs to be functional first
- `conversation-rail.tsx`: container component
- `conversation-search.tsx`: search field + filter controls
- `conversation-list.tsx`: list state handling
- `conversation-list-item.tsx`: selectable row

### 2. Use server-backed search and filter instead of client-only filtering

**Choice**: Drive search and status filtering from the existing conversation list endpoint rather than fetching a large list and filtering entirely on the client.

**Rationale**: The backend already supports `search`, `status`, `skip`, and `limit`. Using server-backed filtering keeps result ordering authoritative, avoids stale client-side filtering logic, and scales better as conversation counts grow.

**Alternatives considered**:
- Client-only filtering after one initial fetch: simpler for a demo, but less reliable as list size grows and more likely to drift from backend ordering semantics
- Hybrid search with local-only preview indexing: premature for the current slice

**Implementation direction**:
- `useConversations()` React Query hook accepts `{ search, status, skip, limit }`
- search input uses a debounced draft value before triggering a refetch
- filter state is small and page-local, so it can live in a feature UI store or page component state

### 3. Treat conversation preview and active-run badges as progressive enhancement

**Choice**: Design the row layout to support `title`, `timestamp`, `preview`, and small state badges, but only require `title` and recency from the initial API contract. Preview text and active-run indicators will be rendered only when data is available.

**Rationale**: The current backend list payload includes title, status, counts, and timestamps, but not a guaranteed preview snippet or `is_running` field. The rail still needs a stable row layout now, so the design must degrade gracefully instead of blocking on richer metadata.

**Alternatives considered**:
- Require preview text in phase 1: rejected because it would create an unnecessary backend dependency
- Infer preview by always fetching latest message per conversation: rejected because it introduces avoidable N+1 work and unnecessary coupling for the first rail slice

**Implementation direction**:
- row primary content: title
- row secondary content: compact relative timestamp
- optional tertiary content: single-line preview if provided later by backend or already available in cache
- optional state chip/dot: derived from local run state when the chat workspace is added

### 4. Reuse `shadcn/ui` primitives first; do not force chat-thread AI components into the rail

**Choice**: Build the rail primarily from reusable `shadcn/ui` primitives already aligned with the app. Only reuse local AI components when their behavior naturally fits the rail.

**Rationale**: The conversation rail is a navigation and list-management surface, not a message-rendering surface. Components such as `Message`, `Reasoning`, `Task`, and `Persona` from the local AI set are better suited for the future thread and execution panel, consistent with the component guidance from [shadcn.io/ai](https://www.shadcn.io/ai). For the rail, standard form, layout, and list primitives are a better semantic fit.

**Reusable primitives for the rail**:
- `Input` for search
- `Button` for `New chat`
- `ScrollArea` for the list region
- `Sheet` for tablet/mobile rail presentation
- `Skeleton` for loading rows
- `Badge` or pill-styled `Button` for lightweight filters/status
- `Tooltip` for truncated titles or icon-only affordances if needed

**Local AI component reuse decision**:
- `Suggestion`: can inspire or optionally supply pill styling for lightweight filters, but should not be the default dependency because filters are stateful controls rather than prompt suggestions
- `Message`, `Reasoning`, `Task`, `Persona`, `Loader`: do not reuse in the rail; reserve them for the future thread/execution panel

### 5. Keep server state in React Query and page interaction state in a feature store

**Choice**: Split state ownership between React Query for fetched conversation data and a small feature UI store for active conversation selection and local interaction state.

**Rationale**: The conversation list is server truth and benefits from caching, refetching, and loading/error semantics. Active selection and future ephemeral state, such as an optimistic active conversation or locally derived run badge, are UI concerns and should not be stored in query cache.

**Alternatives considered**:
- Put everything in React Query: selection would become awkward and too tied to network state
- Put everything in Zustand: would duplicate loading/error logic and caching that React Query already solves
- Use URL query params immediately for active conversation selection: useful later, but unnecessary complexity for the first slice

**Initial state split**:
- React Query:
  - conversation list response
  - search/filter/pagination fetch lifecycle
- Feature store:
  - `activeConversationId`
  - current filter value
  - search input draft
  - sheet open state for small viewports

### 6. Use a responsive persistent-to-sheet pattern

**Choice**: Render the rail as a persistent left column on desktop and convert it into a left-side `Sheet` or drawer on smaller viewports.

**Rationale**: The rail is important enough to stay visible on desktop, but on tablet and mobile it should not permanently consume the main workspace width. `Sheet` is already a standard reusable pattern in the project and matches the requirement that the rail remain accessible on smaller screens.

**Alternatives considered**:
- Always persistent rail: poor use of screen space on smaller devices
- Fully hidden modal flow: too disruptive for frequent conversation switching

**Behavioral rules**:
- desktop: rail is always visible
- tablet/mobile: rail is opened on demand
- after conversation selection on mobile: the sheet may close automatically to reveal the main workspace

## Risks / Trade-offs

- **[Preview text is not guaranteed by the backend]** -> Design rows so they remain complete with only title and timestamp; add preview later without rewriting the row structure
- **[Search could feel chatty if every keystroke refetches]** -> Use a debounced search draft and only query after a short delay
- **[Feature store can drift from future routing needs]** -> Keep the initial store shape small so active conversation selection can later migrate to URL params if deep-linking becomes important
- **[Using generic primitives may initially feel less “AI-native”]** -> Match the visual language through spacing, chips, and dark-theme styling without misusing chat-specific components
- **[Responsive sheet flow may require coordination with the future main workspace header]** -> Isolate rail open/close state now so a later page header trigger can integrate without reshaping the data layer

## Migration Plan

1. Add `design.md` for the rail to lock the architectural approach before implementation
2. Implement the feature-scoped rail shell and list states under `src/features/multi-agent/`
3. Connect the rail to the existing conversation list API with React Query
4. Add search/filter interactions and local selection state
5. Add responsive `Sheet` behavior for non-desktop layouts
6. Introduce preview and active-run indicators later as non-breaking enhancements when backend or workspace state supports them

Rollback is low risk: the rail can be removed without affecting the authenticated shell, socket layer, or other features because it is isolated to the `multi-agent` feature.

## Open Questions

- Should active conversation selection remain feature-store state, or should it be promoted to URL search params once the main thread is implemented?
- Do we want the phase-1 rail filters to stay at `Active` and `Archived`, or include an `All` state from the start for easier recovery when no filter is obvious to the user?
- When the chat workspace lands, should a locally streaming conversation appear at the top of the rail immediately even before the list query refetches?
