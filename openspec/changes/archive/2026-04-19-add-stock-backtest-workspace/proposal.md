## Why

The backend now exposes a documented stock backtest contract, but the frontend has no dedicated workspace or in-context quick-run flow that lets users configure a supported strategy, run a backtest, and interpret the returned result set. This change is needed now to turn the new `/api/v1/backtests/*` endpoints into a usable product surface without inventing unsupported behavior beyond the current backend contract.

## What Changes

- Add a protected stock backtest page at `/backtests` inside the authenticated workspace shell
- Build a backtest setup flow that reads template metadata from `GET /api/v1/backtests/templates` and renders dynamic form fields based on the selected backend-supported template
- Add a result workspace that renders backend-returned summary metrics, performance metrics, equity-curve visualizations, trade-log details, and engine assumptions from `POST /api/v1/backtests/run`
- Add rich quick-run backtest dialogs from stock surfaces so users can run a backtest in place with the selected symbol prefilled and view results immediately without leaving context
- Surface loading, validation, empty, and request-failure states that preserve the current form context and reflect backend error semantics instead of speculative frontend-only rules
- Extend sidebar navigation and authenticated routing so the full backtest workspace is discoverable from the main app shell
- Add and use existing shadcn components where they fit the workflow, including charting and form-oriented primitives, instead of inventing custom replacements first

## Capabilities

### New Capabilities
- `stock-backtest-workspace`: A protected stock backtest workspace page that supports template-driven configuration, backtest execution, results interpretation, and backend-assumption visibility
- `stock-backtest-quick-run`: Rich in-context backtest dialogs that launch from stock surfaces with a prefilled symbol and render supported backtest results without navigating away

### Modified Capabilities
- `auth-routing`: Register the protected `/backtests` route under `MainLayout` so authenticated users can access the stock backtest workspace
- `sidebar-navigation`: Extend the authenticated sidebar navigation with a `Backtest` destination in the markets section
- `stock-catalog-page`: Add a quick backtest entry point from the stock catalog surface that opens the in-context backtest dialog for the selected symbol
- `stock-company-overview-popup`: Add a quick backtest entry point from the stock company popup so users can launch the rich backtest dialog with the current symbol context

## Impact

- **New feature area**: `src/features/backtests/` for page components, dialog components, API integration, hooks, types, validation, chart mappers, and supporting utilities
- **Modified stocks feature**: stock catalog rows and company popup shell gain quick backtest actions that launch the dialog with symbol context
- **Shell integration**: `src/app/router.tsx` and `src/widgets/sidebar/components/nav-main.tsx` expose the `/backtests` workspace in the authenticated app shell
- **Data integration**: frontend consumption of `GET /api/v1/backtests/templates` and `POST /api/v1/backtests/run` as documented in `docs/backtest/frontend_integration_guide.md`
- **UI dependencies**: use of existing shadcn MCP components, including `@shadcn/chart`, `@shadcn/field`, `@shadcn/form`, and related form primitives where appropriate
- **No backend contract expansion**: this proposal explicitly stays within the currently supported template catalog and single-run backtest response model
