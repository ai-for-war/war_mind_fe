## MODIFIED Requirements

### Requirement: Protected route guard
The router SHALL provide a `ProtectedRoute` component that checks `useAuthStore.isAuthenticated`. If the user is not authenticated, they SHALL be redirected to `/login`. The redirect SHALL preserve the original requested path in location state for post-login navigation. The `ProtectedRoute` SHALL render its children within the `MainLayout` component, which provides the sidebar and header shell for all authenticated pages.

#### Scenario: Unauthenticated user accesses protected route
- **WHEN** an unauthenticated user navigates to a protected route (e.g., `/voice-cloning`)
- **THEN** they are redirected to `/login` with the original path stored in location state

#### Scenario: Authenticated user accesses protected route
- **WHEN** an authenticated user navigates to a protected route
- **THEN** the route content renders within the `MainLayout` (sidebar + header + content area)

## ADDED Requirements

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
