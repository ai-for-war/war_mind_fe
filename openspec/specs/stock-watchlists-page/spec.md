# stock-watchlists-page Specification

## Purpose
TBD - created by archiving change add-stock-watchlists-ui. Update Purpose after archive.
## Requirements
### Requirement: Protected stock watchlists page
The system SHALL provide a protected `Watchlists` page at `/stocks/watchlists` inside `MainLayout`. The page SHALL read watchlist summaries from `GET /api/v1/stocks/watchlists` and present a desktop-first two-pane workspace with a watchlist directory and an active-watchlist content panel.

#### Scenario: Authenticated user opens the watchlists route
- **WHEN** an authenticated user navigates to `/stocks/watchlists`
- **THEN** the application renders the `Watchlists` page inside `MainLayout`
- **AND** the page requests watchlist summaries from `GET /api/v1/stocks/watchlists`

#### Scenario: First available watchlist becomes active
- **WHEN** the watchlist summary request succeeds with one or more watchlists
- **THEN** the page selects one active watchlist
- **AND** the page requests that watchlist's items from `GET /api/v1/stocks/watchlists/{watchlist_id}/items`

### Requirement: Watchlist directory reflects backend summaries
The page SHALL render the watchlist directory from the backend summary payload only. Each directory entry SHALL show the watchlist name and summary metadata derived from `updated_at`, and the active watchlist SHALL be visually distinguished from inactive watchlists.

#### Scenario: Watchlist directory shows all summaries
- **WHEN** the watchlist summary request succeeds
- **THEN** the directory lists every returned watchlist summary
- **AND** each entry uses the backend-provided `id`, `name`, and `updated_at` values without assuming extra summary fields

#### Scenario: User switches active watchlist
- **WHEN** the user selects a different watchlist from the directory
- **THEN** the selected watchlist becomes active
- **AND** the page requests items for the newly active watchlist

### Requirement: Watchlist CRUD uses dedicated dialogs
The page SHALL provide create, rename, and delete flows for watchlists using the documented watchlist endpoints. Create and rename SHALL submit a `name` field only, and delete SHALL target the selected `watchlist_id` only.

#### Scenario: User creates a watchlist
- **WHEN** the user submits a valid watchlist name from the create dialog
- **THEN** the frontend sends `POST /api/v1/stocks/watchlists`
- **AND** the newly created watchlist becomes the active watchlist after the mutation succeeds

#### Scenario: User renames a watchlist
- **WHEN** the user submits a valid replacement name for an existing watchlist
- **THEN** the frontend sends `PATCH /api/v1/stocks/watchlists/{watchlist_id}`
- **AND** the directory reflects the updated watchlist name after the mutation succeeds

#### Scenario: User deletes a watchlist
- **WHEN** the user confirms deletion of an existing watchlist
- **THEN** the frontend sends `DELETE /api/v1/stocks/watchlists/{watchlist_id}`
- **AND** the deleted watchlist is removed from the directory after the mutation succeeds

### Requirement: Active watchlist items render newest-first backend output without local filters
The active-watchlist panel SHALL render the exact items returned by `GET /api/v1/stocks/watchlists/{watchlist_id}/items` in backend order. The page SHALL NOT introduce watchlist-local search, watchlist-local filters, or watchlist pagination controls in v1.

#### Scenario: Active watchlist items are shown in a table
- **WHEN** the active watchlist item request succeeds with one or more items
- **THEN** the page shows a table with rows derived from the returned `items`
- **AND** the table preserves the backend's newest-first `saved_at desc` ordering

#### Scenario: Page avoids unsupported watchlist controls
- **WHEN** the watchlists page renders
- **THEN** the active-watchlist panel does not show search controls, filter controls, or pagination controls for watchlist items

### Requirement: Watchlist page adds symbols with direct symbol input
The active-watchlist panel SHALL provide an `Add Symbol` flow that submits a direct symbol value to the active watchlist using `POST /api/v1/stocks/watchlists/{watchlist_id}/items`. The add flow SHALL use a plain symbol input and SHALL rely on the backend for symbol normalization and validation.

#### Scenario: User adds a symbol to the active watchlist
- **WHEN** the user submits a nonblank symbol value for the active watchlist
- **THEN** the frontend sends `POST /api/v1/stocks/watchlists/{watchlist_id}/items` with `{ "symbol": "<value>" }`
- **AND** the active watchlist item list refreshes after the mutation succeeds

#### Scenario: Backend rejects a duplicate symbol
- **WHEN** the add-symbol request returns `409 Conflict`
- **THEN** the page keeps the add dialog open or shows inline feedback
- **AND** the user is informed that the symbol already exists in the selected watchlist

### Requirement: Watchlist items can be removed from the active watchlist
Each watchlist item row SHALL provide a remove action that targets the row symbol and active watchlist. Removing an item SHALL use `DELETE /api/v1/stocks/watchlists/{watchlist_id}/items/{symbol}`.

#### Scenario: User removes a symbol from a watchlist
- **WHEN** the user confirms removal of a watchlist item
- **THEN** the frontend sends `DELETE /api/v1/stocks/watchlists/{watchlist_id}/items/{symbol}`
- **AND** the removed item no longer appears in the active watchlist after the mutation succeeds

### Requirement: Watchlists page handles empty, error, and null-stock states safely
The watchlists page SHALL surface backend-aligned empty and error states without inventing unsupported fallback behavior. When a watchlist item returns `stock = null`, the page SHALL keep the row visible and present null-safe metadata fallbacks.

#### Scenario: User has no watchlists yet
- **WHEN** `GET /api/v1/stocks/watchlists` returns `items: []`
- **THEN** the page shows an empty state for the entire watchlists route
- **AND** the page provides a clear create-watchlist action

#### Scenario: Active watchlist has no items
- **WHEN** `GET /api/v1/stocks/watchlists/{watchlist_id}/items` returns an empty `items` array
- **THEN** the active-watchlist panel shows an empty-items state
- **AND** the watchlist directory remains visible

#### Scenario: Watchlist item has no active catalog metadata
- **WHEN** a watchlist item response includes `stock: null`
- **THEN** the row remains visible in the active-watchlist table
- **AND** the page renders readable fallbacks for company metadata fields while preserving the row symbol and remove action

#### Scenario: Active watchlist request fails
- **WHEN** the active-watchlist item request fails
- **THEN** the page keeps the surrounding watchlists workspace visible
- **AND** the active-watchlist panel shows a retry-oriented error state

### Requirement: Watchlists page exposes an in-context research action
The watchlists page SHALL expose a row-level `Research` action for watchlist symbols without forcing the user to leave the watchlists route. Launching the action SHALL open the shared stock research create-report dialog with the selected symbol prefilled.

#### Scenario: User opens stock research from a watchlist item
- **WHEN** the user activates the research action for a watchlist item row
- **THEN** the application opens the stock research create-report dialog for that row symbol
- **AND** the watchlists workspace remains mounted behind the dialog with the active watchlist selection preserved

#### Scenario: User queues a report from the watchlists page
- **WHEN** the user submits the stock research create-report dialog from the watchlists page
- **THEN** the frontend sends `POST /api/v1/stock-research/reports`
- **AND** the dialog closes after a successful `202 Accepted` response
- **AND** the user receives toast feedback without automatic navigation away from `/stocks/watchlists`

