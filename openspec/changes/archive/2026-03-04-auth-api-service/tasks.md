## 1. Project Setup

- [x] 1.1 Install dependencies: `axios`, `zustand`
- [x] 1.2 Create `.env.example` with `VITE_API_URL=http://localhost:8000/api/v1`

## 2. Environment Config

- [x] 2.1 Create `src/config/env.ts` â€” typed env wrapper exposing `API_URL` from `VITE_API_URL`

## 3. Storage Module

- [x] 3.1 Create `src/lib/storage.ts` â€” typed localStorage wrapper with `getToken()`, `setToken()`, `removeToken()` using key `access_token`

## 4. Shared API Types

- [x] 4.1 Create `src/types/api.ts` â€” `ApiErrorResponse` (detail: string | ValidationError[]) and `ValidationError` interface

## 5. HTTP Client

- [x] 5.1 Create `src/lib/api-client.ts` â€” Axios instance with `baseURL` from env config, default `Content-Type: application/json`
- [x] 5.2 Add request interceptor â€” attach `Authorization: Bearer <token>` from `storage.getToken()` when token exists
- [x] 5.3 Add response interceptor â€” on 401 (excluding `/auth/login`), call `storage.removeToken()` and redirect to `/login`

## 6. Auth Feature Types

- [x] 6.1 Create `src/features/auth/types/auth.types.ts` â€” `LoginRequest`, `TokenResponse`, `UserResponse`, `ChangePasswordRequest`, `ChangePasswordResponse`

## 7. Auth API Functions

- [x] 7.1 Create `src/features/auth/api/auth-api.ts` â€” `login(data)` â†’ POST `/auth/login`
- [x] 7.2 Add `getMe()` â†’ GET `/users/me`
- [x] 7.3 Add `changePassword(data)` â†’ POST `/auth/change-password`
- [x] 7.4 Add composite `loginWithUser(data)` â€” login â†’ setToken â†’ getMe â†’ return { token, user }, rollback token on getMe failure

## 8. Auth Store

- [x] 8.1 Create `src/stores/use-auth-store.ts` â€” Zustand store with `token`, `user`, `isAuthenticated` state
- [x] 8.2 Implement `setAuth(token, user)` â€” set state + call `storage.setToken()`
- [x] 8.3 Implement `setUser(user)` â€” update user state only
- [x] 8.4 Implement `logout()` â€” clear state + call `storage.removeToken()`

## 9. Barrel Export

- [x] 9.1 Create `src/features/auth/index.ts` â€” re-export `authApi` functions and all auth types
