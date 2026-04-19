## ADDED Requirements

### Requirement: Stock catalog rows can save symbols to a watchlist
The stock catalog page SHALL provide a row-level `Add to watchlist` action for each catalog item without leaving the catalog route. The action SHALL use the current stock symbol and the watchlist API to add that symbol to one selected watchlist.

#### Scenario: User adds a catalog symbol to an existing watchlist
- **WHEN** the user opens the row action for a stock catalog item and chooses a watchlist
- **THEN** the frontend sends `POST /api/v1/stocks/watchlists/{watchlist_id}/items` for that row symbol
- **AND** the action completes without navigating away from `/stocks`

#### Scenario: Duplicate symbol is rejected from the catalog action
- **WHEN** the row-level add-to-watchlist request returns `409 Conflict`
- **THEN** the stock catalog remains visible in its current state
- **AND** the user receives duplicate feedback for the selected watchlist
