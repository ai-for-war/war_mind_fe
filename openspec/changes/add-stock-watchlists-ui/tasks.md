## 1. Watchlist data layer

- [x] 1.1 Add stock watchlist types that mirror the backend request and response contracts, including nullable `stock` metadata handling.
- [x] 1.2 Implement stock watchlist API functions for list, create, rename, delete, list items, add item, and remove item using the organization-aware API client.
- [x] 1.3 Add React Query keys and hooks for watchlist summaries, active watchlist items, and watchlist mutations with refetch-safe invalidation.

## 2. Watchlists route and navigation

- [x] 2.1 Add the protected `/stocks/watchlists` route and export a dedicated watchlists page from a new stock watchlists feature area.
- [x] 2.2 Update sidebar navigation so the `Markets` group includes `Watchlists` and highlights the route correctly.
- [x] 2.3 Add any shared page-level state needed to select and switch the active watchlist from the route workspace.

## 3. Watchlists page UI

- [x] 3.1 Build the desktop-first watchlists page shell with a watchlist directory rail and active-watchlist content panel.
- [x] 3.2 Add create, rename, and delete watchlist dialogs using the shadcn `Field` component and backend-aligned validation/error feedback.
- [x] 3.3 Build the active-watchlist items table with null-safe metadata rendering, empty states, loading states, error states, and remove-item actions.
- [x] 3.4 Add the watchlist-page `Add Symbol` dialog with direct symbol input only and mutation handling for duplicate and not-found responses.

## 4. Cross-surface add-to-watchlist actions

- [ ] 4.1 Add a row-level `Add to watchlist` action to the stock catalog table without disrupting existing catalog interactions.
- [ ] 4.2 Add an `Add to watchlist` action to the stock company overview popup header while preserving popup state and layout.
- [ ] 4.3 Reuse a shared watchlist selection flow across catalog and popup actions, including the empty-watchlist case.

## 5. Verification

- [ ] 5.1 Verify all watchlist CRUD and item flows against the documented backend contract, including `409`, `404`, and `stock = null` cases.
- [ ] 5.2 Run the relevant lint or test checks for the touched frontend modules and fix any introduced issues.
- [ ] 5.3 Review the final UX against the agreed desktop-first scope and confirm no unsupported watchlist search, filter, pagination, or ordering controls were introduced.
