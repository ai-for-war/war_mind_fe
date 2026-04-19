## ADDED Requirements

### Requirement: Stock Watchlists route
The router SHALL define a protected route at path `/stocks/watchlists` that renders the Watchlists page component from the stock watchlists feature area. This route SHALL be nested under the `MainLayout`, alongside the existing authenticated application routes.

#### Scenario: Navigate to /stocks/watchlists
- **WHEN** an authenticated user navigates to `/stocks/watchlists`
- **THEN** the Watchlists page is rendered inside the `MainLayout`

#### Scenario: Unauthenticated user accesses /stocks/watchlists
- **WHEN** an unauthenticated user navigates to `/stocks/watchlists`
- **THEN** they are redirected to `/login` with `/stocks/watchlists` stored in location state
