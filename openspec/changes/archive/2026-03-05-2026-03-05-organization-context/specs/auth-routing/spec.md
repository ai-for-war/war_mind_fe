## MODIFIED Requirements

### Requirement: Protected route guard with auth hydration
The `ProtectedRoute` component SHALL check both authentication state and organization hydration before rendering protected content. If the user has a token but user or organization data is not yet loaded in memory (e.g., after page reload), the guard SHALL hydrate the data before rendering.

The hydration logic SHALL be provided by a `useHydrateAuth` hook at `src/hooks/use-hydrate-auth.ts`:
1. Check: `token` exists AND (`user === null` OR `organizations.length === 0`)
2. If hydration needed → fetch `GET /users/me` and `GET /users/me/organizations` in parallel
3. If organizations empty → call `logout()` and redirect to `/login`
4. If OK → set user via `setUser()`, set organizations via `setOrganizations()`
5. Return `{ isHydrating: boolean, isHydrated: boolean }`

The `ProtectedRoute` SHALL render a loading state while hydration is in progress.

#### Scenario: Page reload with valid token
- **WHEN** the page reloads and a valid token exists in localStorage
- **THEN** the ProtectedRoute shows a loading state, fetches user + organizations, sets stores, then renders the app

#### Scenario: Page reload with expired token
- **WHEN** the page reloads and the token in localStorage is expired
- **THEN** the hydration fetch returns 401, the 401 interceptor triggers logout, and the user is redirected to `/login`

#### Scenario: Page reload — user has no organizations
- **WHEN** the page reloads, user profile fetches successfully, but organizations returns empty
- **THEN** `logout()` is called and the user is redirected to `/login`

#### Scenario: Already hydrated (normal navigation)
- **WHEN** user navigates between protected routes after initial load/login
- **THEN** hydration is skipped (`isHydrated` is already `true`) and routes render immediately
