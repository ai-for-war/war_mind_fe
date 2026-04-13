## ADDED Requirements

### Requirement: Stock Catalog route
The router SHALL define a protected route at path `/stocks` that renders the Stock Catalog page component from the stocks feature area. This route SHALL be nested under the `MainLayout`, alongside the existing authenticated application routes.

#### Scenario: Navigate to /stocks
- **WHEN** an authenticated user navigates to `/stocks`
- **THEN** the Stock Catalog page is rendered inside the `MainLayout`

#### Scenario: Unauthenticated user accesses /stocks
- **WHEN** an unauthenticated user navigates to `/stocks`
- **THEN** they are redirected to `/login` with `/stocks` stored in location state
