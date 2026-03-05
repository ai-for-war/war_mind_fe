## MODIFIED Requirements

### Requirement: Request interceptor attaches Bearer token and Organization ID
The API client request interceptor SHALL attach two headers to every outgoing request when their respective values exist in localStorage:
1. `Authorization: Bearer <token>` — when `storage.getToken()` returns a non-null value (existing behavior)
2. `X-Organization-Id: <orgId>` — when `storage.getActiveOrganizationId()` returns a non-null value (new behavior)

#### Scenario: Token and active org exist in storage
- **WHEN** a request is made, `storage.getToken()` returns a token, and `storage.getActiveOrganizationId()` returns an org id
- **THEN** the request headers include both `Authorization: Bearer <token>` and `X-Organization-Id: <orgId>`

#### Scenario: Token exists but no active org
- **WHEN** a request is made, `storage.getToken()` returns a token, and `storage.getActiveOrganizationId()` returns `null`
- **THEN** the request header includes `Authorization: Bearer <token>` but no `X-Organization-Id` header

#### Scenario: No token in storage
- **WHEN** a request is made and `storage.getToken()` returns `null`
- **THEN** no `Authorization` or `X-Organization-Id` headers are added

### Requirement: Response interceptor clears organization data on 401
The 401 response interceptor SHALL additionally clear organization data from localStorage by calling `storage.removeActiveOrganizationId()` alongside `storage.removeToken()`.

#### Scenario: 401 from authenticated endpoint
- **WHEN** a response with status 401 is received from any endpoint other than `/auth/login`
- **THEN** both the token and active organization id are removed from localStorage, and the user is redirected to `/login`

## ADDED Requirements

### Requirement: Active organization localStorage persistence
The `storage` module SHALL provide three additional functions for active organization persistence:
- `getActiveOrganizationId(): string | null` — reads from localStorage key `active_organization`
- `setActiveOrganizationId(orgId: string): void` — writes to localStorage key `active_organization`
- `removeActiveOrganizationId(): void` — removes localStorage key `active_organization`

#### Scenario: Store active organization id
- **WHEN** `setActiveOrganizationId("org-123")` is called
- **THEN** `localStorage` contains key `active_organization` with value `"org-123"`

#### Scenario: Retrieve active organization id
- **WHEN** `getActiveOrganizationId()` is called and `localStorage` has key `active_organization`
- **THEN** the stored string value is returned

#### Scenario: No active organization stored
- **WHEN** `getActiveOrganizationId()` is called and `localStorage` has no `active_organization` key
- **THEN** `null` is returned

#### Scenario: Remove active organization id
- **WHEN** `removeActiveOrganizationId()` is called
- **THEN** the `active_organization` key is removed from `localStorage`
