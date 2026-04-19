# stock-backtest-workspace Specification

## Purpose
TBD - created by archiving change add-stock-backtest-workspace. Update Purpose after archive.
## Requirements
### Requirement: Protected stock backtest workspace page
The system SHALL provide a protected stock backtest workspace page at `/backtests` inside `MainLayout`. The page SHALL load the backend-supported template catalog from `GET /api/v1/backtests/templates` and SHALL present a workspace optimized for configuring and running a single supported stock backtest.

#### Scenario: Authenticated user opens the backtest workspace
- **WHEN** an authenticated user navigates to `/backtests`
- **THEN** the application renders the stock backtest workspace inside `MainLayout`
- **AND** the page requests `GET /api/v1/backtests/templates`
- **AND** the page shows a setup area for symbol, date range, initial capital, template selection, and template-specific parameters

### Requirement: Template-driven setup form
The workspace SHALL derive its strategy template picker and parameter form from the backend template catalog instead of an invented frontend-only template list. The setup form SHALL support `symbol`, `date_from`, `date_to`, `template_id`, optional `template_params`, and optional `initial_capital`, and SHALL NOT send unsupported engine fields such as `timeframe`, `direction`, `position_sizing`, or `execution_model`.

#### Scenario: User selects a template with no parameters
- **WHEN** the user selects a template whose `parameters` array is empty
- **THEN** the workspace keeps the selected template active
- **AND** the parameter section shows a stable no-configuration-needed state
- **AND** the run request omits unsupported extra fields

#### Scenario: User selects a template with parameters
- **WHEN** the user selects a template whose catalog entry includes parameter metadata
- **THEN** the workspace renders parameter inputs from the returned metadata
- **AND** the inputs use backend-provided `default`, `min`, `required`, and `description` values where available
- **AND** switching templates resets template-parameter shape to match the newly selected backend-supported template

### Requirement: Workspace validates documented request rules
The workspace SHALL validate the documented request rules before submit and SHALL also surface backend validation failures without discarding user input. The documented rules include `date_to >= date_from`, `fast_window < slow_window`, `tenkan_window < kijun_window < senkou_b_window`, and `warmup_bars >= senkou_b_window + displacement`.

#### Scenario: User enters an invalid local rule
- **WHEN** the user configures a request that violates one of the documented local rules
- **THEN** the workspace blocks the run action
- **AND** the invalid field or form group shows a readable validation message
- **AND** the current setup values remain visible for correction

#### Scenario: Backend returns a validation error
- **WHEN** `POST /api/v1/backtests/run` returns a `422` validation response
- **THEN** the workspace keeps the current setup form mounted
- **AND** the page surfaces the returned validation message as field-level or form-level feedback
- **AND** the user can adjust values and retry without re-entering unrelated fields

### Requirement: Workspace renders layered backtest results
The workspace SHALL render the backtest result as a layered analysis surface that maps directly to backend response blocks. The page SHALL display summary metrics, performance metrics, an equity-focused chart derived from `equity_curve`, a trade-log table, and the applied engine assumptions from `assumptions`.

#### Scenario: Backtest run succeeds
- **WHEN** the user submits a valid request and `POST /api/v1/backtests/run` succeeds
- **THEN** the workspace renders summary metrics from `result.summary_metrics`
- **AND** the workspace renders performance details from `result.performance_metrics`
- **AND** the workspace renders chart data from `result.equity_curve`
- **AND** the workspace renders trade details from `result.trade_log`
- **AND** the workspace renders engine assumptions from `assumptions`

#### Scenario: Backtest returns no trades
- **WHEN** the backtest succeeds and `trade_log` is empty
- **THEN** the workspace keeps the run result visible
- **AND** the trade section shows a readable empty state instead of a broken table
- **AND** the rest of the result sections remain available

### Requirement: Workspace preserves context across loading and failure states
The workspace SHALL keep the setup form visible while templates load, while a run is in progress, and when a run fails. The page SHALL distinguish template-loading, result-loading, configuration-access failures, and retryable engine failures without resetting the current setup context.

#### Scenario: Run request is in progress
- **WHEN** the user submits a valid backtest request
- **THEN** the workspace keeps the setup values visible
- **AND** the run action reflects a pending state
- **AND** the result area shows a loading state until the response resolves

#### Scenario: Backend returns a non-validation request failure
- **WHEN** the run request fails with a documented non-`422` error such as `400`, `403`, or `502`
- **THEN** the workspace shows an inline error state that reflects the failure class
- **AND** the setup form stays mounted with the current values intact
- **AND** the user is given a clear retry path when retry is appropriate

