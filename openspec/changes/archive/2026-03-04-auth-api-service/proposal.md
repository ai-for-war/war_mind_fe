## Why

Frontend hiện chưa có API service layer để giao tiếp với backend. Cần xây dựng infrastructure (HTTP client, token management) và auth API service để hỗ trợ login flow — đây là foundation bắt buộc trước khi implement bất kỳ feature UI nào.

## What Changes

- Thêm Axios HTTP client với request/response interceptors (Bearer token, 401 auto-logout)
- Thêm typed environment config wrapper (`VITE_API_URL`)
- Thêm typed localStorage wrapper cho token persistence
- Thêm shared API error types (match backend `AppException`, `HTTPException`, Pydantic validation)
- Thêm auth feature module: types, API functions (`login`, `getMe`, `changePassword`)
- Thêm Zustand auth store với localStorage sync (token + user state)
- Thêm `.env.example` với `VITE_API_URL`

## Capabilities

### New Capabilities

- `api-infrastructure`: Axios HTTP client instance, env config, localStorage wrapper, shared API error types. Foundation layer mà tất cả feature API services sẽ depend vào.
- `auth-api`: Auth API functions (login, getMe, changePassword), auth request/response types, Zustand auth store, barrel exports. Covers toàn bộ auth flow từ login đến token management.

### Modified Capabilities

_None — đây là project mới, chưa có specs nào tồn tại._

## Impact

- **New files**: 9 files mới across `src/config/`, `src/lib/`, `src/types/`, `src/features/auth/`, `src/stores/`
- **Dependencies**: Cần thêm `axios` và `zustand` vào project
- **Backend endpoints consumed**: `POST /api/v1/auth/login`, `GET /api/v1/users/me`, `POST /api/v1/auth/change-password`
- **Auth flow**: Login 2 bước (POST login → GET me → set store), 401 interceptor auto-logout (exclude `/auth/login`)
- **Token strategy**: localStorage persistence, force logout khi token hết hạn (không refresh token)
