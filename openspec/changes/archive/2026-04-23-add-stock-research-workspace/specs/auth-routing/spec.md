## ADDED Requirements

### Requirement: Stock Research route
The router SHALL define a protected route at path `/stocks/research` that renders the Stock Research page component from the stock research feature area. This route SHALL be nested under `MainLayout`, alongside the existing authenticated application routes.

#### Scenario: Navigate to /stocks/research
- **WHEN** an authenticated user navigates to `/stocks/research`
- **THEN** the Stock Research page is rendered inside `MainLayout`

#### Scenario: Unauthenticated user accesses /stocks/research
- **WHEN** an unauthenticated user navigates to `/stocks/research`
- **THEN** they are redirected to `/login` with `/stocks/research` stored in location state
