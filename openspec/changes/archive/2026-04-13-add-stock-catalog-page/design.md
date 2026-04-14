## Context

The backend already exposes a documented stock catalog contract in [frontend_integration_guide.md](/C:/Project/AI_FOR_WAR/war_mind_fe/docs/stock/frontend_integration_guide.md), but the frontend currently has no protected page, no sidebar entry, and no catalog-specific data flow for browsing stocks inside the authenticated shell.

The existing application architecture already provides the main building blocks this feature needs:

- `MainLayout` hosts authenticated feature routes inside the shared glass-style shell
- `react-router-dom` centralizes protected routing in `src/app/router.tsx`
- `apiClient` already injects `Authorization` and `X-Organization-Id` headers
- `@tanstack/react-query` is already available for server-state fetching
- the repo already contains a reusable infinite-scroll hook at [use-scroll-area-infinite-scroll.ts](/C:/Project/AI_FOR_WAR/war_mind_fe/src/hooks/use-scroll-area-infinite-scroll.ts)
- the design direction for this page is already constrained: search input, exchange chip/badge filter, group dropdown, infinite scroll, and a data-dense stock table

This change deserves a design artifact because it crosses route registration, sidebar navigation, new feature-slice creation, paged API aggregation into an infinite-scroll UX, and adoption of `@tanstack/react-table` as a new dependency for table-state management.

## Goals / Non-Goals

**Goals:**
- Add a discoverable `Stock Catalog` entry inside the authenticated shell
- Create a dedicated `src/features/stocks/` slice that cleanly owns page UI, API integration, hooks, query keys, and types
- Convert the page-based stock API into an infinite-scroll browsing experience without changing the backend contract
- Keep filter state explicit and lightweight: text search, exchange chips, and group dropdown
- Use `@tanstack/react-table` for column definitions and table-state composition while keeping rendering aligned with the repo's shadcn-style UI
- Reuse existing app primitives where possible, especially the infinite-scroll hook and shared date formatting utilities

**Non-Goals:**
- Adding stock detail pages, candlestick charts, watchlists, or broker/company-detail workflows
- Changing the backend stock API contract, auth model, or pagination semantics
- Introducing AG Grid, virtualization, or server-side sorting in this iteration
- Adding page-size controls or explicit page-number pagination UI
- Persisting stock filters in global Zustand state for cross-page reuse

## Decisions

### 1. Build the feature as a dedicated `stocks` slice under `src/features`

**Choice:** Implement the page in `src/features/stocks/` with feature-local modules such as `api/`, `hooks/`, `types/`, `components/`, `query-keys.ts`, and `index.ts`.

**Rationale:** This matches the project's existing feature-first structure and keeps UI, API mapping, and query logic together. The stock page is a route feature, not a widget or a shell concern.

**Expected structure direction:**
- `api/stocks-api.ts` for `GET /api/v1/stocks`
- `types/stock.types.ts` for request/response and normalized UI types
- `hooks/use-stock-catalog.ts` for infinite-query orchestration
- `components/stocks-page.tsx` as the route entry
- `components/stocks-filter-bar.tsx` for search, exchange chips, and group dropdown
- `components/stocks-table.tsx` for table rendering
- `query-keys.ts` for stable TanStack Query keys

**Alternatives considered:**
- implement directly in `app/` or `widgets/`: rejected because the page is feature-specific and API-driven
- scatter types and hooks into shared folders up front: rejected because the feature is still isolated and does not justify broader abstractions yet

### 2. Keep the API contract page-based and adapt it in the frontend with `useInfiniteQuery`

**Choice:** Use TanStack Query `useInfiniteQuery` to request `GET /api/v1/stocks` page-by-page while exposing an infinite-scroll UI to the user.

The query adapter should:
- send `page` and a fixed `page_size` of `20`
- include `q`, `exchange`, and `group` only when they are meaningful
- flatten `pages[].items` into one row list for rendering
- derive `hasNextPage` from `loadedItems < total`
- compute the next `page` from the last successful response

