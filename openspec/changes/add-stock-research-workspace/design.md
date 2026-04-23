## Context

The frontend already has a protected markets area with a stock catalog page, a watchlists page, and a backtest workspace. The backend now exposes a stock research report contract under `/api/v1/stock-research/reports`, including a runtime catalog endpoint, an asynchronous create endpoint that returns `202 Accepted`, a list endpoint, and a get-by-id endpoint for persisted report content and sources.

The UX direction has been clarified in discussion:
- report creation must stay lightweight and in-context from the stock catalog and watchlists
- successful creation shows a toast and does not auto-navigate
- report review belongs on a dedicated route, not inside a fake chat or streaming agent surface
- report content should render as markdown close to the backend output
- runtime controls must be visible to the user, but leaving them untouched should keep backend defaults
- the page must rely on manual refresh instead of polling or live notifications in v1

This change crosses multiple frontend surfaces:
- router and sidebar navigation
- stock catalog row actions
- stock watchlists page actions
- a new stock research feature area with API, hooks, page UI, and shared dialog components

## Goals / Non-Goals

**Goals:**
- Add a dedicated protected stock research workspace route under the markets area.
- Let users queue a report from stock catalog context, watchlist context, or the research page itself without leaving the current surface at submit time.
- Keep the report review experience aligned with the backend snapshot model: list history, select a report, refresh manually, and read markdown content plus sources.
- Keep runtime configuration catalog-driven and optional so the request can omit `runtime_config` when the user wants server defaults.
- Reuse existing shadcn primitives and the repo's existing markdown rendering dependency instead of adding new UI packages.

**Non-Goals:**
- Chat-style report creation or follow-up questioning.
- Automatic polling, server push, notifications, or optimistic progress estimation.
- Parsing markdown into custom thesis/risk/catalyst cards in v1.
- Side-by-side report comparison, version diffing, or bulk actions on report history.
- Hardcoded provider, model, or reasoning lists outside the runtime catalog response.

## Decisions

### Decision: Introduce a dedicated `stock-research` feature area and route
The implementation will add a new feature area, route, and page instead of folding research into the stock catalog or watchlists pages.

Why:
- The report lifecycle, data dependencies, and empty/error states are distinct from both catalog browsing and watchlist management.
- A dedicated route keeps the review surface stable for long markdown content and source lists.
- This matches the existing feature-first repo structure used by stocks, watchlists, and backtests.

Alternatives considered:
- Add a `Research` tab inside the stock catalog page.
  Rejected because report history and markdown reading are a separate workflow, not a lightweight table subview.
- Add report review inside watchlists.
  Rejected because report history is user-and-organization scoped, not tied to one watchlist.

### Decision: Use `/stocks/research` as the protected workspace route
The research workspace will live under the markets path family at `/stocks/research`.

Why:
- It keeps the route adjacent to `/stocks` and `/stocks/watchlists`, which is where the creation entry points already live.
- It fits the current sidebar grouping under `Markets` without inventing a new top-level product area.

Alternatives considered:
- Use `/research` as a top-level route.
  Rejected because the feature is still part of the markets domain in this product.

### Decision: Use a shared create-report dialog with optional runtime override
The stock catalog page, the watchlists page, and the research page header will all open the same create-report dialog component. The dialog will always show `symbol`, `provider`, `model`, and `reasoning`, but the submit payload will omit `runtime_config` unless the user explicitly chooses an override.

Why:
- The backend contract already distinguishes between minimal `{ symbol }` requests and explicit runtime overrides.
- Reusing one dialog keeps validation, catalog loading, and toast behavior consistent across entry points.
- Showing runtime controls satisfies the product direction without forcing a verbose form when defaults are acceptable.

Alternatives considered:
- Hide runtime controls behind an advanced expander.
  Rejected because the user explicitly wants those controls visible.
- Always submit the catalog defaults as `runtime_config`.
  Rejected because it would erase the meaningful distinction between "use server defaults" and "override runtime".

### Decision: Keep report review snapshot-based with explicit refresh
The research page will fetch report history and load one selected report on demand. It will provide a refresh action to refetch the history list and the currently selected report detail, but it will not poll in the background.

Why:
- The agreed UX is manual refresh only.
- The backend create flow is asynchronous but not exposed as a streaming or push-based runtime.
- Avoiding polling prevents the UI from implying real-time execution semantics the product does not currently support.

Alternatives considered:
- Auto-poll selected reports while status is `queued` or `running`.
  Rejected because the user explicitly ruled this out for v1.

### Decision: Render report content with the existing markdown renderer
The report detail view will reuse the existing `streamdown` markdown renderer already present in the codebase, with stock research-specific wrappers for report typography and source linking.

Why:
- The dependency is already installed and used in the app.
- The user wants markdown rendered close to the backend output rather than transformed into bespoke cards.
- Reuse reduces implementation risk and keeps markdown support consistent.

Alternatives considered:
- Add a separate markdown rendering package.
  Rejected because the repo already has a renderer and this scope does not need a second pipeline.
- Convert markdown headings into custom dashboard sections.
  Rejected because that changes the content contract and adds parsing assumptions not requested.

### Decision: Structure the desktop page as a two-pane workspace with internal scrolling
The research page will use the same desktop shell discipline as other market workspaces: a left history rail and a right detail panel, both preserving `min-h-0`, internal scrolling, and route-level height constraints inside `MainLayout`.

Why:
- The page needs both history scanning and long-form reading.
- The repo already has stable internal-scroll patterns for stocks, watchlists, and backtests.
- A two-pane layout stays cleaner than a three-pane cockpit because report creation happens in a dialog.

Alternatives considered:
- Add a third persistent runtime/config column.
  Rejected because the create form does not need to stay mounted while reading reports.
- Use a single-column stacked desktop page.
  Rejected because it slows report switching and wastes horizontal space.

## Risks / Trade-offs

- [Users expect live progress after queueing a report] -> Use explicit status badges, queued/running copy, and refresh actions instead of synthetic progress bars.
- [Runtime catalog may be empty or partially unavailable] -> Keep the create dialog resilient with loading, empty, and request-failure states; disable submit when required runtime choices cannot be resolved for an override path.
- [Selected report detail becomes stale relative to the history list] -> Refresh both the list and the selected detail together when the user triggers refresh.
- [Long markdown reports overflow the route] -> Keep the workspace inside the existing viewport-constrained shell and use `ScrollArea` in the detail panel.
- [The same create dialog is launched from multiple features] -> Keep the dialog in the stock research feature area with context-driven props so catalog and watchlists do not fork behavior.

## Migration Plan

1. Add the new stock research feature area with types, API client, hooks, and the shared create-report dialog.
2. Add the protected `/stocks/research` route and the `Stock Research` sidebar destination.
3. Add research entry points to the stock catalog page and the watchlists page.
4. Ship the research workspace and entry points together so queued reports can be created and then inspected in the dedicated route immediately.
5. If rollback is required, remove the route and entry points while leaving the backend contract untouched.

## Open Questions

- None for proposal readiness. The v1 scope excludes polling, notifications, and custom markdown restructuring, which removes the main ambiguity from the frontend design.
