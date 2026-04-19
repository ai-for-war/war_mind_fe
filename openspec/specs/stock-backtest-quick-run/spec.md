# stock-backtest-quick-run Specification

## Purpose
TBD - created by archiving change add-stock-backtest-workspace. Update Purpose after archive.
## Requirements
### Requirement: Stock surfaces can launch a rich quick-run backtest dialog
The system SHALL provide a rich quick-run backtest dialog that can be launched from stock-related surfaces with the selected symbol prefilled from context. The dialog SHALL let users configure a supported backtest, run it in place, and inspect the returned result without leaving the originating surface.

#### Scenario: User launches quick backtest from a stock surface
- **WHEN** the user activates a quick backtest entry point from a stock surface for a selected symbol
- **THEN** the application opens the quick-run backtest dialog
- **AND** the dialog starts with the selected symbol prefilled from the launching context
- **AND** the originating stock surface remains preserved behind the overlay

### Requirement: Quick-run dialog uses the same supported template contract as the full workspace
The quick-run dialog SHALL load `GET /api/v1/backtests/templates` and SHALL use the same backend-supported template and parameter model as the full backtest workspace. The dialog SHALL NOT expose unsupported controls for compare-runs, saved presets, benchmarks, or engine fields that the backend does not accept.

#### Scenario: Dialog loads supported template choices
- **WHEN** the quick-run dialog opens
- **THEN** it requests the template catalog from `GET /api/v1/backtests/templates`
- **AND** it renders the returned supported templates as the available strategy choices
- **AND** it only renders parameter fields that belong to the currently selected template

### Requirement: Quick-run dialog renders rich backtest results in place
After a successful run, the quick-run dialog SHALL remain open and SHALL render a rich result view inside the dialog. The dialog result SHALL include summary KPIs, an equity-focused chart, and tabbed result areas for overview, performance, and trades using the returned backend payload.

#### Scenario: Dialog run succeeds
- **WHEN** the user submits a valid backtest request from the dialog and the run succeeds
- **THEN** the dialog stays open
- **AND** the dialog renders summary KPIs from the result payload
- **AND** the dialog renders a chart using `equity_curve`
- **AND** the dialog exposes result tabs for overview, performance, and trades

#### Scenario: Dialog backtest has empty trade data
- **WHEN** the dialog run succeeds and the returned `trade_log` is empty
- **THEN** the trades tab remains available
- **AND** the trades area shows a readable empty state
- **AND** the overview and performance result areas remain visible

### Requirement: Quick-run dialog can hand off to the full workspace
The quick-run dialog SHALL provide a path to open the full `/backtests` workspace for deeper analysis after a user has configured or run a quick backtest.

#### Scenario: User opens the full workspace from the dialog
- **WHEN** the user activates the dialog action to continue in the full backtest workspace
- **THEN** the application navigates to `/backtests`
- **AND** the user is taken to the dedicated stock backtest workspace for further analysis

### Requirement: Quick-run dialog preserves setup context across failures
The quick-run dialog SHALL preserve its current setup values when the template request or run request fails. Validation and request failures SHALL be surfaced inside the dialog instead of closing it or discarding the current symbol context.

#### Scenario: Dialog run fails
- **WHEN** the user submits a run request from the dialog and the request fails
- **THEN** the dialog remains open
- **AND** the current setup values stay visible
- **AND** the dialog shows an inline error or validation state that explains the failure

