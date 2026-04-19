## Why

The stocks area currently lets users browse the catalog and open company detail, but it does not provide a dedicated workflow for saving symbols into durable research lists. The backend watchlist contract is now available, so the frontend needs a route and interaction model that exposes watchlist CRUD and add-to-watchlist actions without inventing unsupported behaviors such as search, filters, pagination, or custom ordering inside a watchlist.

## What Changes

- Add a protected `Watchlists` route under the stocks area for listing watchlists, selecting one active watchlist, and reading its items.
- Add watchlist CRUD dialogs for create, rename, and delete using the documented watchlist endpoints and error semantics.
- Add an `Add Symbol` flow on the watchlist page that submits a symbol directly to the active watchlist.
- Add `Add to watchlist` entry points from the stock catalog table and the stock company overview popup.
- Render watchlist item rows with null-safe catalog metadata and a remove action that uses the documented delete-item endpoint.
- Surface empty, loading, duplicate, not-found, and null-stock states that match the current backend contract.

## Capabilities

### New Capabilities
- `stock-watchlists-page`: Protected stock watchlist browsing and management UI backed by the stock watchlist API contract.

### Modified Capabilities
- `auth-routing`: Add a protected route for the dedicated watchlists page.
- `sidebar-navigation`: Add `Watchlists` as a second destination in the `Markets` group and reflect its active state.
- `stock-catalog-page`: Add a row-level action for saving a catalog symbol to an existing watchlist.
- `stock-company-overview-popup`: Add a popup-level action for saving the selected symbol to an existing watchlist.

## Impact

- Affected code: `src/app/router.tsx`, `src/widgets/sidebar/`, `src/features/stocks/`, shared dialog/action components, and new watchlist feature files.
- APIs: `GET/POST/PATCH/DELETE /api/v1/stocks/watchlists`, `GET/POST/DELETE /api/v1/stocks/watchlists/{watchlist_id}/items`.
- Dependencies: add the shadcn `field` component source for watchlist dialogs.
- UX scope: desktop-first watchlist route that stays within backend-supported capabilities only.
