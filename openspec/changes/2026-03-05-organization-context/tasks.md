## 1. Storage Module — Active Organization Persistence

- [x] 1.1 Add `ACTIVE_ORGANIZATION_KEY = "active_organization"` constant to `src/lib/storage.ts`
- [x] 1.2 Add `getActiveOrganizationId()`, `setActiveOrganizationId()`, `removeActiveOrganizationId()` functions to the `storage` export object

## 2. Organization Feature — Types

- [x] 2.1 Create `src/features/organization/types/organization.types.ts` with `OrganizationResponse` interface, `OrganizationRole` type (`"admin" | "user"`), and `UserOrganizationResponse` interface matching backend schemas

## 3. Organization Feature — API

- [x] 3.1 Create `src/features/organization/api/organization-api.ts` with `getMyOrganizations()` function calling `GET /users/me/organizations` returning `Promise<UserOrganizationResponse[]>`

## 4. Organization Feature — Barrel Export

- [x] 4.1 Create `src/features/organization/index.ts` re-exporting `organizationApi` and all organization types

## 5. Organization Store

- [x] 5.1 Create `src/stores/use-organization-store.ts` Zustand store with `organizations`, `activeOrganization` state
- [x] 5.2 Implement `setOrganizations(orgs)` — set list + auto-select active org (prefer stored id from localStorage, fallback to first in list) + persist to localStorage
- [x] 5.3 Implement `setActiveOrganization(orgId)` — find org in list, set as active, persist to localStorage. No-op if orgId not found
- [x] 5.4 Implement `clear()` — reset state to defaults + call `storage.removeActiveOrganizationId()`

## 6. Auth API — Three-Step Login Flow

- [x] 6.1 Import `organizationApi.getMyOrganizations` in `src/features/auth/api/auth-api.ts`
- [x] 6.2 Update `loginWithUser` to execute `getMe()` and `getMyOrganizations()` in parallel via `Promise.all` after obtaining token. Return `{ token, user, organizations }`. On failure of either: remove token and propagate error

## 7. Auth Store — Logout Clears Organization

- [x] 7.1 Update `logout()` in `src/stores/use-auth-store.ts` to call `useOrganizationStore.getState().clear()` after clearing auth state

## 8. Login Hook — Organization Logic

- [x] 8.1 Update `onSuccess` in `src/features/auth/hooks/use-login.ts` to receive `organizations` from `loginWithUser`
- [x] 8.2 Add zero-org check: if `organizations.length === 0` → call `logout()` and throw error with message "Your account is not associated with any organization"
- [x] 8.3 Add positive-org path: call `useOrganizationStore.setOrganizations(organizations)` before navigation

## 9. API Client — X-Organization-Id Header

- [ ] 9.1 Update request interceptor in `src/lib/api-client.ts` to read `storage.getActiveOrganizationId()` and attach `X-Organization-Id` header when value is non-null
- [ ] 9.2 Update 401 response interceptor to call `storage.removeActiveOrganizationId()` alongside `storage.removeToken()`

## 10. Auth Hydration Hook

- [ ] 10.1 Create `src/hooks/use-hydrate-auth.ts` hook that checks if token exists but user or organizations are missing from stores
- [ ] 10.2 If hydration needed: fetch `GET /users/me` and `GET /users/me/organizations` in parallel
- [ ] 10.3 If organizations empty → call `logout()` and redirect to `/login`
- [ ] 10.4 If OK → call `setUser()` on auth store, `setOrganizations()` on org store
- [ ] 10.5 Return `{ isHydrating: boolean, isHydrated: boolean }`

## 11. Router — Protected Route Hydration Guard

- [ ] 11.1 Update `ProtectedRoute` in `src/app/router.tsx` to use `useHydrateAuth` hook
- [ ] 11.2 While `isHydrating` is true → render loading state (spinner or skeleton)
- [ ] 11.3 When `isHydrated` is true → render `<Outlet />` as before

## 12. Auth Types — Update loginWithUser Return Type

- [ ] 12.1 Update `loginWithUser` return type in `src/features/auth/api/auth-api.ts` to include `organizations: UserOrganizationResponse[]`
