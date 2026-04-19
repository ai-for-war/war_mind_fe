## Why

The backend now exposes a documented backtest contract, but the frontend still lacks a dedicated analytical page where internal users can configure one strategy run, inspect the returned result set, and iterate quickly without leaving the authenticated workspace. This change is needed now to turn the existing `/api/v1/backtests/*` endpoints into a usable product surface that matches the narrow v1 backend contract instead of inventing unsupported compare, history, or strategy-library flows.

## What Changes

- Add a protected `Backtest Terminal` page at `/backtests` inside the authenticated application shell
- Build a single-run backtest workspace with one configuration panel and one result panel for symbol selection, date range selection, strategy selection, dynamic template parameters, and initial capital input
- Drive the strategy picker and parameter form from `GET /api/v1/backtests/templates` instead of hardcoding a frontend-only template catalog
- Render the synchronous result from `POST /api/v1/backtests/run` as dense KPI cards, an equity-focused chart, an overview summary area, and a trade-log table
- Keep the page aligned with the current backend contract by excluding unsupported product concepts such as compare-runs, recent-run history, saved setups, benchmark overlays, and a separate strategy-selection screen
- Use toast notifications through `sonner` for request failures and validation feedback while preserving the current input state
- Extend protected routing and sidebar navigation so the page is discoverable from the markets area of the app shell

## Capabilities

### New Capabilities
- `backtest-terminal-page`: A protected analytical backtest page for one-symbol, one-strategy, one-run workflows with template-driven setup, synchronous execution, KPI/result visualization, and trade inspection

### Modified Capabilities
- `sidebar-navigation`: Extend the authenticated markets navigation with a `Backtest` destination that routes to the new terminal page
- `auth-routing`: Register the protected `/backtests` route under `MainLayout` so authenticated users can access the page from the shared shell

## Impact

- **New feature area**: `src/features/backtests/` for page components, API adapters, hooks, types, validation helpers, chart mappers, and formatting utilities
- **Modified shell integration**: `src/app/router.tsx` and `src/widgets/sidebar/components/nav-main.tsx` to expose `/backtests` in the authenticated workspace
- **Data integration**: frontend consumption of `GET /api/v1/backtests/templates` and `POST /api/v1/backtests/run` as documented in `docs/backtest/frontend_integration_guide.md`
- **UI composition**: reuse of existing shadcn primitives already installed in the repo, including form, combobox, tabs, table, chart, empty, skeleton, resizable, and `sonner`
- **No backend contract change**: this proposal stays within the current single-run backtest API and does not require new backend endpoints or payload fields