**Rationale:** The backend already provides stable page metadata (`page`, `page_size`, `total`). `useInfiniteQuery` is the cleanest way to translate that API into a continuous scroll experience without hiding backend semantics inside ad hoc local state.

**Alternatives considered:**
- manual `page` state plus `useQuery`: rejected because it duplicates `fetchNextPage`, next-page calculation, and multi-page cache handling
- changing the API to cursor-based pagination: rejected because the proposal and scope explicitly keep the existing backend contract

### 3. Reuse the existing `useScrollAreaInfiniteScroll` hook instead of introducing a second observer pattern

**Choice:** The table container should use the existing [use-scroll-area-infinite-scroll.ts](/C:/Project/AI_FOR_WAR/war_mind_fe/src/hooks/use-scroll-area-infinite-scroll.ts) hook with a `ScrollArea`-based viewport and a sentinel at the bottom of the rendered stock rows.

**Rationale:** The app already has a hook that matches this use case:
- it is IntersectionObserver-based
- it already supports `hasNextPage`, `isFetchingNextPage`, and `onLoadMore`
- it targets the repo's `ScrollArea` structure instead of the global window scroll

Reusing it keeps the behavior consistent with other infinite surfaces and reduces implementation risk.

**Alternatives considered:**
- window scroll listener: rejected because the page lives inside a composed app shell and should not depend on document scroll
- a custom stock-only IntersectionObserver hook: rejected because the existing hook already fits the required interaction

### 4. Use `@tanstack/react-table` for table logic, but keep rendering fully controlled by local UI components

**Choice:** Add `@tanstack/react-table` as the table-state engine and pair it with a lightweight local `Table` UI component or equivalent stock-table markup styled to match the current shell.

The table engine will be used for:
- column definitions
- header and cell rendering
- stable row models
- optional future expansion points such as column visibility or sorting state

This iteration will not rely on client-side pagination because the data source is already page-based and exposed through infinite scroll.

**Rationale:** The user explicitly wants TanStack Table, and it fits this repo better than heavier data-grid solutions because:
- it integrates cleanly with custom shadcn-style rendering
- it avoids introducing a second visual system
- it keeps the markup and responsive behavior under our control

**Alternatives considered:**
- plain hand-rendered table without TanStack Table: rejected because the feature is expected to grow and the table model would become harder to extend cleanly
- AG Grid: rejected because it is heavier than this scope needs and would be more expensive to visually align with the current app shell

### 5. Keep filter state page-local and derive query params from a normalized view model

**Choice:** The stock page will keep filter state local to the feature page using React state:
- `searchText`
- `selectedExchange`
- `selectedGroup`

Before a request is made, the page will normalize these values into a query object:
- trim `searchText`; omit `q` if blank
- send uppercase exchanges from the fixed set `HOSE | HNX | UPCOM`
- send group only if a non-`All` option is selected

Changing any filter resets the infinite query back to the first page by changing the query key.

**Rationale:** These filters are page-local UI concerns. They do not need global persistence, and TanStack Query already gives us a natural reset boundary when the query key changes.

**Alternatives considered:**
- Zustand for filter state: rejected because the filters do not need to survive cross-page navigation as shared app state
- URL search params in phase one: rejected because the feature can launch cleanly without deep-linking and the implementation stays simpler

### 6. Separate page orchestration from presentational components

**Choice:** Keep the route entry page as the container that coordinates:
- filters
- infinite query state
- flattened rows
- next-page loading
- empty/loading/error branching

Then pass derived props into presentational children such as:
- `StocksFilterBar`
- `StocksTable`
- `StocksTableEmptyState`

**Rationale:** This follows the existing project pattern and keeps data logic out of the visual components. It also makes it easier to test the UI states independently.

**Alternatives considered:**
- a single page component containing fetch logic and all rendering: rejected because the state matrix is already large enough to benefit from separation

