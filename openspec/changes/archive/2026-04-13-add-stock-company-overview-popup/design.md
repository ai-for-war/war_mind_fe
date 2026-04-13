## Context

The stock catalog page already exists as a protected, data-dense browsing surface under [stocks-page.tsx](/C:/Project/AI_FOR_WAR/war_mind_fe/src/features/stocks/components/stocks-page.tsx). It fetches persisted stock rows, keeps filter state local to the page, and renders results inside the authenticated glass-style markets shell. That makes it the natural entry point for company detail.

The backend also already exposes a documented company-info endpoint family under `/api/v1/stocks/{symbol}/company/*`, with `overview` available as a snapshot payload in [stock_company_frontend_guide.md](/C:/Project/AI_FOR_WAR/war_mind_fe/docs/stock/stock_company_frontend_guide.md). The frontend does not yet have any company-detail route, popup, or data flow.

This change deserves a design artifact because it crosses:
- table interaction behavior inside the existing stock catalog
- a new detail-overlay pattern inside the markets feature
- a new stock-company API integration with snapshot semantics
- a beta information architecture decision: expose future company tabs visibly, but enable only `Overview`
- a UX requirement to preserve list context while users inspect company detail

Relevant current primitives already exist:
- `Dialog` and `Tabs` components in `src/components/ui/`
- `ScrollArea`, `Skeleton`, `Empty`, and `Badge` primitives already used in the stocks feature
- `apiClient` already injects auth and organization headers
- TanStack Query is already in use for stocks server state

## Goals / Non-Goals

**Goals:**
- Add a company-detail popup launched from the stock catalog without forcing route navigation away from `/stocks`
- Preserve the current stock list context behind the popup, including filters, loaded pages, and scroll position
- Render immediate stock identity context from the selected table row before the overview request completes
- Fetch and render `GET /api/v1/stocks/{symbol}/company/overview` inside a detail shell designed for future company tabs
- Show only the `Overview` tab as interactive in beta while keeping other company tabs visible and disabled
- Present overview content in a hybrid layout that balances fast scanning of structured facts with readable narrative sections
- Keep the implementation localized to the existing `stocks` feature slice so it remains easy to evolve into broader company detail later

**Non-Goals:**
- Implementing content for `shareholders`, `officers`, `subsidiaries`, `affiliate`, `events`, `news`, `reports`, `ratio-summary`, or `trading-stats`
- Adding a dedicated route such as `/stocks/:symbol` in this iteration
- Changing the backend company API contract, response envelope, or auth behavior
- Inventing business labels for unclear backend fields such as `financial_ratio_issue_share`
- Adding charting, comparison workflows, watchlists, or cross-stock navigation inside the popup
- Persisting popup state across page reloads or deep links in phase one

## Decisions

### 1. Implement company detail as a modal dialog owned by the existing stocks page

**Choice:** Keep company detail as local UI state inside the stocks feature and render it as a large `Dialog`-based popup from the stock catalog page rather than as a new route.

The page-level state should track:
- whether the company popup is open
- which `StockListItem` is selected

The popup should open from row interaction and close back into the same list state.

**Rationale:** The user explicitly wants a large popup, and the main UX value is continuity from browsing to inspection. A route transition would add router complexity, page re-entry questions, and filter/scroll restoration work for a beta flow that is intentionally scoped to a single tab.

**Alternatives considered:**
- dedicated detail route: rejected because it breaks the browse-to-inspect continuity the requested UX is aiming for
- side drawer: rejected because overview contains narrative content and needs more horizontal space than a drawer comfortably provides
- global popup state in Zustand: rejected because the behavior is confined to the stocks surface and does not need cross-feature ownership

### 2. Reuse the selected stock row as the popup's immediate header model

**Choice:** The popup should render its header from the selected `StockListItem` synchronously, then enrich only the body with overview data once the network request resolves.

The header model should come from fields already present in the stock list:
- `symbol`
- `organ_name`
- `exchange`
- `groups`
- `industry_name`
- freshness context already available in the row if needed

**Rationale:** This removes the blank-header problem during loading and gives the popup a stable identity even when the overview endpoint is slow or fails. It also preserves the semantics that the stock list is the source of the user's current selection, while the overview endpoint is an enrichment payload.

