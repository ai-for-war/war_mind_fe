## Context

The backend now exposes a stock backtest contract in [frontend_integration_guide.md](/C:/Project/AI_FOR_WAR/war_mind_fe/docs/backtest/frontend_integration_guide.md) with two endpoints:

- `GET /api/v1/backtests/templates`
- `POST /api/v1/backtests/run`

The contract is intentionally narrow in v1. The backend supports a catalog of templates, a single synchronous run request, and a full response payload containing summary metrics, performance metrics, trade log entries, equity-curve points, and engine assumptions. It does not support compare-runs, saved strategies, async jobs, benchmark overlays, or export-specific endpoints.

The current frontend already provides:

- a protected authenticated shell through `MainLayout`
- centralized route registration in `src/app/router.tsx`
- stock discovery surfaces in `src/features/stocks/`
- company detail popup infrastructure in `stock-company-overview-popup`
- shadcn-style primitives, `react-hook-form`, `zod`, and a stocks-specific price visualization stack

This change needs a design artifact because it spans a new route feature, rich dialog workflows launched from existing stock surfaces, backend-driven dynamic forms, charting decisions, and a requirement to stay strictly within the documented backend contract without speculative product behaviors.

## Goals / Non-Goals

**Goals:**
- Add a protected backtest workspace page at `/backtests`
- Let users launch a rich quick-run backtest dialog directly from stock surfaces with the selected symbol prefilled
- Render template setup UI from backend-supported template metadata instead of a frontend-invented catalog
- Enforce documented request constraints without sending unsupported fields such as `timeframe`, `direction`, `position_sizing`, or `execution_model`
- Present results in a finance-appropriate layout that highlights KPIs, equity behavior, performance metrics, trade details, and engine assumptions
- Reuse or add shadcn components first, including chart and form primitives, before building custom replacements

**Non-Goals:**
- Adding compare-runs, saved presets, bookmarks, strategy history, exports, or benchmark overlays
- Changing backend payloads, request semantics, auth headers, or execution assumptions
- Building candlestick overlays or indicator charting for the backtest result itself
- Supporting templates or parameters that are not returned by `GET /api/v1/backtests/templates`
- Persisting backtest form state globally across sessions in this iteration

## Decisions

### 1. Build a dedicated `backtests` feature slice and share composition primitives between page and dialog

**Choice:** Create `src/features/backtests/` as a dedicated feature slice with modules for `api`, `components`, `hooks`, `types`, `query-keys`, and `*.utils.ts`. The page workspace and rich quick-run dialog will reuse the same setup, result, mapping, and validation primitives where possible.

**Rationale:** The workflow is large enough to deserve its own route feature, but the same domain model also needs to appear inside stock-context quick actions. A dedicated feature slice keeps the backtest data contract, dynamic-form logic, chart mappers, and result views together without leaking stock-specific concerns into global shared folders.

**Alternatives considered:**
- build backtest directly inside `src/features/stocks/`: rejected because the route workspace, dialog, API contract, and result interpretation form a distinct feature area
- duplicate page and dialog UI independently: rejected because it would drift validation, formatting, and result rendering quickly

### 2. Treat `GET /api/v1/backtests/templates` as the source of truth for template catalog and field metadata

**Choice:** The frontend will request the template catalog on page entry and dialog open, and will derive template picker content, parameter labels, defaults, required status, and minimum values from the returned payload. The UI will not hardcode an independent template catalog when the endpoint is available.

**Rationale:** The backend already provides the supported catalog, and the AGENTS/contract guidance explicitly says design must stay grounded in supported endpoints. Reading template metadata from the endpoint reduces drift and avoids speculative fields.

**Alternatives considered:**
- hardcode the three current templates in UI state: rejected because it duplicates a supported backend catalog endpoint
- render a generic JSON editor for template params: rejected because it weakens UX and validation clarity

### 3. Add explicit local cross-field validation only for documented runtime rules

**Choice:** The setup form will use schema validation for shared fields and add narrowly scoped cross-field validators for the currently documented runtime rules:

- `date_to >= date_from`
- `fast_window < slow_window`
- `tenkan_window < kijun_window < senkou_b_window`
- `warmup_bars >= senkou_b_window + displacement`

Any other validation outcome returned by backend `422` responses will be surfaced from the response body without inventing extra normalization or rule sets.

**Rationale:** This balances a responsive UX with the repo rule not to invent broad fallback logic. The docs explicitly define these rules for the exact templates currently supported, so local validation is justified and reduces avoidable round-trips.

**Alternatives considered:**
- rely entirely on backend validation: rejected because users would get avoidable `422` errors for obvious local rule violations
- add speculative generic comparison rules for any integer fields: rejected because that would exceed the documented contract

### 4. Use `react-hook-form` with shadcn form primitives for the setup flow

**Choice:** The setup experience will use `react-hook-form` and `zod` with shadcn MCP components, specifically `@shadcn/form`, `@shadcn/field`, `@shadcn/radio-group`, and existing input/date/select primitives. Template selection should be rendered as choice cards or radio-like cards, while dynamic numeric parameters should use field-grouped numeric inputs with helper text.

**Rationale:** The repository already uses `react-hook-form`, and the requested workflow is form-heavy with dynamic validation and error display. shadcn form primitives align with the current design system and reduce custom layout work.

