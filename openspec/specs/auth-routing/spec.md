## Purpose
Define centralized application routing with public and protected auth-aware flows.

## Requirements

### Requirement: Centralized router configuration
The system SHALL provide a centralized router at `src/app/router.tsx` using `react-router-dom` `createBrowserRouter`. All route definitions SHALL be declared in this single file.

#### Scenario: Application uses the centralized router
- **WHEN** the application mounts
- **THEN** the router from `src/app/router.tsx` is used as the root routing configuration via `RouterProvider`

### Requirement: Public route for login
The router SHALL define a public route at path `/login` that renders the login page component from `features/auth`. This route SHALL use `AuthLayout` as its layout wrapper.

#### Scenario: Navigate to /login
- **WHEN** a user navigates to `/login`
- **THEN** the login page is rendered inside the `AuthLayout`

### Requirement: Protected route guard with auth hydration
The `ProtectedRoute` component SHALL check both authentication state and organization hydration before rendering protected content. If the user has a token but user or organization data is not yet loaded in memory (for example after page reload), the guard SHALL hydrate the data before rendering.

The hydration logic SHALL be provided by a `useHydrateAuth` hook at `src/hooks/use-hydrate-auth.ts`:
1. Check `token` exists AND (`user === null` OR `organizations.length === 0`)
2. If hydration needed, fetch `GET /users/me` and `GET /users/me/organizations` in parallel
3. If organizations empty, call `logout()` and redirect to `/login`
4. If OK, set user via `setUser()`, set organizations via `setOrganizations()`
5. Return `{ isHydrating: boolean, isHydrated: boolean }`

The `ProtectedRoute` SHALL render a loading state while hydration is in progress.

#### Scenario: Unauthenticated user accesses protected route
- **WHEN** an unauthenticated user navigates to a protected route (e.g., `/voice-cloning`)
- **THEN** they are redirected to `/login` with the original path stored in location state

#### Scenario: Page reload with valid token
- **WHEN** the page reloads and a valid token exists in localStorage
- **THEN** the ProtectedRoute shows a loading state, fetches user and organizations, sets stores, then renders the app

#### Scenario: Page reload with expired token
- **WHEN** the page reloads and the token in localStorage is expired
- **THEN** the hydration fetch returns 401, the 401 interceptor triggers logout, and the user is redirected to `/login`

#### Scenario: Page reload user has no organizations
- **WHEN** the page reloads, user profile fetches successfully, but organizations returns empty
- **THEN** `logout()` is called and the user is redirected to `/login`

#### Scenario: Already hydrated (normal navigation)
- **WHEN** user navigates between protected routes after initial load/login
- **THEN** hydration is skipped (`isHydrated` is already `true`) and routes render immediately

### Requirement: Post-login redirect to originally requested path
After successful login, the system SHALL redirect the user to the path stored in location state (if available), otherwise to `/`.

#### Scenario: Redirect after login with saved path
- **WHEN** a user was redirected to `/login` from `/dashboard` and then logs in successfully
- **THEN** they are navigated to `/dashboard` (the originally requested path)

#### Scenario: Redirect after login without saved path
- **WHEN** a user navigates directly to `/login` and logs in successfully
- **THEN** they are navigated to `/`

### Requirement: Catch-all route redirects to login
The router SHALL define a catch-all route (`*`) that redirects unauthenticated users to `/login` and authenticated users to `/voice-cloning`.

#### Scenario: Unknown route while unauthenticated
- **WHEN** an unauthenticated user navigates to `/nonexistent`
- **THEN** they are redirected to `/login`

#### Scenario: Unknown route while authenticated
- **WHEN** an authenticated user navigates to `/nonexistent`
- **THEN** they are redirected to `/voice-cloning`

### Requirement: Voice Cloning route
The router SHALL define a protected route at path `/voice-cloning` that renders a placeholder Voice Cloning page component. This route SHALL be nested under the `MainLayout`.

#### Scenario: Navigate to /voice-cloning
- **WHEN** an authenticated user navigates to `/voice-cloning`
- **THEN** the Voice Cloning placeholder page is rendered inside the `MainLayout`

### Requirement: Multi-Agent route
The router SHALL define a protected route at path `/multi-agent` that renders a placeholder Multi-Agent page component. This route SHALL be nested under the `MainLayout`.

#### Scenario: Navigate to /multi-agent
- **WHEN** an authenticated user navigates to `/multi-agent`
- **THEN** the Multi-Agent placeholder page is rendered inside the `MainLayout`

### Requirement: Root path redirects to Voice Cloning
The router SHALL redirect authenticated users from `/` to `/voice-cloning`. This replaces the previous behavior of rendering the `App` component at `/`.

#### Scenario: Authenticated user visits root
- **WHEN** an authenticated user navigates to `/`
- **THEN** they are redirected to `/voice-cloning`

### Requirement: Catch-all redirects to Voice Cloning for authenticated users
The catch-all route (`*`) SHALL redirect authenticated users to `/voice-cloning` instead of `/`.

#### Scenario: Unknown route while authenticated
- **WHEN** an authenticated user navigates to `/nonexistent`
- **THEN** they are redirected to `/voice-cloning`
