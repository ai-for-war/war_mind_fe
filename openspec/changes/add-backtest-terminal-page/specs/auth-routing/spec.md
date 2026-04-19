## ADDED Requirements

### Requirement: Backtest terminal route
The router SHALL define a protected route at path `/backtests` that renders the backtest terminal page component from the backtests feature area. This route SHALL be nested under `MainLayout`, alongside the existing authenticated application routes.

#### Scenario: Navigate to /backtests
- **WHEN** an authenticated user navigates to `/backtests`
- **THEN** the backtest terminal page is rendered inside `MainLayout`

#### Scenario: Unauthenticated user accesses /backtests
- **WHEN** an unauthenticated user navigates to `/backtests`
- **THEN** they are redirected to `/login` with `/backtests` stored in location state
