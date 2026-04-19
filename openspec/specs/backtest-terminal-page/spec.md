# backtest-terminal-page Specification

## Purpose
TBD - created by archiving change add-backtest-terminal-page. Update Purpose after archive.
## Requirements
### Requirement: Protected backtest terminal page
The system SHALL provide a protected analytical page at `/backtests` inside `MainLayout` for one-symbol, one-strategy, one-run backtest workflows. The page SHALL use an `Analyst Terminal` layout with a configuration workspace and a result workspace visible within the same route.

#### Scenario: Authenticated user opens the terminal page
- **WHEN** an authenticated user navigates to `/backtests`
- **THEN** the application renders the backtest terminal inside `MainLayout`
- **AND** the page shows a setup workspace and a result workspace on the same route

#### Scenario: Mobile viewport opens the terminal page
- **WHEN** an authenticated user opens `/backtests` on a narrow viewport
- **THEN** the page preserves the same setup and result sections
- **AND** the layout stacks those sections vertically instead of requiring a separate route or screen

### Requirement: Setup workflow stays inside the page and uses searchable pickers
The terminal page SHALL keep strategy selection inside the setup workflow instead of using a separate strategy-selection screen. The setup workspace SHALL provide a searchable symbol picker backed by existing stock catalog data, a searchable strategy picker driven by `GET /api/v1/backtests/templates`, date range controls, optional initial capital input, and dynamic parameter fields for the selected template.

#### Scenario: User selects a symbol from search
- **WHEN** the user searches for a stock symbol in the setup workspace
- **THEN** the page presents matching stock choices from the available stock catalog data source
- **AND** selecting a result fills the symbol field without requiring manual symbol re-entry

#### Scenario: User selects a strategy
- **WHEN** the user opens the strategy picker
- **THEN** the page requests or reuses the template catalog from `GET /api/v1/backtests/templates`
- **AND** the available strategy choices come from the returned backend template items
- **AND** the page does not navigate to a separate strategy-selection screen

#### Scenario: User switches templates
- **WHEN** the user changes the selected template
- **THEN** the page updates the parameter section to match the newly selected template metadata
- **AND** the page shows a compact summary of the selected strategy
- **AND** unsupported request fields remain absent from the eventual run payload

### Requirement: Backtest requests follow the documented contract and validation rules
The terminal page SHALL submit `POST /api/v1/backtests/run` using only the documented request fields: `symbol`, `date_from`, `date_to`, `template_id`, `template_params`, and optional `initial_capital`. The page SHALL enforce the documented local validation rules before submit and SHALL preserve the current setup when backend validation fails.

#### Scenario: User enters a locally invalid setup
- **WHEN** the user configures a request that violates a documented rule such as invalid date ordering or invalid template parameter ordering
- **THEN** the page blocks submission
- **AND** the affected controls are marked invalid
- **AND** the current setup values remain visible for correction

#### Scenario: Backend rejects the submitted setup
- **WHEN** `POST /api/v1/backtests/run` returns a `422` validation response
- **THEN** the page keeps the existing setup values mounted
- **AND** the page surfaces the failure through `sonner` toast feedback
- **AND** the user can correct the setup and retry without rebuilding the form

### Requirement: Terminal page renders dense results for successful runs
After a successful run, the terminal page SHALL render a dense analysis surface built from the returned result payload. The result workspace SHALL include KPI cards, an equity-focused chart derived from `equity_curve`, an `Overview` tab for summary and performance interpretation, and a `Trades` tab for the returned trade log.

#### Scenario: Successful run renders overview results
- **WHEN** the user submits a valid request and the run succeeds
- **THEN** the result workspace renders KPI cards derived from the backend result
- **AND** the result workspace renders an equity-focused chart using `equity_curve`
- **AND** the `Overview` tab presents summary and performance information from the successful run

#### Scenario: Successful run renders trade details
- **WHEN** the user switches to the `Trades` tab after a successful run
- **THEN** the page renders the returned `trade_log` as a trade inspection table
- **AND** the table remains consistent with the currently displayed run result

#### Scenario: Successful run has no trades
- **WHEN** the run succeeds and the returned `trade_log` is empty
- **THEN** the `Trades` tab remains available
- **AND** the trade area shows a readable empty state instead of a broken table

### Requirement: Terminal page omits assumptions and uses toast-driven failure feedback
The terminal page SHALL omit the backend `assumptions` block from the v1 result UI. Request failures such as `400`, `403`, and `502` SHALL be surfaced through `sonner` toast feedback while preserving the current setup and the most recent successful result, if one exists.

#### Scenario: Run fails after a prior successful result
- **WHEN** the user has an existing successful result on screen and a subsequent run fails
- **THEN** the page keeps the current setup values
- **AND** the page shows the new failure through a `sonner` toast
- **AND** the most recent successful result remains available until a new run succeeds

#### Scenario: Backend returns assumptions in the response
- **WHEN** a successful run response includes the backend `assumptions` block
- **THEN** the page uses only the supported result fields for the v1 UI
- **AND** the page does not render a visible assumptions section or tab

