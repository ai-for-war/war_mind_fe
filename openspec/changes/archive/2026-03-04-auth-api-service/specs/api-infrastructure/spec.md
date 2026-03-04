## ADDED Requirements

### Requirement: Typed environment configuration
The system SHALL provide a typed wrapper around Vite environment variables. The wrapper SHALL expose `API_URL` from `import.meta.env.VITE_API_URL`. A `.env.example` file SHALL document all required environment variables.

#### Scenario: Access API base URL
- **WHEN** any module imports the env config
- **THEN** it receives a typed object with `API_URL` as a string value read from `VITE_API_URL`

### Requirement: Typed localStorage wrapper for token
The system SHALL provide a `storage` module with functions to get, set, and remove the access token from `localStorage`. The storage key SHALL be `access_token`.

#### Scenario: Store a token
- **WHEN** `setToken("abc123")` is called
- **THEN** `localStorage` contains key `access_token` with value `"abc123"`

#### Scenario: Retrieve a token
- **WHEN** `getToken()` is called and `localStorage` has key `access_token`
- **THEN** the stored string value is returned

#### Scenario: Retrieve token when none exists
- **WHEN** `getToken()` is called and `localStorage` has no `access_token` key
- **THEN** `null` is returned

#### Scenario: Remove a token
- **WHEN** `removeToken()` is called
- **THEN** the `access_token` key is removed from `localStorage`

### Requirement: Axios HTTP client instance
The system SHALL create a shared Axios instance configured with `baseURL` from env config and default header `Content-Type: application/json`.

#### Scenario: Requests use configured base URL
- **WHEN** a request is made via the API client
- **THEN** the request URL is prefixed with the value of `VITE_API_URL`

### Requirement: Request interceptor attaches Bearer token
The API client SHALL attach an `Authorization: Bearer <token>` header to every outgoing request when a token exists in localStorage. The client SHALL read the token from the `storage` module (not from Zustand store) to avoid circular dependencies between `lib/` and `stores/`.

#### Scenario: Token exists in storage
- **WHEN** a request is made and `storage.getToken()` returns a non-null value
- **THEN** the request header includes `Authorization: Bearer <token>`

#### Scenario: No token in storage
- **WHEN** a request is made and `storage.getToken()` returns `null`
- **THEN** no `Authorization` header is added to the request

### Requirement: Response interceptor handles 401 unauthorized
The API client SHALL intercept 401 responses and trigger automatic logout (clear token from storage and redirect to `/login`). The interceptor SHALL exclude responses from the `/auth/login` endpoint to avoid false logout on login failure.

#### Scenario: 401 from authenticated endpoint
- **WHEN** a response with status 401 is received from any endpoint other than `/auth/login`
- **THEN** the token is removed from localStorage and the user is redirected to `/login`

#### Scenario: 401 from login endpoint
- **WHEN** a response with status 401 is received from `/auth/login`
- **THEN** no automatic logout occurs; the error is passed through to the caller

### Requirement: Shared API error types
The system SHALL define TypeScript types matching backend error response shapes. The `ApiErrorResponse` type SHALL have a `detail` field that is either a `string` (for `AppException`/`HTTPException`) or an array of `ValidationError` objects (for Pydantic validation errors). Each `ValidationError` SHALL have `loc`, `msg`, and `type` fields.

#### Scenario: Standard error response
- **WHEN** backend returns `{ "detail": "Invalid email or password" }`
- **THEN** the response matches `ApiErrorResponse` with `detail` as `string`

#### Scenario: Validation error response
- **WHEN** backend returns `{ "detail": [{ "loc": ["body", "email"], "msg": "field required", "type": "value_error.missing" }] }`
- **THEN** the response matches `ApiErrorResponse` with `detail` as `ValidationError[]`