**Alternatives considered:**
- wait for the overview response before showing any header content: rejected because it makes the popup feel slower and visually unstable
- refetch catalog detail for the selected symbol: rejected because the required identity fields are already present in the selected row

### 3. Add a dedicated stock-company API adapter and query key inside the stocks feature

**Choice:** Extend the existing `stocks` feature slice with company-overview-specific types, API functions, and query keys instead of creating a new top-level feature area.

Expected direction:
- `api/stocks-api.ts` gains `getStockCompanyOverview(symbol)`
- `types/stock-company.types.ts` or equivalent holds the overview response and item types
- `query-keys.ts` gains a stable key for `companyOverview(symbol)`
- a local hook such as `use-stock-company-overview.ts` wraps TanStack Query orchestration

**Rationale:** Company overview is a direct extension of stock browsing, and the selected row type already lives in the stocks feature. Keeping the first company-detail integration inside the same slice minimizes indirection and lets future company tabs grow from the same boundary.

**Alternatives considered:**
- create a separate `stock-company` feature now: rejected because only one tab is in scope and that split would add boundaries before they are justified
- fetch directly inside the popup component without a hook/query key: rejected because the data is server state and should use the same query conventions as the rest of the app

### 4. Use a symbol-scoped query that only runs while the popup is open

**Choice:** The overview request should be keyed by normalized symbol and enabled only when:
- a selected stock exists
- the popup is open

The query should treat `symbol` as uppercase because the backend normalizes case but the frontend should keep a stable cache key.

**Rationale:** This avoids unnecessary prefetching for every row, keeps the data flow explicit, and ensures reopening the same symbol can benefit from React Query caching without changing the visible stock list behavior.

**Alternatives considered:**
- prefetch overview on row hover: rejected because it introduces speculative network traffic for a beta feature with long-form content
- fetch on row click outside React Query: rejected because it duplicates loading/error/cache handling already solved by the current data layer

### 5. Render the popup as a future-proof company shell with disabled tabs

**Choice:** The popup should include a visible tab strip for the documented company endpoint family, but only `Overview` is interactive. Non-overview tabs should be rendered as visually disabled beta placeholders and must not trigger requests.

Expected tab set:
- `Overview`
- `Shareholders`
- `Officers`
- `Subsidiaries`
- `Affiliate`
- `Events`
- `News`
- `Reports`
- `Ratio Summary`
- `Trading Stats`

**Rationale:** The product intent is already broader than overview, and exposing the future information architecture now reduces redesign churn later. At the same time, enforcing disabled behavior keeps the beta honest and prevents accidental expansion of scope.

**Alternatives considered:**
- hide future tabs entirely: rejected because it creates a throwaway shell that will need a structural redesign when more endpoints ship
- render fake placeholder content for disabled tabs: rejected because it implies unsupported capability and increases implementation surface without backend value

### 6. Use a hybrid overview layout instead of a pure KPI dashboard or pure document view

**Choice:** The `Overview` tab should use a two-column desktop layout:
- primary reading column for `Company profile` and `History`
- secondary facts column for structured items such as `charter_capital`, `issue_share`, and ICB classification

On mobile, these regions should stack into a single reading order.

The shell should remain visually aligned with the current dark-glass markets area, but the interior cards should favor readability over decorative density.

**Rationale:** The overview payload is mixed-content. It has too little numeric depth for a dashboard treatment and too much structured metadata for a pure article layout. A hybrid design matches the endpoint's actual shape and the user's stated preference for a summary-first experience.

**Alternatives considered:**
- stats-first dashboard cards only: rejected because `company_profile` and `history` are too important to demote into long collapsed footnotes
- single long-form article view: rejected because users still need quick access to market taxonomy and share/capital facts

### 7. Explicitly avoid user-facing labels for ambiguous backend fields

**Choice:** The beta UI should only surface overview fields whose business meaning is already clear from the current backend documentation. `financial_ratio_issue_share` should remain excluded until product/backend provides a reliable user-facing label.

