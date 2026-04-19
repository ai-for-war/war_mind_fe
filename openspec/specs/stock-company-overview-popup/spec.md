## Purpose
Define the stock company detail popup launched from the stock catalog, including the beta company tab shell and the overview-specific reading experience.
## Requirements
### Requirement: Stock catalog launches a company overview popup
The system SHALL let the user open a company detail popup directly from a stock item in the existing stock catalog experience. Opening the popup SHALL preserve the current stock catalog page context, including the user's active search, filters, loaded rows, and scroll position behind the overlay.

#### Scenario: User opens company detail from a stock row
- **WHEN** the user activates a stock item from the stock catalog
- **THEN** the application opens a company detail popup for that stock symbol
- **AND** the stock catalog remains mounted behind the popup with its current filters and loaded result state preserved

#### Scenario: User closes the popup
- **WHEN** the user closes the company detail popup
- **THEN** the popup is dismissed without resetting the stock catalog search, filters, loaded pages, or scroll context

### Requirement: Company detail popup shows a beta tab shell
The popup SHALL render a company detail shell that exposes the intended multi-tab information architecture for company data. The shell SHALL include a visible `Overview` tab plus visible tabs for `Shareholders`, `Officers`, `Subsidiaries`, `Affiliate`, `Events`, `News`, `Reports`, `Ratio Summary`, and `Trading Stats`. In this beta iteration, only `Overview` SHALL be enabled and all other tabs SHALL be visibly disabled.

#### Scenario: Popup opens with overview active
- **WHEN** the company detail popup is first opened
- **THEN** the `Overview` tab is active by default
- **AND** the remaining company tabs are visible in a disabled beta state

#### Scenario: User activates a disabled beta tab
- **WHEN** the user clicks a disabled non-overview company tab
- **THEN** the active tab remains `Overview`
- **AND** the application does not trigger a request for the disabled tab's endpoint

### Requirement: Popup header uses stock identity context immediately
The popup SHALL show the selected stock identity immediately from the stock catalog row context before the overview request completes. The header SHALL surface the stock symbol and available catalog metadata such as company name, exchange, groups, and industry using null-safe fallbacks where data is missing.

#### Scenario: Popup header renders before overview payload returns
- **WHEN** the popup opens for a stock whose overview request is still pending
- **THEN** the popup header already shows the selected stock symbol
- **AND** the popup shows any available company name, exchange, groups, and industry context from the stock catalog row without waiting for the overview response

#### Scenario: Stock identity fields are partially missing
- **WHEN** the selected stock row has missing company, exchange, group, or industry values
- **THEN** the popup header still renders a stable layout
- **AND** missing values are represented with a readable fallback instead of breaking the shell

### Requirement: Overview tab reads the company overview snapshot endpoint
The `Overview` tab SHALL read company data from `GET /api/v1/stocks/{symbol}/company/overview` and SHALL treat the response as a snapshot payload rather than an aggregate company profile across all tabs. The popup SHALL use the response metadata to surface source and freshness context, including `source`, `fetched_at`, and `cache_hit`, without changing business behavior based on `cache_hit`.

#### Scenario: Overview request succeeds
- **WHEN** the user opens the popup for a valid stock symbol and the overview request succeeds
- **THEN** the frontend requests `GET /api/v1/stocks/{symbol}/company/overview`
- **AND** the `Overview` tab renders data from the response `item`
- **AND** the popup shows source and freshness metadata derived from `source` and `fetched_at`

#### Scenario: Overview response is served from cache
- **WHEN** the overview response includes `cache_hit=true`
- **THEN** the popup may display that cached status as metadata
- **AND** the UI does not switch to a different layout or behavior solely because the response came from cache

### Requirement: Overview tab presents a hybrid summary layout
The `Overview` tab SHALL present company information in a hybrid summary layout optimized for both scanning and reading. The overview content SHALL include:
- a key facts region for approved structured fields from the overview payload, including `charter_capital`, `issue_share`, and ICB classification levels `icb_name2`, `icb_name3`, and `icb_name4`
- a narrative `Company profile` section sourced from `company_profile`
- a narrative `History` section sourced from `history`

The beta overview UI SHALL NOT require display of unlabeled or business-ambiguous fields.

#### Scenario: Overview renders structured facts and narratives
- **WHEN** the overview response includes both structured and narrative data
- **THEN** the `Overview` tab shows a dedicated key facts region for structured company facts
- **AND** the tab shows separate narrative sections for `Company profile` and `History`

#### Scenario: Some overview fields are null or empty
- **WHEN** any of `charter_capital`, `issue_share`, `icb_name2`, `icb_name3`, `icb_name4`, `company_profile`, or `history` are `null` or blank
- **THEN** the `Overview` tab keeps the layout stable
- **AND** missing data is either hidden or replaced with a readable empty-state fallback inside the affected section

### Requirement: Overview tab handles loading, empty, and error states inside the popup
The popup SHALL handle asynchronous overview states without collapsing the surrounding company detail shell. Loading, empty, and error feedback SHALL appear inside the overview content area while the popup header and beta tab shell remain visible.

#### Scenario: Overview is loading
- **WHEN** the overview request is pending
- **THEN** the popup remains open with its header and tabs visible
- **AND** the overview content area shows a loading state that reflects the intended layout

#### Scenario: Overview returns no usable content
- **WHEN** the overview request succeeds but the returned overview fields are effectively empty for beta presentation
- **THEN** the popup keeps the `Overview` tab active
- **AND** the content area shows an overview-specific empty state instead of a blank panel

#### Scenario: Overview request fails
- **WHEN** the overview request fails
- **THEN** the popup keeps the company detail shell visible
- **AND** the overview content area shows an error state with a retry path
- **AND** the selected stock identity remains visible in the popup header

### Requirement: Company popup can launch a quick backtest dialog
The stock company overview popup SHALL expose a quick backtest entry point using the currently selected stock symbol. Launching the quick action SHALL open the rich quick-run backtest dialog without dismissing the company popup shell behind it.

#### Scenario: User launches quick backtest from the company popup
- **WHEN** the user activates the company popup backtest quick action
- **THEN** the application opens the rich quick-run backtest dialog with the popup's current stock symbol prefilled
- **AND** the company popup remains preserved behind the quick-run dialog

#### Scenario: User closes the quick backtest dialog from the company popup flow
- **WHEN** the user closes the quick-run dialog that was launched from the company popup
- **THEN** the dialog is dismissed
- **AND** the company popup remains open on the previously active company context

### Requirement: Company detail popup can save the active symbol to a watchlist
The stock company detail popup SHALL provide an `Add to watchlist` action for the currently selected stock symbol while keeping the popup open. The action SHALL use the watchlist API to add the popup symbol to one selected watchlist.

#### Scenario: User adds the popup symbol to a watchlist
- **WHEN** the user activates the popup-level add-to-watchlist action and chooses a watchlist
- **THEN** the frontend sends `POST /api/v1/stocks/watchlists/{watchlist_id}/items` for the selected popup symbol
- **AND** the popup remains open after the mutation attempt completes

#### Scenario: Duplicate symbol is rejected from the popup action
- **WHEN** the popup-level add-to-watchlist request returns `409 Conflict`
- **THEN** the company detail popup remains visible with its current tab state preserved
- **AND** the user receives duplicate feedback for the selected watchlist

