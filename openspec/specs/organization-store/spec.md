## Purpose
Define organization context state management in Zustand, including active organization selection and persistence.

## Requirements

### Requirement: Organization Zustand store
The system SHALL provide a Zustand store at `src/stores/use-organization-store.ts` with the following state and actions:
- State: `organizations: UserOrganizationResponse[]`, `activeOrganization: UserOrganizationResponse | null`
- Actions: `setOrganizations(orgs)`, `setActiveOrganization(orgId)`, `clear()`

The store SHALL NOT use Zustand persist middleware. Active organization persistence is handled by the `storage` module.

#### Scenario: Store initializes with empty state
- **WHEN** the application loads
- **THEN** `organizations` is `[]` and `activeOrganization` is resolved from `storage.getActiveOrganizationId()` (null if no stored value)

### Requirement: Set organizations with auto-select active
The `setOrganizations(orgs)` action SHALL:
1. Set `organizations` to the provided array
2. If `storage.getActiveOrganizationId()` returns an id that exists in the new list, set that org as active
3. Otherwise set the first org in the list as active
4. Call `storage.setActiveOrganizationId(activeOrg.organization.id)` to persist the selection

#### Scenario: Set organizations with previously stored active org
- **WHEN** `setOrganizations([orgA, orgB])` is called and `storage.getActiveOrganizationId()` returns `orgB.organization.id`
- **THEN** `activeOrganization` is set to `orgB` and localStorage is updated

#### Scenario: Set organizations without stored active org
- **WHEN** `setOrganizations([orgA, orgB])` is called and `storage.getActiveOrganizationId()` returns `null`
- **THEN** `activeOrganization` is set to `orgA` (first in list) and localStorage is updated

#### Scenario: Stored active org no longer in list
- **WHEN** `setOrganizations([orgA, orgB])` is called and `storage.getActiveOrganizationId()` returns `orgC.id` (not in list)
- **THEN** `activeOrganization` falls back to `orgA` (first in list) and localStorage is updated

### Requirement: Switch active organization
The `setActiveOrganization(orgId)` action SHALL find the org with matching `organization.id` in the `organizations` list, set it as `activeOrganization`, and call `storage.setActiveOrganizationId(orgId)`.

#### Scenario: Switch to valid org
- **WHEN** `setActiveOrganization("org-2")` is called and `org-2` exists in `organizations`
- **THEN** `activeOrganization` updates to the matching org and localStorage is updated

#### Scenario: Switch to non-existent org
- **WHEN** `setActiveOrganization("org-999")` is called and `org-999` does not exist in `organizations`
- **THEN** `activeOrganization` remains unchanged

### Requirement: Clear organization state
The `clear()` action SHALL reset `organizations` to `[]`, `activeOrganization` to `null`, and call `storage.removeActiveOrganizationId()`.

#### Scenario: Clear state on logout
- **WHEN** `clear()` is called
- **THEN** `organizations` is `[]`, `activeOrganization` is `null`, and `active_organization` key is removed from localStorage
