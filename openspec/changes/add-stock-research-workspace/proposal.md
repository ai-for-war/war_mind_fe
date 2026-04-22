## Why

The markets area now has a backend contract for stock research reports, but the frontend does not expose a coherent workflow for creating a report, revisiting queued or completed reports, or reading persisted markdown content with citations. This change is needed now because the product direction has been clarified: report creation should stay lightweight and in-context from stocks and watchlists, while report review should live in a dedicated research workspace instead of pretending to be a real-time chat or streaming agent surface.

## What Changes

- Add a protected `Stock Research` workspace route for browsing report history, selecting one report, refreshing the current snapshot, and reading persisted markdown report content plus sources.
- Add a create-report modal that can be launched from the stock catalog page and the watchlists page, with symbol-prefill from the current row or active context.
- Use the stock research catalog endpoint to populate provider, model, and reasoning controls instead of hardcoding runtime options.
- Keep create-report feedback asynchronous but non-realtime: submitting a report queues it, closes the modal, and shows a toast without automatic navigation or polling.
- Surface report states and failures exactly from the backend contract, including `queued`, `running`, `completed`, `failed`, and schema-level `partial`.
- Add a `Stock Research` destination to the Markets navigation group.

## Capabilities

### New Capabilities
- `stock-research-page`: Dedicated stock research report workspace for listing reports, refreshing report snapshots, and reading markdown report details with sources.

### Modified Capabilities
- `auth-routing`: Add a protected route for the dedicated stock research workspace.
- `sidebar-navigation`: Add `Stock Research` to the `Markets` group and reflect its active state.
- `stock-catalog-page`: Add an in-context `Research` action that opens the stock research create-report modal for the selected symbol.
- `stock-watchlists-page`: Add an in-context `Research` action that opens the stock research create-report modal from the active watchlist context.

## Impact

- Affected code: `src/app/router.tsx`, `src/widgets/sidebar/`, `src/features/stocks/`, `src/features/stock-watchlists/`, and a new stock research feature area with API, hooks, types, and UI components.
- APIs: `GET /api/v1/stock-research/reports/catalog`, `POST /api/v1/stock-research/reports`, `GET /api/v1/stock-research/reports`, and `GET /api/v1/stock-research/reports/{report_id}`.
- Dependencies: use existing shadcn primitives already present in the repo (`dialog`, `field`, `select`, `scroll-area`, `tabs`, `empty`, `alert`, `badge`, `skeleton`, optional `resizable`) with no additional UI package required for this scope.
- UX scope: desktop-first research workspace with manual refresh and markdown-first report reading, without chat simulation, automatic polling, streaming progress, or notifications.
