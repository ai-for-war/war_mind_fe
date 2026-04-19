## Context

The backend now exposes a narrow backtest contract in [frontend_integration_guide.md](/C:/Project/AI_FOR_WAR/war_mind_fe/docs/backtest/frontend_integration_guide.md) with two endpoints:

- `GET /api/v1/backtests/templates`
- `POST /api/v1/backtests/run`

The contract supports a single synchronous run for one symbol and one template at a time. It returns a complete result bundle with summary metrics, performance metrics, trade log entries, equity-curve points, and engine assumptions. It does not support compare-runs, saved setups, recent-run history, benchmark overlays, or a separate strategy-library workflow.

The current frontend already provides:

- an authenticated shell through `MainLayout`
- protected route wiring in `src/app/router.tsx`
- a markets navigation group in the sidebar
- a stock catalog feature that can supply searchable symbol context
- shadcn primitives already installed for forms, comboboxes, charts, tabs, tables, resizable panels, empty states, skeletons, and `sonner`

This change benefits from a design artifact because it introduces a new analytical route, depends on two backend contracts plus an existing stock-search surface, and needs explicit UX decisions to avoid drifting into the broader backtest workspace proposal that is already in progress elsewhere.

## Goals / Non-Goals

**Goals:**
- Add a protected `/backtests` page for internal users who already understand trading and backtesting
- Implement an `Analyst Terminal` layout that keeps setup and result analysis visible in the same workspace
- Keep strategy selection inside the setup form rather than creating a separate strategy-selection screen
- Use backend-driven template metadata for strategy options and dynamic parameter fields
- Use a searchable symbol picker backed by existing stock catalog data instead of a raw text-only symbol input
- Render successful results as dense KPIs, an equity-focused chart, an overview section, and a trades tab
- Preserve the current setup while surfacing failures through `sonner` toast notifications

**Non-Goals:**
- Quick-run dialogs, stock-surface launchers, or any in-context modal workflow
- Compare-runs, saved setups, recent-run history, exports, or benchmark comparisons
- Displaying backend `assumptions` in the v1 page UI
- Building a separate route or first-step screen for browsing strategies before the main page
- Introducing unsupported request fields or speculative analytics beyond the documented backend response

## Decisions

### 1. Build a dedicated `backtests` feature slice scoped to the full page only

**Choice:** Create `src/features/backtests/` with modules for `api`, `components`, `hooks`, `types`, `query-keys`, and nearby `*.utils.ts` helpers. The slice will own the `/backtests` page and all backtest-specific presentation logic, but it will not include quick-run dialog infrastructure in this change.

**Rationale:** The user has now narrowed scope to a dedicated page, and the existing active change in the repo already covers a broader workspace-plus-dialog concept. A page-only feature slice keeps this proposal aligned to the current UX decision without inheriting outdated assumptions.

**Alternatives considered:**
- continue the existing broader backtest workspace change: rejected because that proposal includes quick-run dialogs and assumptions UI that no longer match the agreed direction
- place the page directly inside `src/features/stocks/`: rejected because the route, API contract, and analysis surface are distinct from stock browsing concerns

### 2. Use an `Analyst Terminal` split layout instead of a wizard or single-column form

**Choice:** The page will use a dense split workspace on desktop: a left configuration panel and a right result panel. The left panel remains visible while the user iterates on setup. On smaller screens, the layout stacks vertically with setup first and results second. Strategy selection stays inside the left panel rather than on a separate screen.

**Rationale:** Internal users want fast iteration, not guided onboarding. A split workspace minimizes context loss between parameter tweaks and result reading, and it matches the single-run, synchronous nature of the backend contract better than a multi-step wizard.

**Alternatives considered:**
- multi-step wizard: rejected because it slows down repeated parameter tuning and hides prior setup while reading results
- separate strategy selection screen: rejected because strategy choice is only one field in the setup flow and does not justify a detached screen
- single long column on desktop: rejected because it forces excessive scrolling between setup and results

### 3. Use searchable pickers for both symbol and strategy selection

**Choice:** The setup panel will expose:

- a searchable symbol picker backed by existing stock catalog data
- a searchable strategy combobox populated from `GET /api/v1/backtests/templates`

Below the selected strategy, the page will render a compact strategy summary card and then the dynamic parameter fields returned by the chosen template.

