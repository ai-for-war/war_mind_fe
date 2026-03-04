## ADDED Requirements

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

### Requirement: Protected route guard
The router SHALL provide a `ProtectedRoute` component that checks `useAuthStore.isAuthenticated`. If the user is not authenticated, they SHALL be redirected to `/login`. The redirect SHALL preserve the original requested path in location state for post-login navigation.

#### Scenario: Unauthenticated user accesses protected route
- **WHEN** an unauthenticated user navigates to a protected route (e.g., `/`)
- **THEN** they are redirected to `/login` with the original path stored in location state

#### Scenario: Authenticated user accesses protected route
- **WHEN** an authenticated user navigates to a protected route
- **THEN** the route content renders normally

### Requirement: Post-login redirect to originally requested path
After successful login, the system SHALL redirect the user to the path stored in location state (if available), otherwise to `/`.

#### Scenario: Redirect after login with saved path
- **WHEN** a user was redirected to `/login` from `/dashboard` and then logs in successfully
- **THEN** they are navigated to `/dashboard` (the originally requested path)

#### Scenario: Redirect after login without saved path
- **WHEN** a user navigates directly to `/login` and logs in successfully
- **THEN** they are navigated to `/`

### Requirement: Catch-all route redirects to login
The router SHALL define a catch-all route (`*`) that redirects unauthenticated users to `/login` and authenticated users to `/`.

#### Scenario: Unknown route while unauthenticated
- **WHEN** an unauthenticated user navigates to `/nonexistent`
- **THEN** they are redirected to `/login`

#### Scenario: Unknown route while authenticated
- **WHEN** an authenticated user navigates to `/nonexistent`
- **THEN** they are redirected to `/`