**Alternatives considered:**
- plain local state for every input: rejected because validation, reset behavior, and server error mapping become harder to manage
- custom card groups without shadcn field/form primitives: rejected because the repo now explicitly prefers shadcn MCP first

### 5. Use a dedicated `/backtests` workspace plus rich in-context dialogs instead of forcing all quick actions through navigation

**Choice:** The product will expose two surfaces:

- a protected page at `/backtests` for full analysis
- a rich quick-run dialog that opens in place from stock catalog and company popup contexts

The quick dialog remains open after a successful run and renders results immediately. It also provides an `Open full workspace` path for deeper analysis.

**Rationale:** This matches the user decision and the exploration outcome: quick actions must keep the user in context, while the full workspace is still needed for data-dense analysis and larger result sets.

**Alternatives considered:**
- send every quick action to the full page: rejected by product direction because it breaks flow continuity
- make the dialog compact-only: rejected because the chosen v1 dialog scope is rich and should already include substantive result interpretation

### 6. Standardize v1 backtest charts on `@shadcn/chart` and keep `lightweight-charts` confined to market-price surfaces

**Choice:** Add `@shadcn/chart` and use it for backtest result visualizations. The page and dialog will render an equity-focused chart and optional drawdown series from `equity_curve`, while the existing stocks price/history feature can keep using `lightweight-charts`.

**Rationale:** The backtest result is a relatively standard analytical time series rather than a trading-candlestick surface. `@shadcn/chart` integrates better with the existing card/tabs system and keeps the new feature visually consistent. This also matches the user's explicit approval to add shadcn charting.

**Alternatives considered:**
- reuse `lightweight-charts` for backtests: rejected because the result visualization is simpler and does not need a second charting style in v1
- build raw chart primitives from scratch: rejected because shadcn MCP should be preferred first

### 7. Render results in a layered finance workspace that mirrors backend blocks rather than inventing synthetic analytics

**Choice:** The page and dialog will map directly to backend response blocks:

- summary cards derived from `summary_metrics` and selected `performance_metrics`
- performance detail grid from `performance_metrics`
- equity/drawdown visualization from `equity_curve`
- trade log table from `trade_log`
- assumptions card from `assumptions`

The UI may compute presentational helpers such as signed formatting, chart series mapping, or empty-state copy, but it will not fabricate unsupported analytics.

**Rationale:** The backend already returns the principal result groupings. Keeping the UI aligned with those blocks makes the contract easier to understand and avoids accidental product drift.

**Alternatives considered:**
- compute extra synthetic sections such as benchmark return or strategy-vs-market delta: rejected because the backend does not return those data points
- collapse all result data into a single generic stats panel: rejected because it would weaken interpretability

### 8. Map error handling to backend semantics and preserve form context on failure

**Choice:** The backtest surfaces will distinguish:

- `400`: organization-header/configuration issue
- `403`: access issue
- `422`: validation issue mapped to field or form-level feedback
- `502`: retryable engine/upstream failure

In all non-fatal request failures, the current form state remains mounted so the user can adjust and retry.

**Rationale:** The backend documents these semantics, and preserving form context is important for a configuration-heavy analytical workflow.

**Alternatives considered:**
- collapse all errors into a single toast-only failure state: rejected because users need actionable feedback tied to the setup form
- clear the form after each run attempt: rejected because it destroys analysis flow

## Risks / Trade-offs

- **[Template metadata from backend may not include all UX-specific labels desired by product]** -> Mitigation: use returned `display_name`, `description`, and parameter metadata directly in v1, adding only lightweight frontend copy around them
- **[Cross-field validation can drift from backend behavior over time]** -> Mitigation: constrain local validation to rules explicitly documented in the current runtime contract and keep backend `422` handling authoritative
- **[Rich dialogs can become crowded on smaller screens]** -> Mitigation: keep the dialog vertically sectionalized, collapse dense result areas into tabs, and retain the full `/backtests` page for deeper analysis
- **[`equity_curve` can be large for long date windows]** -> Mitigation: limit v1 charts to the needed series, avoid unnecessary derived datasets, and keep table rendering scoped to `trade_log` rather than full curve tabulation
- **[Adding another charting library path could fragment visuals]** -> Mitigation: standardize all new backtest charts on `@shadcn/chart` and leave `lightweight-charts` untouched for price-specific features only
- **[Quick actions from multiple stock surfaces can diverge]** -> Mitigation: centralize dialog launch props and share one dialog implementation with a single symbol-prefill contract

## Migration Plan

1. Add the shadcn chart and form primitives needed by the backtest workflow.
2. Create the `src/features/backtests/` slice with API adapters, types, validation helpers, and shared formatters/mappers.
3. Implement the `/backtests` route and sidebar entry in the authenticated shell.
4. Build the shared setup form, result cards, chart, assumptions block, and trade-log table.
5. Build the rich quick-run dialog and wire it into the stock catalog and company popup entry points.
6. Verify template loading, run execution, state transitions, backend error mapping, and responsive behavior for both page and dialog surfaces.

Rollback is low risk because the change is additive and frontend-only. Removing the `/backtests` route, the sidebar destination, the quick-action triggers, and the new feature slice cleanly reverts the app to its prior state without affecting other authenticated routes.

## Open Questions

- None at proposal time. The route is fixed to `/backtests`, and v1 quick-run scope is fixed to the rich dialog variant.
