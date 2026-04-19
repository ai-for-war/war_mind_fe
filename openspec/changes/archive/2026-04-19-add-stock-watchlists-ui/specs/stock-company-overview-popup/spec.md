## ADDED Requirements

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
