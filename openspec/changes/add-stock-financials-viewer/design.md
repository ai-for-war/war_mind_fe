## Context

The stock company detail dialog already exists in `src/features/stocks/components/stock-company-overview-dialog.tsx` as a large modal shell with a header, horizontal tabs, and per-tab panels. Several company data panels already follow the same local pattern: typed response models under `src/features/stocks/types`, API methods in `stocks-api.ts`, query keys in `query-keys.ts`, TanStack Query hooks under `hooks/`, and presentational panels under `components/`.

The backend financial report contract is documented in `docs/stock/financial_report.md`. It exposes only one supported endpoint shape:

```text
GET /api/v1/stocks/{symbol}/financial-reports/{report_type}?period={period}
```

There is no aggregate endpoint in v1. Each request returns one report table with `source = "KBS"`, a backend-ordered `periods` array, and `items` whose `values` map may contain `number`, `string`, or `null`. The contract explicitly does not provide `limit`, `source`, `display_mode`, row hierarchy metadata, units, stable item lists, or guaranteed `item_id` values.

The shadcn research step found that this project already has the required primitives installed: `Table`, `ToggleGroup`, `InputGroup`, `Badge`, `Skeleton`, `Empty`, `ScrollArea`, and `sonner`. The shadcn registry has a `data-table-demo` example, but not a reusable financial data-grid component that should be installed. The implementation should compose existing primitives and avoid adding registry example code that would need to be stripped back.

## Goals / Non-Goals

**Goals:**
- Add a full financial statement viewer inside the existing stock company detail dialog.
- Keep the experience table-first and faithful to the backend response, including all returned periods.
- Lazy-load only the active `report_type + period` combination when the `Financials` tab is active.
- Use a dense table viewport with sticky period headers, a sticky item column, horizontal scrolling, and vertical scrolling inside the dialog.
- Keep query identity scoped by organization, symbol, report type, and period.
- Use existing shadcn primitives and existing stocks feature conventions.
- Show loading, empty, error, and retry states without unmounting the surrounding dialog shell.

**Non-Goals:**
- Calling or simulating an aggregate financial report endpoint.
- Prefetching all four report types when the user opens the `Financials` tab.
- Adding summary KPI cards, charts, export, row pinning, or comparison workflows.
- Inferring row hierarchy, indentation, units, or section groups from item text.
- Hard-coding important financial line mappings such as revenue, net profit, ROE, or EPS.
- Adding new npm dependencies or new shadcn registry blocks.
- Adding frontend period limiting such as latest 4, latest 8, or all.

## Decisions

### 1. Model financial reports as a stocks feature extension

**Choice:** Add financial report types, API adapter, query keys, hook, and components under the existing `stocks` feature.

Expected shape:
- `StockFinancialReportType = "income-statement" | "balance-sheet" | "cash-flow" | "ratio"`
- `StockFinancialReportPeriod = "quarter" | "year"`
- `StockFinancialReportResponse` matching the backend envelope
- `stocksApi.getStockFinancialReport(symbol, reportType, period)`
- `stocksQueryKeys.companyFinancialReport(organizationId, symbol, reportType, period)`
- `useStockFinancialReport({ isEnabled, symbol, reportType, period })`

**Rationale:** Financial reports are part of the same selected stock context as overview, prices, ratio summary, and company report links. Keeping the work inside the stocks feature follows the current module boundary and avoids a premature top-level feature split.

**Alternatives considered:**
- A new `financial-reports` feature area: rejected because the first consumer is the stock company dialog and the data lifecycle is symbol-scoped.
- Fetching directly inside the component: rejected because this is server state and should use the same query key and auth/organization conventions as existing stock panels.

### 2. Lazy-load exactly one report table at a time

**Choice:** The `Financials` panel should fetch only the currently selected `reportType` and `period`, and only while the `Financials` tab is active with a valid symbol.

Default panel state:
- `reportType = "income-statement"`
- `period = "quarter"`

**Rationale:** Backend v1 has no aggregate endpoint, upstream calls may be slow, and not every symbol is guaranteed to have all report types or periods. Lazy-loading keeps the UI honest about the current contract and avoids unnecessary KBS calls.

**Alternatives considered:**
- Prefetch all four report types after entering `Financials`: rejected because it multiplies upstream work and creates failure states for reports the user did not request.
- Load an aggregate client-side dashboard: rejected because the backend explicitly does not support aggregate financial reports in v1.

### 3. Render all periods exactly as returned by the backend

**Choice:** The table should use `response.periods` as the only source of column order and should render every returned period.

The frontend may filter rows by `item`, but it must not:
- sort period labels
- slice period columns
- assume quarterly labels when `period = "year"`
- assume a fixed count such as 8 periods

**Rationale:** The backend contract states that `periods` is the source of truth for display order and that v1 does not expose `limit`. The user explicitly chose to show all periods.

**Alternatives considered:**
- Local `Latest 4 / Latest 8 / All` control: rejected by product decision.
- Sorting period strings in the client: rejected because it can contradict upstream ordering and period label semantics.

### 4. Use a dedicated financial table viewport instead of the generic tab scroll body

**Choice:** Keep the dialog header and top-level tabs, but give the `Financials` tab its own `min-h-0 overflow-hidden` panel layout:

