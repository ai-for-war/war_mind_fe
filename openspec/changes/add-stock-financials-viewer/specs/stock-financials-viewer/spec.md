## ADDED Requirements

### Requirement: Financials tab lazily reads one selected financial report
The stock financials viewer SHALL read financial report data from `GET /api/v1/stocks/{symbol}/financial-reports/{report_type}` with `period` as a query parameter. The viewer SHALL request only the currently selected report type and period for the active stock symbol, and SHALL NOT call the unsupported aggregate endpoint `GET /api/v1/stocks/{symbol}/financial-reports`.

#### Scenario: User opens Financials with the default selection
- **WHEN** the user opens the `Financials` tab for a stock symbol
- **THEN** the frontend requests `GET /api/v1/stocks/{symbol}/financial-reports/income-statement?period=quarter`
- **AND** the frontend does not request `balance-sheet`, `cash-flow`, or `ratio` until the user selects those report types

#### Scenario: User switches financial report type
- **WHEN** the user selects a different financial report type in the `Financials` tab
- **THEN** the frontend requests `GET /api/v1/stocks/{symbol}/financial-reports/{selected_report_type}` for that selected report type
- **AND** the request includes the currently selected `period`

#### Scenario: User switches financial report period
- **WHEN** the user switches the financial report period between `quarter` and `year`
- **THEN** the frontend requests the currently selected report type with the newly selected `period`
- **AND** the frontend does not infer or request unsupported period values

### Requirement: Financials query identity includes organization, symbol, report type, and period
The stock financials viewer SHALL cache and refetch financial report data using a query identity scoped by active organization, normalized stock symbol, selected report type, and selected period.

#### Scenario: Same symbol uses different cache entries per report selection
- **WHEN** the user views the same symbol with different report type or period selections
- **THEN** each `symbol + report_type + period` combination has a distinct query cache entry
- **AND** switching back to a previously loaded combination can reuse the existing cached data

#### Scenario: No valid selected symbol exists
- **WHEN** the company detail dialog has no valid selected stock symbol
- **THEN** the financial report query remains disabled
- **AND** the frontend does not send a financial report request with a blank symbol

### Requirement: Financials table renders all backend periods in response order
The stock financials viewer SHALL render every period label from `response.periods` as table columns in the exact order returned by the backend. The viewer SHALL use `response.periods` as the source of truth for column order and SHALL NOT sort, slice, or limit period columns in the frontend.

#### Scenario: Backend returns many periods
- **WHEN** the financial report response contains multiple period labels
- **THEN** the financial table renders all returned period labels as columns
- **AND** the displayed column order matches `response.periods`

#### Scenario: Backend returns yearly periods
- **WHEN** the selected period is `year` and the backend returns yearly period labels
- **THEN** the financial table renders the labels from `response.periods`
- **AND** the frontend does not transform them into quarterly labels

### Requirement: Financials table renders item rows and cell values conservatively
The stock financials viewer SHALL render one table row per `response.items` entry. The first column SHALL display `item`, and period cells SHALL read values by using each period label from `response.periods` as the key into `item.values`.

#### Scenario: Row values include numbers, strings, and nulls
- **WHEN** a financial report item contains number, string, and `null` values
- **THEN** number values are rendered as readable right-aligned numeric text
- **AND** string values are rendered without numeric coercion
- **AND** `null` values are rendered as `--`

#### Scenario: An item lacks a non-null item id
- **WHEN** a financial report item has `item_id` equal to `null`
- **THEN** the row still renders using the item label and period values
- **AND** the viewer does not require `item_id` to be present or string typed

### Requirement: Financials viewer provides table controls for report, period, and row search
The stock financials viewer SHALL provide controls for selecting report type, selecting period, and filtering visible rows by the `item` label. Row search SHALL only filter rows and SHALL NOT remove, reorder, or filter period columns.

#### Scenario: User filters rows by item text
- **WHEN** the user enters text into the financials row search control
- **THEN** the table only shows rows whose `item` label matches the search text
- **AND** all period columns from the active response remain visible

#### Scenario: User clears row search
- **WHEN** the user clears the row search control
- **THEN** the table returns to showing all rows from the active financial report response

### Requirement: Financials table scrolls inside the dialog with sticky context
The stock financials viewer SHALL render its table inside an internal viewport that preserves the company detail dialog shell. The table viewport SHALL support vertical scrolling for long item lists and horizontal scrolling for many period columns. The period header row and first `Item` column SHALL remain visible as sticky context while the user scrolls within the financials table.

#### Scenario: Financial report has many rows and periods
- **WHEN** the active financial report contains enough rows and period columns to overflow the available dialog content area
- **THEN** the table scrolls inside the `Financials` panel
- **AND** the company detail dialog header and tab shell remain visible
- **AND** the financial table header and item column remain available as sticky reading context

### Requirement: Financials viewer handles loading, empty, and error states in context
The stock financials viewer SHALL keep the `Financials` tab mounted while the active financial report request is loading, empty, or failed. Loading feedback SHALL match the table layout. Empty and error feedback SHALL preserve the selected stock context and provide a retry path when retrying is meaningful.

#### Scenario: Financial report request is loading
- **WHEN** the active financial report request is pending
- **THEN** the `Financials` tab shows a table-shaped loading state
- **AND** the company detail dialog shell remains visible

#### Scenario: Financial report data is not found
- **WHEN** the active financial report request fails with a no-data `404`
- **THEN** the `Financials` tab shows an empty state for the selected report type and period
- **AND** the user can change report type or period without closing the company detail dialog

#### Scenario: Financial report request fails
- **WHEN** the active financial report request fails with an upstream or unknown error
- **THEN** the user receives toast feedback through the existing sonner pattern
- **AND** the `Financials` tab shows a persistent retry action inside the panel

### Requirement: Financials viewer avoids unsupported v1 financial interpretations
The stock financials viewer SHALL stay within the v1 financial report contract. It SHALL NOT show summary KPI cards, row hierarchy indentation, unit labels, source selection, export controls, charts, or pinned important rows unless a future backend contract or product decision provides the required metadata.

#### Scenario: Backend response lacks row hierarchy metadata
- **WHEN** the active financial report response does not include hierarchy fields such as `levels`, `row_number`, or `unit`
- **THEN** the viewer renders a flat financial statement table
- **AND** the viewer does not infer hierarchy, indentation, or units from item text

#### Scenario: Backend response uses variable item names or item ids
- **WHEN** item names or `item_id` values vary across symbols or report types
- **THEN** the viewer still renders the full table
- **AND** the viewer does not hard-code financial summary cards from speculative item mappings
