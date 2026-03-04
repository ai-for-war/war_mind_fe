## 1. Project Setup

- [ ] 1.1 Install dependencies: `axios`, `zustand`
- [ ] 1.2 Create `.env.example` with `VITE_API_URL=http://localhost:8000/api/v1`

## 2. Environment Config

- [ ] 2.1 Create `src/config/env.ts` — typed env wrapper exposing `API_URL` from `VITE_API_URL`

## 3. Storage Module

- [ ] 3.1 Create `src/lib/storage.ts` — typed localStorage wrapper with `getToken()`, `setToken()`, `removeToken()` using key `access_token`

## 4. Shared API Types

- [ ] 4.1 Create `src/types/api.ts` — `ApiErrorResponse` (detail: string | ValidationError[]) and `ValidationError` interface

## 5. HTTP Client

- [ ] 5.1 Create `src/lib/api-client.ts` — Axios instance with `baseURL` from env config, default `Content-Type: application/json`
- [ ] 5.2 Add request interceptor — attach `Authorization: Bearer <token>` from `storage.getToken()` when token exists
- [ ] 5.3 Add response interceptor — on 401 (excluding `/auth/login`), call `storage.removeToken()` and redirect to `/login`

## 6. Auth Feature Types

- [ ] 6.1 Create `src/features/auth/types/auth.types.ts` — `LoginRequest`, `TokenResponse`, `UserResponse`, `ChangePasswordRequest`, `ChangePasswordResponse`

## 7. Auth API Functions

- [ ] 7.1 Create `src/features/auth/api/auth-api.ts` — `login(data)` → POST `/auth/login`
- [ ] 7.2 Add `getMe()` → GET `/users/me`
- [ ] 7.3 Add `changePassword(data)` → POST `/auth/change-password`
- [ ] 7.4 Add composite `loginWithUser(data)` — login → setToken → getMe → return { token, user }, rollback token on getMe failure

## 8. Auth Store

- [ ] 8.1 Create `src/stores/use-auth-store.ts` — Zustand store with `token`, `user`, `isAuthenticated` state
- [ ] 8.2 Implement `setAuth(token, user)` — set state + call `storage.setToken()`
- [ ] 8.3 Implement `setUser(user)` — update user state only
- [ ] 8.4 Implement `logout()` — clear state + call `storage.removeToken()`

## 9. Barrel Export

- [ ] 9.1 Create `src/features/auth/index.ts` — re-export `authApi` functions and all auth types