**Rationale:** The symbol universe and strategy list are expected to grow. Searchable pickers scale better than radio groups or plain text fields and keep the terminal layout compact.

**Alternatives considered:**
- raw text input for symbol: rejected because it increases input errors and ignores the existing stock catalog data source
- radio cards for strategy selection: rejected because they stop scaling cleanly once the strategy list grows
- hardcoded strategy options: rejected because the backend already exposes the supported catalog

### 4. Use `react-hook-form` plus narrow contract-based validation

**Choice:** The setup flow will use `react-hook-form` and `zod` with shadcn form primitives. Validation will cover only documented rules for this exact runtime path:

- `date_to >= date_from`
- `fast_window < slow_window`
- `tenkan_window < kijun_window < senkou_b_window`
- `warmup_bars >= senkou_b_window + displacement`

Backend `422` responses remain authoritative and will be mapped back into form state and toast copy without adding speculative normalization logic.

**Rationale:** This keeps UX responsive while following the repo rule to avoid broad fallback mappings or unsupported field logic. The documented rules are specific enough to justify local validation.

**Alternatives considered:**
- backend-only validation: rejected because obvious rule errors would force unnecessary round trips
- generic dynamic validation rules for all integer fields: rejected because they would go beyond the documented contract

### 5. Render a compact result surface centered on KPIs, equity behavior, and trade inspection

**Choice:** The result panel will show:

- a dense KPI strip with return, drawdown, expectancy, ending equity, and trade count
- an equity-focused chart derived from `equity_curve`
- `Overview` and `Trades` tabs
- overview content that combines summary/performance information in a concise analysis surface

The page will not render the backend `assumptions` block in v1.

**Rationale:** This is the smallest result surface that still supports serious analysis for an internal user. Hiding unsupported extras keeps the page honest and focused.

**Alternatives considered:**
- include a separate `Assumptions` tab or card: rejected because product direction explicitly removed it
- add benchmark, indicator, or compare widgets: rejected because the backend does not support those concepts
- flatten all content into one long result column: rejected because tabs keep the page dense without becoming visually noisy

### 6. Standardize non-success feedback on `sonner` toast while preserving form context

**Choice:** Request failures and validation outcomes that need user attention will be surfaced through `sonner` toasts. The form may still mark invalid fields for correction, but the page will not use persistent error banners or assumptions/error cards as primary feedback. Loading and empty states remain in-place inside the page.

**Rationale:** This matches the explicit product direction for this page and keeps the interface cleaner for power users. Toasts work well for transient failures when the user already understands the domain.

**Alternatives considered:**
- inline error banners in the result panel: rejected because the user explicitly asked to standardize on `sonner`
- reset the page after a failure: rejected because it breaks iteration flow

## Risks / Trade-offs

- **[Searchable symbol picker can add extra data-fetch complexity]** -> Mitigation: reuse existing stock catalog query patterns and keep the picker scoped to the fields needed for symbol selection
- **[Toast-only feedback may be easier to miss than inline banners]** -> Mitigation: also reflect invalid state on affected controls and preserve all current inputs so retry remains low-friction
- **[Dense terminal layout can feel cramped on smaller laptops]** -> Mitigation: use a responsive split layout with strong section hierarchy and fall back to a stacked mobile layout
- **[Template-driven forms may drift if backend metadata changes unexpectedly]** -> Mitigation: treat the template endpoint as the source of truth and avoid frontend-only assumptions beyond documented validation rules
- **[`equity_curve` can be large for long ranges]** -> Mitigation: render only the core series needed for v1 and avoid full tabular rendering of curve points

## Migration Plan

1. Create the new `src/features/backtests/` slice and shared backtest contract types.
2. Add the `/backtests` route and sidebar entry in the authenticated shell.
3. Build the setup panel with symbol search, strategy search, dynamic parameter rendering, and contract-based validation.
4. Build the result panel with KPI cards, equity chart, overview content, trades tab, and page states.
5. Wire request/validation feedback through `sonner`, verify responsive behavior, and ensure setup state survives retries.

Rollback is low risk because the change is additive and frontend-only. Removing the route, sidebar entry, and feature slice cleanly restores the previous behavior.

## Open Questions

- None at proposal time.
