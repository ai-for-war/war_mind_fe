## Context

Ứng dụng SaaS multi-tenant đã có auth flow hoàn chỉnh (login → getMe → store token + user). Backend đã có endpoint `GET /users/me/organizations` trả về danh sách organizations mà user là member, kèm role (`admin` | `user`) trong mỗi org.

Hiện tại frontend không có concept organization — sau login chỉ có `token` và `user` trong auth store. Mọi API call chưa gửi organization context, nên backend không biết user đang thao tác trong org nào.

Project tuân theo Feature-First Architecture. Path alias `@/` → `src/`. Dependency rule: `lib/` không import từ `stores/` hay `features/`. Storage module ở `lib/` layer dùng để bridge data giữa `lib/` và `stores/`.

## Goals / Non-Goals

**Goals:**
- Fetch organizations ngay sau login, trước khi user vào app
- Tự động chọn org đầu tiên làm active nếu có ≥1 org
- Force logout nếu user không thuộc org nào
- Persist active org vào localStorage để giữ lại sau page reload
- Gắn `X-Organization-Id` header vào mọi authenticated API request
- Cho phép switch org runtime (qua store action, UI sẽ implement sau)
- Hydrate org data khi page reload (có token nhưng org chưa trong memory)

**Non-Goals:**
- Không implement UI cho org picker/switcher (sẽ làm riêng)
- Không implement org management (create, update, delete org)
- Không implement member management (add, remove members)
- Không sửa backend (backend sẽ cần thêm middleware đọc `X-Organization-Id` header riêng)

## Decisions

### 1. Organization feature module tách riêng

**Choice**: Tạo `src/features/organization/` với types, api, barrel export riêng biệt.

**Rationale**: Organization là một domain khác với auth. Auth xử lý identity (ai đang login), organization xử lý tenant context (đang thao tác trong org nào). Tách riêng giúp scale khi cần thêm org management features sau này.

**Alternatives considered**:
- Gộp vào `features/auth/`: Tiện nhưng vi phạm single responsibility. Auth types/api sẽ phình ra khi thêm org management.

### 2. Organization store tách riêng khỏi auth store

**Choice**: Tạo `src/stores/use-organization-store.ts` riêng, không merge vào `use-auth-store.ts`.

**Rationale**: Auth store quản lý identity state (token, user, isAuthenticated). Org store quản lý tenant state (organizations list, active org). Hai concern khác nhau, lifecycle khác nhau (auth clear khi logout, org clear khi logout HOẶC khi switch user). Tách store giúp mỗi store đơn giản, dễ test.

**Trade-off**: Login flow cần coordinate 2 stores (setAuth + setOrganizations). Mitigate bằng cách handle tại `use-login` hook layer.

### 3. Active org persist qua storage module

**Choice**: Thêm `getActiveOrganizationId()`, `setActiveOrganizationId()`, `removeActiveOrganizationId()` vào `storage.ts`. Org store dùng storage module để sync, giống pattern của auth store.

**Rationale**: Tuân thủ dependency rule `lib/` không import `stores/`. API client interceptor cần đọc active org id để gắn header — phải đọc từ storage module (cùng layer `lib/`), không thể import store.

**Key**: Chỉ persist `activeOrganizationId` (string), không persist toàn bộ org list. Org list sẽ được re-fetch khi app reload.

### 4. X-Organization-Id header thay vì query parameter

**Choice**: Gắn `X-Organization-Id` custom header vào mọi request qua request interceptor.

**Rationale**: Header là cross-cutting concern — áp dụng cho mọi request mà không cần sửa từng API function. Nếu dùng query param, mỗi API function phải tự thêm `?organization_id=xxx`. Header approach:
- Centralized tại interceptor, 1 nơi duy nhất
- Không pollute URL
- Dễ thêm/xóa mà không ảnh hưởng API function signatures

**Note**: Backend hiện dùng query param. Sẽ cần backend update middleware để đọc `X-Organization-Id` header. Đây là thay đổi riêng, ngoài scope frontend.

### 5. Three-step login flow

**Choice**: Mở rộng `loginWithUser` thành: `POST /auth/login` → `GET /users/me` → `GET /users/me/organizations`.

**Rationale**: Cả 3 bước đều bắt buộc trước khi user vào app. Nếu bước 3 fail hoặc trả về empty array → user không thể sử dụng app. Đặt trong `loginWithUser` đảm bảo login hook nhận được đủ data để quyết định: cho vào app hay force logout.

