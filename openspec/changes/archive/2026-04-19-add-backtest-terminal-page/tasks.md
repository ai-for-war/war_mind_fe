## 1. Backtest feature foundations

- [x] 1.1 Create the `src/features/backtests/` slice with page, components, hooks, API, types, query keys, and nearby `*.utils.ts` files
- [x] 1.2 Define template-catalog and run-response types that match `docs/backtest/frontend_integration_guide.md` without adding unsupported fields
- [x] 1.3 Implement the template-catalog and run-request API adapters for `GET /api/v1/backtests/templates` and `POST /api/v1/backtests/run`
- [x] 1.4 Add shared formatters and mappers for KPI values, chart series, trade rows, toast-friendly error messages, and template-driven parameter metadata

## 2. Setup workspace

- [x] 2.1 Build the backtest setup form with `react-hook-form`, shadcn field primitives, and the documented local validation rules
- [x] 2.2 Implement the searchable symbol picker backed by existing stock catalog data
- [x] 2.3 Implement the searchable strategy picker using backend template catalog items and add the selected-strategy summary card
- [x] 2.4 Render dynamic template parameter fields and reset parameter shape correctly when the selected template changes

## 3. Result workspace

- [x] 3.1 Build the desktop `Analyst Terminal` layout with a persistent configuration panel and result panel, plus a stacked responsive fallback
- [x] 3.2 Implement the successful-run KPI strip and equity-focused chart from `equity_curve`
- [x] 3.3 Implement `Overview` and `Trades` tabs with summary/performance content and the trade-log table
- [x] 3.4 Add loading, empty, and no-trade result states without rendering a visible assumptions section

## 4. Routing and feedback

- [x] 4.1 Register the protected `/backtests` route in `src/app/router.tsx` and export the page from the backtests feature barrel
- [x] 4.2 Add the `Backtest` destination to the markets section of `NavMain` with correct active-route behavior
- [x] 4.3 Wire all request and validation failures to `sonner` toast notifications while preserving current setup values
- [x] 4.4 Ensure the latest successful result remains visible when a later run attempt fails

## 5. Verification

- [ ] 5.1 Verify authenticated access, unauthenticated redirect behavior, and sidebar navigation to `/backtests`
- [ ] 5.2 Verify template loading, symbol search, strategy switching, dynamic parameter rendering, and documented validation rules
- [ ] 5.3 Verify successful runs, no-trade runs, and retry behavior for `400`, `403`, `422`, and `502` responses
- [ ] 5.4 Run the relevant frontend lint and type-check commands for the touched files and resolve any introduced issues