```text
Financials panel
  toolbar
  status row
  table viewport
    shadcn Table scroll container
    sticky header
    sticky item column
```

The current generic tab content uses a single outer `ScrollArea` for normal panels. `Financials` should avoid relying on that outer scroll area because sticky table header and sticky first column behavior is more reliable when the table owns the scroll container. The shadcn `Table` component wraps the table in a `data-slot="table-container"` element; the implementation can style that wrapper from the financials panel so it becomes the combined horizontal and vertical scroll container.

**Rationale:** Financial statements can have many rows and many periods. A table inside a generic dialog scroll area will feel cramped and can break sticky positioning. A dedicated viewport makes the modal behave like a focused data workspace.

**Alternatives considered:**
- Put the financial table inside the existing outer `ScrollArea`: rejected because nested/outer scroll makes sticky headers fragile and makes horizontal scrolling less discoverable.
- Convert rows into cards on mobile: rejected because the product goal is complete statement reading, and a card transform destroys cross-period comparison.

### 5. Compose shadcn primitives; do not install `data-table-demo`

**Choice:** Use existing shadcn primitives:
- `ToggleGroup` for report type and period controls
- `InputGroup` for row search
- `Badge` for `KBS` source and status metadata
- `Table` for the statement grid
- `Skeleton` for table-shaped loading
- `Empty` for no data and retry states
- `sonner` toast for user-facing fetch errors

Do not add `@shadcn/data-table-demo`.

**Rationale:** The demo is payment-table example code, not a financial statements component. The current requirement does not need sorting, pagination, selection, column hiding, or row actions. A simple table mapping with local row filtering is easier to verify against the backend contract.

**Alternatives considered:**
- Install the shadcn data-table demo and adapt it: rejected because it would import unrelated behavior and create cleanup work.
- Use TanStack Table immediately: optional but not necessary for MVP; local row filtering and dynamic period columns are straightforward with plain `useMemo`.

### 6. Keep value formatting conservative

**Choice:** Format cells by runtime value type:
- `null` renders as `--`
- `number` renders with locale-aware grouping and a compact decimal policy
- `string` renders as-is

Numeric cells should be right-aligned and use a monospace number style. The item column should remain text-aligned and sticky.

**Rationale:** The response does not include units or stable row metadata. The frontend should improve readability without implying that all values are currency, percentage, or ratio values.

**Alternatives considered:**
- Format all numbers as currency: rejected because `ratio` report values and percentage-like values would be wrong.
- Format by hard-coded `item_id` mappings: rejected because `item_id` is not guaranteed and the integration guidance warns against speculative field mappings.

### 7. Treat errors by status where possible, with toast plus persistent retry state

**Choice:** The panel should branch on HTTP status when Axios exposes it:
- `404`: show report/period no-data empty state
- `502`: show upstream failure copy and retry
- auth/organization errors continue through existing API client behavior
- unknown errors show generic retry copy

The panel should also use `toast.error(...)` for user-facing request failure feedback, while keeping a persistent in-panel retry state because the failed table area needs in-context recovery.

**Rationale:** The backend contract says not to depend on exact `detail` text. The repo guidance prefers sonner toast for user-facing errors, but a table panel also needs persistent context and a retry button.

**Alternatives considered:**
- Inline error only: rejected because it would diverge from the app-level toast pattern.
- Toast only: rejected because it would leave an empty panel with no durable retry path.

## Risks / Trade-offs

- **[Sticky table behavior can regress if nested scroll containers are introduced]** -> Mitigation: make `Financials` own the table scroll container and verify long rows plus many periods in the dialog.
- **[Very wide period sets can be hard to discover on touch devices]** -> Mitigation: keep the table structure intact and add clear horizontal overflow affordance through table width, sticky item column, and a stable viewport.
- **[Financial values can be misread without units]** -> Mitigation: avoid currency/percentage assumptions and render conservative number formatting only.
- **[Some symbols may lack one or more report types or periods]** -> Mitigation: lazy-load per selection and show report-specific empty states.
- **[The existing `Reports` label can confuse users after adding financial reports]** -> Mitigation: rename it to `Company Reports` in the tab shell.
- **[OpenSpec current stock company popup spec is behind the implemented tab state]** -> Mitigation: this change updates the tab shell requirement only for the labels and financials entry point needed by this scope.

## Migration Plan

1. Add financial report types, normalizers, API method, query key, and query hook under `src/features/stocks/`.
2. Add `StockCompanyFinancialsPanel` plus nearby table/value utility functions.
3. Update the company detail tab list to include `Financials` and rename `Reports` to `Company Reports`.
4. Adjust the dialog content body so `Financials` can use an internal full-height table viewport while normal panels keep their existing scrolling behavior.
5. Verify lazy loading, report/period switching, row search, all-period rendering, sticky header/column behavior, null/string/number cells, and error/empty states.
6. Run the frontend quality checks for the touched stocks files.

Rollback is frontend-only: remove the financials tab, panel, hook, API/types/query additions, and restore the previous `Reports` label.

## Open Questions

- None for MVP. The product decisions are: full financial statement rendering, `Company Reports` rename accepted, lazy-load the selected report only, and show all returned periods.
