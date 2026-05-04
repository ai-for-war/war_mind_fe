## Why

The stock company detail dialog already gives users company context, prices, ratio summary, and company report links, but it still lacks a full financial statement reading surface. The backend now exposes KBS financial report endpoints for each symbol, so the frontend should add a table-first financials viewer that lets users inspect all returned periods without inventing unsupported aggregates, summaries, or metadata.

## What Changes

- Add a `Financials` tab to the stock company detail dialog for full financial statement viewing.
- Rename the existing `Reports` tab to `Company Reports` so company report links are not confused with financial statement tables.
- Add lazy-loaded financial report fetching for the selected report type only:
  - `income-statement`
  - `balance-sheet`
  - `cash-flow`
  - `ratio`
- Add a period switch for `quarter` and `year`, defaulting to `quarter`.
- Render all `periods` returned by the backend in their response order, with no frontend column slicing or sorting.
- Render a dense financial table with sticky period headers, a sticky item column, row search by `item`, null-safe cells, and horizontal/vertical scrolling inside the dialog.
- Handle loading, empty, and error states inside the `Financials` tab while keeping the stock dialog shell mounted.
- Use existing shadcn/ui primitives already installed in the project (`Table`, `ToggleGroup`, `InputGroup`, `Badge`, `Skeleton`, `Empty`, `sonner`) instead of adding a new registry block or example component.

## Capabilities

### New Capabilities
- `stock-financials-viewer`: A table-first financial statement viewer inside the stock company detail dialog, backed by the KBS financial report API and scoped to full-period report reading.

### Modified Capabilities
- `stock-company-overview-popup`: Add `Financials` to the company detail tab shell and rename the existing `Reports` tab to `Company Reports`.

## Impact

- **Affected code**: `src/features/stocks/` API adapter, types, query keys, query hooks, stock company detail dialog shell, and new financials viewer components.
- **Backend integration**: consume `GET /api/v1/stocks/{symbol}/financial-reports/{report_type}?period={period}` as documented in `docs/stock/financial_report.md`.
- **State/query behavior**: financial reports are lazy-loaded only for the active `Financials` report type and period; query keys include organization, symbol, report type, and period.
- **UI dependencies**: no new dependency or shadcn component installation is expected; the project already has the required shadcn primitives and `@tanstack/react-table` if table model logic is needed.
- **Non-goals**: no aggregate endpoint usage, no hard-coded financial summary cards, no charting, no row hierarchy/indentation, no export, and no frontend period limiting in this proposal.
