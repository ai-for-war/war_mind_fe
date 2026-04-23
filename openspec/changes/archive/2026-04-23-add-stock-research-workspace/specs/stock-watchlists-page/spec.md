## ADDED Requirements

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
