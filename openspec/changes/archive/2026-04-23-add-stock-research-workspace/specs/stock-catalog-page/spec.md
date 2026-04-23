## ADDED Requirements

### Requirement: Stock catalog exposes an in-context research action
The stock catalog page SHALL expose a row-level `Research` action for each stock item without forcing the user to navigate away from the catalog route. Launching the action SHALL open the shared stock research create-report dialog with the selected symbol prefilled.

#### Scenario: User opens stock research from a catalog row
- **WHEN** the user activates the stock catalog research action for a stock row
- **THEN** the application opens the stock research create-report dialog for that row symbol
- **AND** the stock catalog remains mounted behind the dialog with its current filters, loaded rows, and scroll context preserved

#### Scenario: User queues a report from the stock catalog
- **WHEN** the user submits the stock research create-report dialog from the stock catalog
- **THEN** the frontend sends `POST /api/v1/stock-research/reports`
- **AND** the dialog closes after a successful `202 Accepted` response
- **AND** the user receives toast feedback without automatic navigation away from `/stocks`
