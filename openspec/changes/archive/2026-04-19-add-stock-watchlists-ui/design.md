## Context

The stocks feature already provides a protected stock catalog route and a stock company detail popup, but it has no durable list-management workflow for research symbols. Backend support now exists for watchlist CRUD plus watchlist-item CRUD under `/api/v1/stocks/watchlists`, scoped by authenticated user and active organization.

This change crosses multiple frontend surfaces:
- a new protected watchlists route and page shell
- sidebar navigation and router entries
- stock catalog row actions
- stock company overview popup header actions

The backend contract is intentionally narrow in v1. It does not provide watchlist search, watchlist filters, pagination, custom ordering, bulk mutation, or watchlist analytics. The UI has to stay inside those limits and treat `stock` on a watchlist item as nullable.

## Goals / Non-Goals

**Goals:**
- Add a dedicated desktop-first watchlists route inside the authenticated stocks area.
- Expose watchlist create, rename, delete, list-items, add-symbol, and remove-symbol flows using the documented endpoints only.
- Let users save symbols to a watchlist from the stock catalog and from the stock company popup without losing current page context.
- Keep the implementation aligned with the repo's feature-first structure and shadcn component patterns.

**Non-Goals:**
- Client-side search or filter controls inside a watchlist.
- Pagination, infinite scroll, or custom ordering on watchlist items.
- Multi-watchlist add in a single submit action.
- Drag-and-drop organization, section headers, tags, or analytics cards.
- Mobile-first interaction patterns beyond keeping the route structurally compatible with future responsive work.

## Decisions

### Decision: Introduce a dedicated `stock-watchlists` feature area
The implementation will add a separate feature area for watchlists instead of folding the route into the existing stock catalog page component.

Why:
- The route has distinct data dependencies and page states from the catalog.
- CRUD dialogs, active-watchlist state, and item-table rendering would otherwise overload `stocks-page.tsx`.
- This follows the repo convention of feature-owned `components`, `api`, `hooks`, `types`, and `query-keys`.

Alternatives considered:
- Extend the existing stocks feature page with tabs.
  Rejected because watchlists is a separate route, not a local view toggle, and tab-local state would complicate router and data ownership.

### Decision: Keep the watchlists page as a two-pane desktop workspace
The route will use a left rail for watchlist summaries and a main panel for the currently selected watchlist's items.

Why:
- The backend supports multiple watchlists and one-item collection view at a time.
- A rail makes switching lists fast without inventing unsupported search or filter controls.
- It fits the current app shell and the user's desktop-first priority.

Alternatives considered:
- Render each watchlist as stacked cards on one page.
  Rejected because it scales poorly once the user has several watchlists and would trigger many unnecessary item fetches.

### Decision: Use explicit dialogs with plain text inputs for watchlist create/rename/add-symbol
The watchlist page dialogs will use shadcn `Dialog` plus `Field` and `Input`, and `Add Symbol` on the watchlist page will accept a direct symbol input instead of catalog search.

Why:
- The watchlist API for adding items accepts only `{ symbol }`.
- The user asked the design to stay close to backend support.
- A plain symbol input avoids pretending that watchlist-local search or catalog-backed add search is part of the route contract.

Alternatives considered:
- Use a combobox backed by stock catalog search on the watchlist page.
  Rejected for v1 because it adds another asynchronous dependency and implies a richer watchlist composition flow than requested.

### Decision: Share an `Add to watchlist` action flow across stock catalog and company popup
Catalog rows and the company popup header will reuse the same selection dialog/popover logic for adding the current symbol to an existing watchlist, with an optional create-first branch when no watchlists exist.

Why:
- The action semantics are identical in both surfaces.
- Shared behavior keeps duplicate/empty/error handling consistent.
- It minimizes drift between catalog and popup interactions.

Alternatives considered:
- Build separate add flows for each surface.
  Rejected because it duplicates logic and increases the chance of inconsistent watchlist handling.

### Decision: Prefer refetch-safe state over optimistic local bookkeeping for cross-surface updates
Mutations will invalidate or refetch the watchlist list and the active watchlist items instead of relying entirely on hand-maintained local cache updates.

Why:
- The backend owns watchlist ordering and newest-first item sorting.
- Watchlist summary metadata such as `updated_at` changes after item mutations.
- Simpler cache invalidation reduces drift between the rail, active panel, and add-to-watchlist entry points.

Alternatives considered:
- Fully optimistic cache updates for every mutation.
  Rejected for the first pass because it adds complexity around active-watchlist switching, duplicate conflicts, and stale `updated_at` values.

## Risks / Trade-offs

- [User expects search/filter inside watchlists] -> Keep the route intentionally minimal and mirror only backend-supported controls in v1.
- [Active watchlist becomes stale after delete or 404] -> Refetch watchlist summaries and fall back to the next available watchlist or the page empty state.
- [Watchlist item has `stock = null`] -> Keep the row visible with safe fallbacks and allow removal without blocking the page.
- [Cross-surface add actions create duplicate symbols] -> Surface `409 Conflict` as a user-facing duplicate state without inferring business logic from error strings.
- [Scope creep from catalog-backed add flows] -> Keep watchlist-page add simple, and restrict cross-surface add to selecting one destination watchlist.

## Migration Plan

1. Add the new watchlists feature files, route, and sidebar destination behind the existing authenticated shell.
2. Wire the watchlist API client and React Query hooks to the active organization-aware API client.
3. Ship the watchlists route and cross-surface add actions together so the route is immediately reachable and useful.
4. If rollback is needed, remove the `/stocks/watchlists` route and sidebar item while leaving the backend contract untouched.

## Open Questions

- None for proposal readiness. The desktop-first scope, separate route, and backend-constrained interaction model have been clarified in discussion.
