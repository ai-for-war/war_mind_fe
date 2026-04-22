## 1. Stock research data layer

- [x] 1.1 Add stock research types that mirror the backend catalog, list, create, detail, source, and failure response contracts, including nullable `content`, `error`, `started_at`, `completed_at`, and schema-level `partial` status handling.
- [x] 1.2 Implement stock research API functions for catalog, create report, list reports, and get report detail using the organization-aware API client and backend-aligned normalization for symbol input only.
- [x] 1.3 Add React Query keys and hooks for the runtime catalog, report history, selected report detail, and create-report mutation with refetch-safe invalidation or refresh hooks.

## 2. Routing and navigation

- [x] 2.1 Add the protected `/stocks/research` route and export a dedicated stock research page from a new stock research feature area.
- [x] 2.2 Update sidebar navigation so the `Markets` group includes `Stock Research` and highlights `/stocks/research` correctly.
- [x] 2.3 Add any shared page-level state needed to keep the selected report and explicit refresh behavior scoped to the research workspace.

## 3. Shared create-report flow

- [ ] 3.1 Build a reusable stock research create-report dialog using shadcn `Dialog`, `Field`, `Input`, and `Select`, with support for symbol prefills from calling surfaces.
- [ ] 3.2 Load provider, model, and reasoning choices from the stock research catalog endpoint and ensure the submit payload omits `runtime_config` unless the user explicitly selects an override.
- [ ] 3.3 Handle create success and failure with `sonner` toasts, close the dialog only after successful queueing, and avoid automatic navigation or polling after submit.

## 4. Stock research workspace UI

- [ ] 4.1 Build the desktop-first stock research page shell with a history rail, report detail panel, internal scrolling, and a page-level `New Report` action.
- [ ] 4.2 Render report history entries with backend status metadata and selection behavior that loads detail on demand without inventing unsupported list semantics.
- [ ] 4.3 Render report detail using the existing markdown renderer, show backend sources and failure states, and keep queued/running states snapshot-based with explicit refresh only.
- [ ] 4.4 Add empty, loading, and retry-oriented error states for catalog loading, report history, unselected detail, selected report detail, and empty report history.

## 5. Cross-surface research entry points

- [ ] 5.1 Add a row-level `Research` action to the stock catalog page that opens the shared create-report dialog without losing current catalog context.
- [ ] 5.2 Add a row-level `Research` action to the watchlists page that opens the shared create-report dialog without losing active watchlist context.
- [ ] 5.3 Reuse the same stock research dialog behavior across the research page, stock catalog, and watchlists surfaces so runtime selection, submit semantics, and toast feedback stay consistent.

## 6. Verification

- [ ] 6.1 Verify the create-report flow against the documented backend contract for default runtime, explicit runtime override, and create-error cases.
- [ ] 6.2 Verify the research workspace against queued, running, completed, failed, empty-history, and no-selection states without adding polling or fake realtime progress.
- [ ] 6.3 Run the relevant lint or test checks for the touched frontend modules and fix any introduced issues.