**Error handling**: Nếu fetch organizations fail → rollback (remove token) và propagate error, giống behavior hiện tại khi getMe fail.

### 6. Zero-org = force logout

**Choice**: Nếu `GET /users/me/organizations` trả về empty array → gọi `logout()` ngay trong login hook.

**Rationale**: Trong SaaS multi-tenant, user không thuộc org nào = không có quyền truy cập bất kỳ resource nào. Cho vào app sẽ dẫn đến mọi API call fail. Force logout với error message rõ ràng là UX tốt hơn.

### 7. Default active org = first in list

**Choice**: Tự động chọn org đầu tiên trong array làm active org.

**Rationale**: Đơn giản, deterministic. Sau này khi có org picker UI, user có thể switch. Nếu localStorage đã có `active_organization_id` từ session trước → ưu tiên org đó (nếu vẫn còn trong list), fallback về org đầu tiên.

### 8. Hydration guard cho page reload

**Choice**: Thêm hydration logic tại `ProtectedRoute` hoặc tạo hook `useOrganizationHydration` — khi app reload, nếu có token nhưng org store rỗng → fetch `/users/me` và `/users/me/organizations` trước khi render.

**Rationale**: Hiện tại khi reload, auth store chỉ restore `token` từ localStorage và set `isAuthenticated = true`, nhưng `user = null` và org data hoàn toàn mất. Cần hydrate lại cả user và org data.

**Approach**: Tạo `useHydrateAuth` hook dùng trong `ProtectedRoute`. Hook này:
1. Check: có token + (user === null hoặc organizations === []) ?
2. Nếu có → fetch `/users/me` + `/users/me/organizations` song song
3. Nếu org list empty → logout
4. Nếu OK → set user vào auth store, set orgs + active org vào org store
5. Render loading state trong khi hydrating

**File structure**:

```
src/
├── features/
│   └── organization/
│       ├── api/
│       │   └── organization-api.ts
│       ├── types/
│       │   └── organization.types.ts
│       └── index.ts
├── hooks/
│   └── use-hydrate-auth.ts
├── stores/
│   ├── use-auth-store.ts       (modified)
│   └── use-organization-store.ts (new)
└── lib/
    ├── api-client.ts            (modified)
    └── storage.ts               (modified)
```

### 9. Organization store shape

**Choice**:

```typescript
type OrganizationState = {
  organizations: UserOrganizationResponse[]
  activeOrganization: UserOrganizationResponse | null
  setOrganizations: (orgs: UserOrganizationResponse[]) => void
  setActiveOrganization: (orgId: string) => void
  clear: () => void
}
```

**Rationale**:
- `organizations`: full list cho org switcher UI sau này
- `activeOrganization`: cả object (org detail + role), không chỉ id — để UI có thể hiện tên org, check role mà không cần lookup
- `setOrganizations`: set list + auto-set active (ưu tiên localStorage id, fallback first)
- `setActiveOrganization(orgId)`: switch active org, update localStorage
- `clear`: reset toàn bộ state + remove từ localStorage

## Risks / Trade-offs

**[3-step login tăng latency]** → Thêm 1 request nữa vào login flow. Mitigate: request thứ 3 thường nhẹ (user chỉ thuộc vài org). Có thể optimize bằng `Promise.all([getMe(), getMyOrganizations()])` vì 2 request này independent (cả 2 chỉ cần token).

**[Dual source cho active org (localStorage + Zustand)]** → Giống pattern đã có cho token. Mitigate bằng cách luôn sync qua `setActiveOrganization()`/`clear()` actions.

**[X-Organization-Id header chưa được backend support]** → Frontend sẽ gửi header nhưng backend chưa đọc. Không gây lỗi (header bị ignore), nhưng cần backend update để thực sự enforce multi-tenancy. Đây là known gap.

**[Hydration adds loading state]** → Khi page reload, user sẽ thấy loading spinner trước khi app render. Đây là trade-off cần thiết — render app mà không có org context sẽ gây lỗi ở mọi API call.

**[Force logout khi 0 org có thể gây confusion]** → User login thành công nhưng bị đá ra ngay. Mitigate bằng error message rõ ràng: "Your account is not associated with any organization."

## Open Questions

_None — tất cả decisions đã được confirm trong brainstorm session._
