## Context

Project frontend (Vite + React + TypeScript) hiện chưa có API service layer. Backend đã có auth endpoints sẵn sàng (`POST /auth/login`, `GET /users/me`, `POST /auth/change-password`). Cần xây dựng foundation infrastructure và auth feature module trước khi implement bất kỳ UI nào.

Project tuân theo Feature-First Architecture với dependency rule: `lib/` không import từ `stores/` hay `features/`. Path alias `@/` map tới `src/`.

## Goals / Non-Goals

**Goals:**
- Tạo reusable HTTP client infrastructure mà mọi feature có thể dùng
- Implement auth API functions đủ để support login flow end-to-end
- Thiết lập token management pattern (localStorage + Zustand store)
- Tuân thủ project dependency rules (`lib/ → types/, config/` only)

**Non-Goals:**
- Không implement UI/pages (login form, protected routes)
- Không implement refresh token (backend chưa support)
- Không implement React Query integration (sẽ thêm sau khi có UI layer)
- Không implement logout API call (backend không có endpoint này — logout chỉ là client-side clear)

## Decisions

### 1. Axios over native Fetch

**Choice**: Axios

**Rationale**: Axios cung cấp interceptor API built-in cho request/response transformation, automatic JSON parsing, và request cancellation. Native fetch cần wrapper code tương đương để đạt được cùng developer experience.

**Alternatives considered**:
- `fetch` + custom wrapper: Lightweight hơn nhưng cần tự implement interceptor pattern, error normalization
- `ky`: Nhẹ hơn Axios nhưng ít phổ biến, ít middleware ecosystem

### 2. Token đọc từ storage module, không từ Zustand store

**Choice**: `api-client.ts` đọc token qua `storage.getToken()`

**Rationale**: Tuân thủ dependency rule `lib/ → không import stores/`. Nếu api-client import từ store sẽ tạo circular dependency chain `lib/ → stores/ → features/`. Storage module nằm cùng layer `lib/` nên không vi phạm.

**Trade-off**: Token state có 2 sources (localStorage via storage + Zustand store). Cần đảm bảo sync bằng cách `setAuth()` luôn gọi `storage.setToken()` và `logout()` luôn gọi `storage.removeToken()`.

### 3. Zustand store KHÔNG dùng persist middleware

**Choice**: Manual sync qua storage module

**Rationale**: Zustand persist middleware sẽ serialize toàn bộ state (bao gồm `user` object) vào localStorage. Chỉ cần persist `token` — user info sẽ được re-fetch từ `/users/me` khi app load. Điều này đơn giản hơn và tránh stale user data trong localStorage.

**Alternatives considered**:
- Zustand `persist` middleware with `partialize`: Chỉ persist `token`. Viable nhưng thêm 1 layer abstraction không cần thiết khi đã có storage module.

### 4. 401 interceptor exclude login endpoint

**Choice**: Response interceptor check URL trước khi trigger logout

**Rationale**: `POST /auth/login` trả 401 khi credentials sai — đây là expected behavior, không phải token expiry. Nếu không exclude, user sẽ bị redirect loop. Check bằng `error.config.url?.includes('/auth/login')`.

### 5. File structure theo project conventions

**Choice**: Đặt files đúng theo Feature-First Architecture rules

```
.env.example
src/
├── config/
│   └── env.ts
├── lib/
│   ├── api-client.ts
│   └── storage.ts
├── types/
│   └── api.ts
├── features/
│   └── auth/
│       ├── api/
│       │   └── auth-api.ts
│       ├── types/
│       │   └── auth.types.ts
│       └── index.ts
└── stores/
    └── use-auth-store.ts
```

**Rationale**: Tuân thủ project-structure.mdc và file-naming.mdc. Tất cả files dùng kebab-case, named exports only, barrel export cho feature.

### 6. Two-step login flow trong auth-api

**Choice**: `auth-api.ts` expose cả individual functions (`login`, `getMe`, `changePassword`) lẫn composite `loginWithUser` flow

**Rationale**: Individual functions cho flexibility (UI có thể gọi riêng lẻ). Composite flow cho convenience (login page gọi 1 function, handle cả 2 steps + error rollback).

## Risks / Trade-offs

**[Token in localStorage is XSS-vulnerable]** → Accepted risk. HttpOnly cookie cần backend changes ngoài scope. Mitigate bằng CSP headers và input sanitization ở UI layer sau.

**[No refresh token — user bị force logout khi token hết hạn]** → Accepted per business decision. UX impact: user phải re-login. Backend có thể thêm refresh token sau.

**[Dual token source (localStorage + Zustand)]** → Mitigate bằng cách luôn sync qua `setAuth()`/`logout()` actions. Không bao giờ set token trực tiếp vào 1 nơi mà không set nơi kia.

**[401 interceptor redirect dùng `window.location` thay vì React Router]** → Đơn giản nhất cho infrastructure layer (không depend vào React). Có thể refactor sang router-based redirect khi thêm router layer.

## Open Questions

_None — tất cả decisions đã được confirm trong brainstorm session._