### 7. Model data freshness as a page-level summary, not row-level urgency state

**Choice:** Treat `snapshot_at` as the primary freshness signal for the loaded dataset and show it in the page header or filter area as a catalog-level badge. `updated_at` remains visible in the table for row-specific context.

**Rationale:** The API semantics describe a persisted catalog snapshot. Showing freshness at the page level tells the user how current the dataset is overall, while the row-level `updated_at` field still provides per-record context. This avoids over-emphasizing freshness on every row.

**Alternatives considered:**
- render freshness only in each row: rejected because users lose the quick top-level sense of dataset recency
- create staleness warning logic in phase one: rejected because the feature does not yet have a defined product threshold for stale data

### 8. Make empty, no-results, loading, and error states mutually exclusive and scoped to the content panel

**Choice:** The stock table area will own the main state branching:
- initial loading: skeleton layout
- success with rows: table + load-more sentinel
- success with zero rows and active filters: no-results state
- success with zero rows and no filters: empty catalog state
- error: inline error surface with retry action

Filter controls remain mounted in all non-fatal states so the user keeps context and can recover quickly.

**Rationale:** The page is filter-driven. Hiding controls during no-results or request failures would force the user to reorient. Keeping the state localized to the content panel preserves continuity.

**Alternatives considered:**
- replace the whole page with loading/error views: rejected because it weakens continuity and makes retry slower

## Risks / Trade-offs

- **[Infinite scroll can cause duplicate fetches near the sentinel]** -> Mitigation: rely on the existing hook's `isFetchingNextPage` guard and TanStack Query's built-in next-page coordination
- **[Using page-based API with infinite scroll can make exact end-of-list logic brittle]** -> Mitigation: derive `hasNextPage` from `total` versus accumulated items instead of guessing from page length alone
- **[Client-side table abstraction may suggest unsupported behaviors like local sorting]** -> Mitigation: limit phase-one table features to rendering and row modeling, and avoid exposing sort controls until backend semantics are defined
- **[Large result sets may eventually need virtualization]** -> Mitigation: keep the table markup and query adapter simple so virtualization can be added later without rewriting the API layer
- **[Page-local filter state means refresh or deep-link does not restore exact filter context]** -> Mitigation: accept this for phase one and revisit URL state only if product explicitly needs shareable filtered views
- **[Fixed group options can drift from backend data over time]** -> Mitigation: keep the approved group list centralized in the feature and treat it as a deliberate product constraint for this iteration
- **[Adding TanStack Table introduces a new dependency for a relatively small first page]** -> Mitigation: use it narrowly and structure the table so future stock-related screens can reuse the same foundation

## Migration Plan

1. Add `@tanstack/react-table` and create the local stock-table rendering primitive needed by the feature.
2. Create the `src/features/stocks/` slice with types, query keys, API adapter, and page container.
3. Implement the protected `/stocks` route and add the `Stock Catalog` sidebar entry.
4. Implement the filter bar with text search, exchange chips, and group dropdown.
5. Implement the infinite-query adapter that fetches paged API results and flattens them for table rendering.
6. Wire the page content area to the existing infinite-scroll hook and sentinel behavior.
7. Implement catalog states for loading, empty, no-results, request failure, and end-of-list behavior.
8. Verify route protection, sidebar active state, filter resets, next-page loading, nullable-field fallbacks, and freshness display.

Rollback is low risk because the change is additive and frontend-only. Removing the `/stocks` route, the sidebar item, and the `stocks` feature slice will cleanly revert the application to its prior behavior without affecting existing authenticated flows.

## Open Questions

- Should the first version persist filter state into the URL, or is page-local state sufficient until the page is used more broadly?
- Should the stock table expose row click behavior now for future detail pages, or remain strictly read-only in phase one?
- Is there any product-specific rule for when `snapshot_at` should be visually flagged as stale, or should phase one show freshness without warning thresholds?
