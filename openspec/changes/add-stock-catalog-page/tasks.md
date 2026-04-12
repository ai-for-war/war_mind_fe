## 1. Feature setup and shared foundations

- [x] 1.1 Add `@tanstack/react-table` to the frontend dependencies and ensure the project lockfile is updated
- [x] 1.2 Create the `src/features/stocks/` module structure with `api`, `components`, `hooks`, `types`, `query-keys.ts`, and `index.ts`
- [x] 1.3 Add the approved stock group constants and exchange filter options in the stocks feature so the page uses one centralized source of truth
- [x] 1.4 Add or reuse the minimal table-rendering primitive needed for stock-table markup so TanStack Table can render with the app's existing shadcn-style UI

## 2. Stock catalog data layer

- [x] 2.1 Define stock catalog request and response types that match `GET /api/v1/stocks`, including nullable item fields and paged response metadata
- [x] 2.2 Implement the stock catalog API adapter that calls `GET /api/v1/stocks` through the shared `apiClient` and only sends meaningful `q`, `exchange`, `group`, `page`, and fixed `page_size` values
- [x] 2.3 Add stable TanStack Query keys for stock catalog requests based on normalized search, exchange, and group filters
- [x] 2.4 Implement a stock catalog infinite-query hook that fetches the first page, computes next-page params, and flattens paged results into a single row list

## 3. Stock catalog page UI

- [x] 3.1 Build the protected `Stock Catalog` page container that owns filter state, query orchestration, flattened rows, and content-state branching
- [x] 3.2 Implement the stock filter bar with a text search input, exchange chip or badge controls, a group dropdown, and a reset action for active filters
- [x] 3.3 Implement the stock table with TanStack Table column definitions for symbol, company, exchange, groups, industry, source, snapshot, and updated fields
- [x] 3.4 Render safe fallbacks for nullable fields and compact group badges that handle empty arrays without breaking layout
- [x] 3.5 Add a page-level freshness summary using `snapshot_at` while still showing row-level `updated_at` values in the table

## 4. Infinite scroll and catalog states

- [x] 4.1 Wire the stock table container to the existing `useScrollAreaInfiniteScroll` hook and load the next API page when the sentinel becomes visible
- [x] 4.2 Ensure changing search, exchange, or group filters resets the visible list back to the first loaded page of results
- [x] 4.3 Implement the initial loading state, empty catalog state, filtered no-results state, and inline error state without unmounting the filter controls
- [x] 4.4 Prevent additional page requests once the accumulated loaded items reach the API `total`

## 5. App shell integration

- [x] 5.1 Add the protected `/stocks` route in `src/app/router.tsx` and render the new stocks page under `MainLayout`
- [x] 5.2 Add the `Stock Catalog` navigation item to the sidebar configuration with an appropriate icon and active-route handling for `/stocks`
- [x] 5.3 Export the stocks page from the feature barrel so router integration follows the repo's existing feature pattern

## 6. Verification

- [ ] 6.1 Verify authenticated users can open `/stocks` inside the shared shell and unauthenticated users are redirected to `/login`
- [ ] 6.2 Verify search, exchange chip selection, and group dropdown selection all refresh the catalog with the expected request parameters
- [ ] 6.3 Verify infinite scroll appends results correctly, preserves active filters, and stops loading when all available items have been fetched
- [ ] 6.4 Verify loading, empty, no-results, error, and nullable-field rendering behave correctly across the stock catalog surface
- [ ] 6.5 Run the relevant frontend verification command for the touched files and resolve any introduced type or lint issues
