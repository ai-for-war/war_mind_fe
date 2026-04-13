## Purpose
Define the protected stock catalog browsing experience, including filtering, infinite scroll, and catalog-state feedback inside the authenticated app shell.

## Requirements

### Requirement: Protected stock catalog browsing page
The system SHALL provide a protected `Stock Catalog` page that renders inside `MainLayout` and reads persisted stock catalog data from `GET /api/v1/stocks`. The page SHALL present the catalog in a data-dense table optimized for scanning `symbol`, `organ_name`, `exchange`, `groups`, `industry_name`, `source`, `snapshot_at`, and `updated_at`, with safe fallbacks for nullable fields.

#### Scenario: Authenticated user sees the stock table
- **WHEN** an authenticated user navigates to `/stocks`
- **THEN** the application renders the `Stock Catalog` page inside `MainLayout`
- **AND** the page requests the first stock catalog page from `GET /api/v1/stocks`
- **AND** the first loaded results are shown in a table with symbol, company, exchange, group, industry, source, snapshot, and updated columns

#### Scenario: Nullable catalog fields remain readable
- **WHEN** the stock API returns `null` for `organ_name`, `exchange`, or `industry_name`, or an empty `groups` array
- **THEN** the page renders a stable fallback such as `--` for missing scalar values
- **AND** the page does not break table layout or interaction for records with empty groups

### Requirement: Search and filter controls
The page SHALL provide stock catalog filters that map to the documented API contract. The page SHALL include a text search input that queries `q`, exchange filters rendered as chip or badge controls, and a group dropdown whose options include `VN30`, `VN100`, `VNAllShare`, `VNMidCap`, `VNSmallCap`, `HNX30`, `ETF`, and `CW`.

#### Scenario: User filters by search text
- **WHEN** the user enters a search value for symbol or company name
- **THEN** the page sends the trimmed value as `q`
- **AND** blank input is treated as no `q` filter
- **AND** the loaded list is refreshed from the beginning of the result set

#### Scenario: User filters by exchange chip
- **WHEN** the user activates an exchange chip such as `HOSE`, `HNX`, or `UPCOM`
- **THEN** the page refreshes the catalog using the selected `exchange` filter
- **AND** the active exchange chip is visually distinguished from inactive chips

#### Scenario: User filters by group dropdown
- **WHEN** the user selects `VN30` from the group dropdown
- **THEN** the page refreshes the catalog using `group=VN30`
- **AND** changing the selected group resets the visible result list to the first loaded page

### Requirement: Infinite-scroll loading
The page SHALL use an infinite-scroll experience instead of explicit page-number pagination controls. The frontend SHALL continue requesting subsequent API pages while additional results remain available, and SHALL append newly loaded items to the existing table without dropping the active filter state.

#### Scenario: Additional results load on scroll
- **WHEN** the user scrolls to the end of the currently loaded stock results and more results are available
- **THEN** the page requests the next API page using the current `q`, `exchange`, and `group` filters
- **AND** the newly returned items are appended below the existing rows

#### Scenario: Infinite scroll stops at the end
- **WHEN** the number of loaded items reaches the API `total`
- **THEN** the page stops requesting additional pages
- **AND** no page-number pagination control is shown

### Requirement: Catalog feedback and data freshness states
The page SHALL surface feedback states for loading, empty results, no filtered matches, and request failures. The page SHALL also display the stock snapshot freshness using API metadata from `snapshot_at` or `updated_at` when catalog rows are available.

#### Scenario: Initial loading state
- **WHEN** the first stock catalog request is still pending
- **THEN** the page shows a loading state that preserves the page structure instead of rendering an empty table

#### Scenario: No results match current filters
- **WHEN** the API returns an empty `items` array for a filtered request
- **THEN** the page shows a no-results state that keeps the current filters visible
- **AND** the page provides a clear path to reset filters

#### Scenario: Request failure preserves user context
- **WHEN** a stock catalog request fails
- **THEN** the page shows an error state inside the stock catalog surface
- **AND** the current search and filter selections remain visible so the user can retry without re-entering them

#### Scenario: Freshness metadata is visible
- **WHEN** stock catalog data is loaded successfully
- **THEN** the page displays freshness metadata derived from `snapshot_at` or `updated_at`
- **AND** the freshness indicator remains visible while the user scrolls the catalog
