## 1. Financial Report Data Layer

- [x] 1.1 Add financial report response, item, cell value, report type, and period types under the existing `stocks` feature
- [x] 1.2 Add report type and period normalization helpers that accept only the documented v1 values
- [x] 1.3 Extend the stocks API adapter with `getStockFinancialReport(symbol, reportType, period)` for `GET /api/v1/stocks/{symbol}/financial-reports/{report_type}`
- [x] 1.4 Add a financial report query key scoped by organization id, normalized symbol, report type, and period
- [x] 1.5 Add `useStockFinancialReport` that enables fetching only when the `Financials` tab is active and a valid symbol exists

## 2. Financials Table Utilities

- [x] 2.1 Add nearby utility functions for financial report labels, search normalization, row filtering, and conservative cell formatting
- [x] 2.2 Ensure `periods` drives column order directly and no utility sorts, slices, or limits period columns
- [x] 2.3 Ensure `number`, `string`, and `null` cells render according to the financial report contract without currency or percentage assumptions

## 3. Financials Panel UI

- [x] 3.1 Create `StockCompanyFinancialsPanel` under the stocks components area with local state for `reportType`, `period`, and row search
- [x] 3.2 Build the panel toolbar using existing shadcn `ToggleGroup`, `InputGroup`, `Badge`, and `Button` primitives
- [x] 3.3 Render a status row showing active source, row count, and period count from the active response
- [x] 3.4 Render the financial statement table with shadcn `Table`, all backend periods, sticky period headers, sticky `Item` column, and right-aligned numeric cells
- [x] 3.5 Give the financials table its own internal scroll viewport so long rows and many periods scroll inside the dialog
- [x] 3.6 Add table-shaped loading skeletons, no-data empty states, error empty states, retry actions, and sonner toast feedback for failed requests

## 4. Company Detail Dialog Integration

- [ ] 4.1 Add `financials` to the company detail tab type and tab list
- [ ] 4.2 Rename the existing `Reports` tab label to `Company Reports` while preserving the existing company reports panel behavior
- [ ] 4.3 Render `StockCompanyFinancialsPanel` only when the `Financials` tab is active and pass the selected stock symbol context into it
- [ ] 4.4 Adjust the dialog content layout so `Financials` can use an internal full-height viewport while the other existing panels keep their current scrolling behavior

## 5. Verification

- [ ] 5.1 Verify `Financials` defaults to `income-statement + quarter` and does not prefetch the other report types
- [ ] 5.2 Verify switching report type and period sends only the selected `report_type + period` request and uses distinct query cache entries
- [ ] 5.3 Verify all returned `periods` render in backend order with no frontend sorting, slicing, or limiting
- [ ] 5.4 Verify row search filters only rows and preserves all period columns
- [ ] 5.5 Verify sticky header, sticky item column, horizontal scrolling, and vertical scrolling with a wide/long financial table inside the dialog
- [ ] 5.6 Verify `null`, `string`, missing `item_id`, and numeric cells render safely
- [ ] 5.7 Verify loading, no-data `404`, upstream/unknown error, toast, and retry states
- [ ] 5.8 Run the relevant frontend quality checks for the touched stocks files and confirm no regressions in existing stock company tabs
