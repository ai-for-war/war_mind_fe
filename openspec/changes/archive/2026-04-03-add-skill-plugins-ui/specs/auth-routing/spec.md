## ADDED Requirements

### Requirement: Skill Plugins route
The router SHALL define a protected route at path `/skill-plugins` that renders the Skill Plugins page component from the skill plugins feature area. This route SHALL be nested under the `MainLayout`, alongside the existing authenticated application routes.

#### Scenario: Navigate to /skill-plugins
- **WHEN** an authenticated user navigates to `/skill-plugins`
- **THEN** the Skill Plugins page is rendered inside the `MainLayout`

#### Scenario: Unauthenticated user accesses /skill-plugins
- **WHEN** an unauthenticated user navigates to `/skill-plugins`
- **THEN** they are redirected to `/login` with `/skill-plugins` stored in location state
