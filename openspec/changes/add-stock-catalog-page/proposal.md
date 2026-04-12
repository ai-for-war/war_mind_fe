## Why

The frontend already has an authenticated workspace shell and a backend stock catalog endpoint, but users do not have a dedicated page to browse and refine that dataset inside the application. This change is needed now to turn the documented stock catalog API into a usable discovery surface with fintech-oriented interaction patterns that fit the existing app shell.

## What Changes

- Add a protected `Stock Catalog` page that lists persisted stock symbols from `GET /api/v1/stocks` inside the shared authenticated workspace
- Present the catalog in a data-dense table optimized for scanning symbol, company, exchange, group, industry, source, and freshness metadata
- Add frontend filtering for search-by-text, exchange selection via chip/badge controls, and group selection via dropdown
- Replace page-number pagination UI with infinite scrolling that progressively loads additional catalog pages as the user reaches the end of the list
- Surface loading, empty, no-results, and error states that preserve the current filter context
- Add a sidebar navigation entry and protected route so the stock catalog is discoverable from the main application shell

## Capabilities

### New Capabilities
- `stock-catalog-page`: A protected stock catalog browsing page with search, exchange and group filters, infinite-scroll loading, and data states for loading, empty, no-results, and request failure

### Modified Capabilities
- `sidebar-navigation`: Extend the authenticated sidebar navigation structure with a `Stock Catalog` destination that routes to the new stock list page
- `auth-routing`: Register the protected stock catalog route under `MainLayout` so authenticated users can access the page from the shared app shell

## Impact

- **New feature area**: `src/features/stocks/` for page components, filters, table presentation, API integration, hooks, query keys, and supporting types
- **Modified shell integration**: `src/app/router.tsx` and `src/widgets/sidebar/components/nav-main.tsx` to expose the page in the authenticated app shell
- **Data integration**: frontend consumption of the existing `GET /api/v1/stocks` contract documented in `docs/stock/frontend_integration_guide.md`, including `q`, `exchange`, `group`, `page`, and `page_size`
- **UI dependencies**: adoption of `@tanstack/react-table` as the table-state engine while keeping rendering aligned with the existing shadcn-style component system
- **Interaction change**: the page will aggregate paged API responses into an infinite-scroll experience instead of exposing explicit page navigation controls
- **No backend contract change required**: this proposal assumes the current stock catalog API and auth headers remain unchanged
