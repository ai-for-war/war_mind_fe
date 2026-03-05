## ADDED Requirements

### Requirement: Organization response types matching backend schemas
The system SHALL define TypeScript types in `src/features/organization/types/organization.types.ts` matching the backend organization schemas:
- `OrganizationResponse`: `{ id: string, name: string, slug: string, description: string | null, is_active: boolean, created_by: string, created_at: string, updated_at: string }`
- `OrganizationRole`: `"admin" | "user"` (union type matching backend `OrganizationRole` enum values)
- `UserOrganizationResponse`: `{ organization: OrganizationResponse, role: OrganizationRole }`

#### Scenario: Types match backend contract
- **WHEN** backend returns `{ "organization": { "id": "org-1", "name": "Acme", "slug": "acme", "description": null, "is_active": true, "created_by": "user-1", "created_at": "2026-01-01T00:00:00", "updated_at": "2026-01-01T00:00:00" }, "role": "admin" }`
- **THEN** the response is assignable to `UserOrganizationResponse` without type errors

### Requirement: Get my organizations API function
The system SHALL provide a `getMyOrganizations` function in `src/features/organization/api/organization-api.ts` that sends `GET /users/me/organizations` and returns a `Promise<UserOrganizationResponse[]>`. This endpoint requires a Bearer token (handled by the API client interceptor).

#### Scenario: User belongs to organizations
- **WHEN** `getMyOrganizations()` is called with a valid token in storage
- **THEN** a GET request is sent to `/users/me/organizations` and the resolved value is a `UserOrganizationResponse[]`

#### Scenario: User belongs to no organizations
- **WHEN** `getMyOrganizations()` is called and the user has no org memberships
- **THEN** the resolved value is an empty array `[]`

#### Scenario: Token is expired or invalid
- **WHEN** `getMyOrganizations()` is called with an invalid token
- **THEN** the API client 401 interceptor triggers automatic logout

### Requirement: Organization feature barrel export
The system SHALL provide an `index.ts` barrel file in `src/features/organization/` that re-exports the organization API functions and all organization types.

#### Scenario: Import from feature barrel
- **WHEN** a consumer imports from `@/features/organization`
- **THEN** `organizationApi`, `OrganizationResponse`, `OrganizationRole`, and `UserOrganizationResponse` are all available
