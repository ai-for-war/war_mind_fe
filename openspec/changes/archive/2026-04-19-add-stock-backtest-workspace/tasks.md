## 1. Feature setup and shared foundations

- [ ] 1.1 Add the shadcn MCP components needed for the backtest workflow, including `@shadcn/chart`, `@shadcn/field`, `@shadcn/form`, and any required companion primitives
- [ ] 1.2 Create the `src/features/backtests/` module structure with `api`, `components`, `hooks`, `types`, `query-keys.ts`, and nearby `*.utils.ts` helpers
- [ ] 1.3 Define shared backtest types that match the documented template-catalog and run-response contracts without adding unsupported fields
- [ ] 1.4 Add shared formatters and mapper utilities for metrics, assumptions, chart series, trade rows, and backend error parsing

## 2. Backtest data layer and validation

- [ ] 2.1 Implement the template-catalog API adapter for `GET /api/v1/backtests/templates`
- [ ] 2.2 Implement the run API adapter for `POST /api/v1/backtests/run` with payload shaping that only sends supported request fields
- [ ] 2.3 Add stable TanStack Query keys and hooks for template loading and backtest execution
- [ ] 2.4 Implement setup validation for documented request rules, including date ordering and template-specific cross-field constraints

## 3. Backtest workspace page

- [ ] 3.1 Build the protected `/backtests` page container that loads templates, owns setup state, and coordinates run execution
- [ ] 3.2 Implement the template-driven setup form with symbol input, date range, initial capital, template selection, dynamic parameter fields, and assumptions preview
- [ ] 3.3 Implement the workspace result surface with summary cards, performance metrics, equity-focused chart, trade-log table, and assumptions card
- [ ] 3.4 Implement workspace loading, empty, validation, access-error, and retryable failure states without resetting the current setup form

## 4. Quick-run dialog and stock-surface integration

- [ ] 4.1 Build the shared rich quick-run backtest dialog that accepts a prefilled symbol context and reuses the supported template/run contract
- [ ] 4.2 Implement dialog result tabs for overview, performance, and trades with an in-place chart and KPI summary
- [ ] 4.3 Add a stock-catalog quick backtest trigger that launches the dialog without losing catalog filters, loaded rows, or scroll context
- [ ] 4.4 Add a company-popup quick backtest trigger that launches the dialog while preserving the existing company popup context behind it
- [ ] 4.5 Add the dialog handoff action that opens the full `/backtests` workspace for deeper analysis

## 5. App shell integration

- [ ] 5.1 Register the protected `/backtests` route in `src/app/router.tsx` and export the backtest workspace from the feature barrel
- [ ] 5.2 Add the `Backtest` destination to the markets section of the sidebar with correct active-route handling
- [ ] 5.3 Ensure quick-run dialog hosting works cleanly from both the stock catalog page and the company overview popup surface

## 6. Verification

- [ ] 6.1 Verify `/backtests` is accessible only to authenticated users and redirects unauthenticated users to `/login`
- [ ] 6.2 Verify template loading, template switching, default/min handling, and documented local validation rules against the backend contract
- [ ] 6.3 Verify successful runs render summary metrics, performance metrics, chart data, trade log states, and assumptions on both page and dialog surfaces
- [ ] 6.4 Verify `400`, `403`, `422`, and `502` responses preserve setup context and present actionable inline feedback
- [ ] 6.5 Run the relevant frontend verification command for the touched files and resolve any introduced lint or type issues
