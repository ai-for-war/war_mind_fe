## Why

Đây là ứng dụng SaaS multi-tenant — mọi dữ liệu và hành động đều gắn với một organization cụ thể. Hiện tại, frontend không biết user thuộc org nào sau khi login, dẫn đến không thể gửi `organization_id` trong các API call và không thể phân tách dữ liệu giữa các org.

Cần bổ sung organization context ngay sau login flow để:
- Xác định org nào đang active cho mọi API request
- Cho phép user switch giữa các org mà không cần logout
- Tự động logout nếu user không thuộc org nào

## What Changes

- Thêm `features/organization/` module: types, API function (`getMyOrganizations`), barrel export
- Thêm Zustand organization store (`use-organization-store.ts`) với localStorage persistence cho active org
- Cập nhật `storage.ts` thêm get/set/remove cho `active_organization` key
- Cập nhật `auth-api.ts` — `loginWithUser` gọi thêm `GET /users/me/organizations` sau khi fetch user profile
- Cập nhật `use-login` hook — xử lý logic: 0 org → logout, ≥1 org → chọn org đầu tiên làm active
- Cập nhật `api-client.ts` request interceptor — gắn header `X-Organization-Id` từ storage cho mọi request
- Cập nhật `use-auth-store` logout — clear cả organization store và storage
- Cập nhật 401 interceptor — clear organization data khi auto-logout
- Thêm hydration logic: khi app reload có token nhưng chưa có org data trong memory → fetch lại organizations

## Capabilities

### New Capabilities

- `organization-api`: Organization feature module với types matching backend schemas (`OrganizationResponse`, `OrganizationRole`, `UserOrganizationResponse`) và API function `getMyOrganizations` gọi `GET /users/me/organizations`.
- `organization-store`: Zustand store quản lý danh sách organizations của user, active organization + role, và actions để set/switch/clear. Active org được persist vào localStorage.

### Modified Capabilities

- `auth-api`: `loginWithUser` mở rộng thành 3-step flow (login → getMe → getMyOrganizations). Return thêm `organizations` array.
- `api-infrastructure`: Request interceptor thêm `X-Organization-Id` header. Storage module thêm active organization persistence. 401 interceptor clear cả org data.
- `auth-routing`: ProtectedRoute thêm org hydration guard — nếu có token nhưng chưa có org data thì fetch lại trước khi render.

## Impact

- **New directories**: `src/features/organization/`, `src/features/organization/api/`, `src/features/organization/types/`
- **New files**: 5 files (`organization.types.ts`, `organization-api.ts`, `index.ts`, `use-organization-store.ts`, hydration hook)
- **Modified files**: `api-client.ts`, `storage.ts`, `auth-api.ts`, `use-login.ts`, `use-auth-store.ts`, `router.tsx`
- **Backend endpoints consumed**: `GET /api/v1/users/me/organizations` (existing, no backend changes needed)
- **Auth flow change**: Login trở thành 3-step (login → getMe → getMyOrganizations). Nếu user 0 org → force logout ngay.
- **API contract**: Mọi authenticated request gửi kèm `X-Organization-Id` header (backend sẽ cần đọc header này — hiện tại backend dùng query param, sẽ cần cập nhật riêng)
