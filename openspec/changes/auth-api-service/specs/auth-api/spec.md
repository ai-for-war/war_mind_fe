## ADDED Requirements

### Requirement: Auth request and response types
The system SHALL define TypeScript interfaces matching backend auth schemas:
- `LoginRequest`: `{ email: string, password: string }`
- `TokenResponse`: `{ access_token: string, token_type: string }`
- `UserResponse`: `{ id: string, email: string, role: string, is_active: boolean, created_at: string }`
- `ChangePasswordRequest`: `{ current_password: string, new_password: string }`
- `ChangePasswordResponse`: `{ message: string }`

#### Scenario: Types match backend contract
- **WHEN** backend returns a login response `{ "access_token": "xyz", "token_type": "bearer" }`
- **THEN** the response is assignable to `TokenResponse` without type errors

### Requirement: Login API function
The system SHALL provide a `login` function that sends `POST /auth/login` with `LoginRequest` payload and returns a `Promise<TokenResponse>`. This endpoint does NOT require an authorization header.

#### Scenario: Successful login
- **WHEN** `login({ email: "user@example.com", password: "correct" })` is called
- **THEN** a POST request is sent to `/auth/login` and the resolved value is a `TokenResponse`

#### Scenario: Invalid credentials
- **WHEN** `login({ email: "user@example.com", password: "wrong" })` is called
- **THEN** the promise rejects with an Axios error containing `{ detail: "Invalid email or password" }`

### Requirement: Get current user API function
The system SHALL provide a `getMe` function that sends `GET /users/me` and returns a `Promise<UserResponse>`. This endpoint requires a Bearer token (handled by the API client interceptor).

#### Scenario: Authenticated user fetches profile
- **WHEN** `getMe()` is called with a valid token in storage
- **THEN** a GET request is sent to `/users/me` and the resolved value is a `UserResponse`

#### Scenario: Token is expired or invalid
- **WHEN** `getMe()` is called with an invalid token
- **THEN** the API client 401 interceptor triggers automatic logout

### Requirement: Change password API function
The system SHALL provide a `changePassword` function that sends `POST /auth/change-password` with `ChangePasswordRequest` payload and returns a `Promise<ChangePasswordResponse>`. This endpoint requires a Bearer token.

#### Scenario: Successful password change
- **WHEN** `changePassword({ current_password: "old", new_password: "new" })` is called with valid credentials
- **THEN** a POST request is sent to `/auth/change-password` and the resolved value is `{ message: "..." }`

#### Scenario: Incorrect current password
- **WHEN** `changePassword` is called with wrong `current_password`
- **THEN** the promise rejects with an Axios error containing `{ detail: "Incorrect password" }`

### Requirement: Zustand auth store
The system SHALL provide a Zustand store with the following state and actions:
- State: `token: string | null`, `user: UserResponse | null`, `isAuthenticated: boolean`
- Actions: `setAuth(token, user)`, `setUser(user)`, `logout()`

The store SHALL NOT use Zustand persist middleware. Token persistence is handled by the `storage` module to keep `lib/` and `stores/` decoupled.

#### Scenario: Set auth after login
- **WHEN** `setAuth("abc123", userObj)` is called
- **THEN** `token` is `"abc123"`, `user` is `userObj`, `isAuthenticated` is `true`, and `storage.setToken("abc123")` is called

#### Scenario: Logout
- **WHEN** `logout()` is called
- **THEN** `token` is `null`, `user` is `null`, `isAuthenticated` is `false`, and `storage.removeToken()` is called

### Requirement: Two-step login flow
The login flow SHALL execute in two sequential steps:
1. Call `POST /auth/login` to obtain `access_token`
2. Store the token via `storage.setToken()`, then call `GET /users/me` to fetch user profile
3. Call `store.setAuth(token, user)` to update global state

#### Scenario: Complete login flow
- **WHEN** a user submits valid credentials
- **THEN** the system first obtains a token, stores it, fetches the user profile, and sets both token and user in the auth store

#### Scenario: Login succeeds but getMe fails
- **WHEN** `POST /auth/login` succeeds but `GET /users/me` fails
- **THEN** the token is removed from storage and the error is propagated to the caller

### Requirement: Auth feature barrel export
The system SHALL provide an `index.ts` barrel file in `src/features/auth/` that re-exports the auth API functions and all auth types.

#### Scenario: Import from feature barrel
- **WHEN** a consumer imports from `@/features/auth`
- **THEN** `authApi`, `LoginRequest`, `TokenResponse`, `UserResponse`, `ChangePasswordRequest`, `ChangePasswordResponse` are all available
