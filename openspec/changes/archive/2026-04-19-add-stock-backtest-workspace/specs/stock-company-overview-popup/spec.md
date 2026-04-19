## ADDED Requirements

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