**Rationale:** The repo's AGENTS guidance explicitly warns against speculative normalization or broad fallback assumptions around third-party/backed-integration payloads. Surfacing a vaguely named field in the UI would create a misleading contract for users and increase redesign risk.

**Alternatives considered:**
- show the raw field name in the UI: rejected because it is not product-grade language
- invent a best-guess label: rejected because the user asked not to assume unclear business meaning

### 8. Keep async states scoped to the overview content area while the shell stays mounted

**Choice:** Loading, empty, and error states belong inside the overview body area. The popup frame, header, and disabled-tab shell should remain mounted throughout.

Expected state behavior:
- loading: skeletons shaped like facts + narrative cards
- empty: overview-specific empty surface that still keeps stock identity visible
- error: inline retry state without dismissing the popup

**Rationale:** The popup is conceptually about a selected stock, not just about one request. Keeping the shell mounted prevents jarring state transitions and makes retry/close decisions straightforward.

**Alternatives considered:**
- replace the whole popup with a spinner or error surface: rejected because it drops context and makes failures feel heavier than necessary

### 9. Make the stock row interaction explicit and local to the table presentation layer

**Choice:** The stock table should expose a row activation callback from the page container into the table component. Rows should gain clear interactive affordances such as hover feedback and pointer cursor, but the underlying table model remains list-oriented.

**Rationale:** The stock page already separates orchestration from presentation. Adding a row activation callback keeps that pattern intact and lets the page own popup selection state without embedding modal logic into the table component.

**Alternatives considered:**
- attach dialog logic directly inside each row cell: rejected because it couples presentation and overlay orchestration too tightly
- use navigation links for rows even though the target is a popup: rejected because the interaction is not route-based in this phase

## Risks / Trade-offs

- **[The popup can become visually crowded once all future tabs are represented]** -> Mitigation: keep non-overview tabs compact and disabled, and use horizontal overflow behavior for narrow widths instead of wrapping into multi-line clutter
- **[Long `company_profile` or `history` text can dominate the layout]** -> Mitigation: use readable card widths, line-height tuned for dark backgrounds, and collapsed/expandable text treatment where needed
- **[A dialog launched from an infinite-scroll table can create focus and scroll edge cases]** -> Mitigation: use the existing dialog primitive for focus trapping and keep list state local so the underlying scroll area is untouched on close
- **[Users may interpret visible disabled tabs as broken functionality]** -> Mitigation: style them as intentional beta placeholders and avoid any interaction that looks partially active
- **[The overview endpoint may return many null fields for some symbols]** -> Mitigation: build section-level empty handling and do not require every card to render all fields
- **[Keeping company detail inside the stocks slice may later need extraction]** -> Mitigation: isolate company types, queries, and popup components behind their own files so promotion to a separate feature remains straightforward

## Migration Plan

1. Extend the `stocks` feature with company-overview response types, query keys, API adapter, and a query hook keyed by symbol.
2. Add page-local selection state to the stocks page and pass a row activation callback into the stock table.
3. Introduce a company-detail popup component under the stocks feature that owns the dialog shell, tab strip, and overview body states.
4. Render the popup header from the selected stock row immediately and wire the overview query to the popup lifecycle.
5. Implement the hybrid overview layout with readable narrative cards, structured facts, and metadata display for source/freshness/cache status.
6. Add loading, empty, and error handling inside the overview body while preserving the popup shell.
7. Verify keyboard close behavior, row activation, repeated open/close flows, query caching by symbol, null-field rendering, and disabled-tab non-interaction.

Rollback is low risk because the change is frontend-only and additive to the existing stocks page. Reverting the popup components, row-activation wiring, and company-overview query pieces returns the stock catalog to its current list-only behavior.

## Open Questions

- Should disabled beta tabs show a passive badge or helper text such as `Beta` / `Coming soon`, or is disabled styling alone sufficient?
- Should `company_profile` and `history` be collapsed by default when they exceed a certain length, or should the first beta render them fully?
- Is there any approved product copy for describing `cache_hit`, or should it remain a low-emphasis technical freshness hint?
- Once the next company tabs are implemented, should the popup remain modal-based or evolve into a dedicated detail route with deep-link support?
