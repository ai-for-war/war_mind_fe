## 1. Stock Company Overview Data Layer

- [x] 1.1 Add stock-company overview response and item types under the existing `stocks` feature, using the documented `overview` snapshot envelope and nullable field semantics from the backend guide
- [x] 1.2 Extend the stocks API adapter with a `getStockCompanyOverview(symbol)` function that calls `GET /api/v1/stocks/{symbol}/company/overview` with a stable uppercase symbol input
- [x] 1.3 Add a dedicated stock-company overview query key and a React Query hook that only enables the request when a selected symbol exists and the popup is open

## 2. Stock Catalog Row Activation And Popup State

- [x] 2.1 Add page-local selection and open/close state to the stocks page so the currently selected `StockListItem` can drive the company popup lifecycle
- [x] 2.2 Extend the stock table to expose a row activation callback and apply explicit interactive affordances to clickable rows without changing the existing catalog filter or infinite-scroll behavior
- [x] 2.3 Wire the stocks page and stocks table together so clicking a stock row opens the company detail popup and closing it preserves the current stock list context

## 3. Company Detail Popup Shell

- [x] 3.1 Create a company detail popup component under the stocks feature that uses the selected stock row as its immediate header model and renders inside a large dialog shell
- [x] 3.2 Implement the beta tab shell with `Overview` enabled by default and the remaining company tabs visible but disabled without triggering any non-overview requests
- [x] 3.3 Render popup header metadata from the selected stock row with null-safe fallbacks for company name, exchange, groups, and industry

## 4. Overview Tab Content And States

- [ ] 4.1 Implement the hybrid overview layout with structured facts for approved overview fields and separate narrative sections for `Company profile` and `History`
- [ ] 4.2 Surface overview metadata such as `source`, `fetched_at`, and low-emphasis cache context while intentionally excluding ambiguous fields that do not yet have approved product labels
- [ ] 4.3 Add loading, empty, and error states scoped to the overview content area so the popup shell remains mounted while overview data is pending, missing, or failed

## 5. Verification

- [ ] 5.1 Verify repeated open/close behavior preserves stock catalog filters, loaded rows, and scroll context behind the popup
- [ ] 5.2 Verify overview fetching, null-field handling, disabled-tab non-interaction, and retry behavior against the documented company overview contract
- [ ] 5.3 Run the relevant frontend quality checks for the touched stocks feature files and confirm no regressions in the existing stock catalog page behavior
