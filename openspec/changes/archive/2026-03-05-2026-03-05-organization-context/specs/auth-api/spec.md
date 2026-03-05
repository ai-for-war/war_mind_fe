## MODIFIED Requirements

### Requirement: Two-step login flow → Three-step login flow
The login flow SHALL execute in three sequential steps:
1. Call `POST /auth/login` to obtain `access_token`
2. Store the token via `storage.setToken()`, then call `GET /users/me` to fetch user profile
3. Call `GET /users/me/organizations` to fetch user's organizations
4. Return `{ token, user, organizations }` to the caller

Steps 2 and 3 MAY be executed in parallel via `Promise.all` since both only require the token and are independent of each other.

#### Scenario: Complete login flow
- **WHEN** a user submits valid credentials
- **THEN** the system obtains a token, stores it, fetches user profile and organizations in parallel, and returns all three

#### Scenario: Login succeeds but getMe fails
- **WHEN** `POST /auth/login` succeeds but `GET /users/me` fails
- **THEN** the token is removed from storage and the error is propagated to the caller

#### Scenario: Login succeeds but getMyOrganizations fails
- **WHEN** `POST /auth/login` succeeds but `GET /users/me/organizations` fails
- **THEN** the token is removed from storage and the error is propagated to the caller

### Requirement: Login hook handles organization logic
The `useLogin` hook SHALL process the organizations returned by `loginWithUser`:
- If `organizations` is empty (length === 0) → call `logout()`, set error message "Your account is not associated with any organization"
- If `organizations` has ≥1 item → call `setOrganizations(organizations)` on the organization store, then navigate to the app

#### Scenario: User with organizations logs in
- **WHEN** login succeeds and organizations array has items
- **THEN** auth store is set via `setAuth()`, organization store is set via `setOrganizations()`, and user navigates to the app

#### Scenario: User with zero organizations logs in
- **WHEN** login succeeds but organizations array is empty
- **THEN** `logout()` is called and an error message is shown: "Your account is not associated with any organization"

### Requirement: Logout clears organization state
The auth store `logout()` action SHALL additionally call `useOrganizationStore.getState().clear()` to ensure organization data is wiped when user logs out.

#### Scenario: Logout clears all state
- **WHEN** `logout()` is called
- **THEN** auth store is cleared (token, user, isAuthenticated), organization store is cleared (organizations, activeOrganization), and both localStorage keys (`access_token`, `active_organization`) are removed
