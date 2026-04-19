## ADDED Requirements

### Requirement: Stock catalog exposes an in-context backtest quick action
The stock catalog page SHALL expose a quick backtest entry point for a selected stock item without forcing the user to navigate away from the catalog. Launching the quick action SHALL preserve the current stock catalog search, filters, loaded rows, and scroll context behind the overlay.

#### Scenario: User launches quick backtest from the stock catalog
- **WHEN** the user activates the stock catalog backtest quick action for a stock row
- **THEN** the application opens the rich quick-run backtest dialog for that stock symbol
- **AND** the stock catalog remains mounted behind the dialog with its current filters and loaded result state preserved

#### Scenario: User closes the quick backtest dialog
- **WHEN** the user closes the stock catalog backtest dialog
- **THEN** the dialog is dismissed without resetting the stock catalog search, filters, loaded pages, or scroll context
