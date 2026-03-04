## 1. Dependencies & Setup

- [ ] 1.1 Install `react-router-dom`, `react-hook-form`, `@hookform/resolvers`, `zod`
- [ ] 1.2 Install shadcn/ui components: `input`, `label`, `card`

## 2. Login Form Schema & Hook

- [ ] 2.1 Create Zod validation schema at `features/auth/schemas/login.schema.ts` (email: required + valid format, password: required)
- [ ] 2.2 Create `useLogin` hook at `features/auth/hooks/use-login.ts` (calls `authApi.loginWithUser`, updates auth store, handles navigation with post-login redirect)

## 3. Auth Layout

- [ ] 3.1 Create `AuthLayout` at `app/layouts/auth-layout.tsx` (full-viewport centered container with dark background)

## 4. Login Page UI

- [ ] 4.1 Create `LoginForm` component at `features/auth/components/login-form.tsx` (email input, password input with visibility toggle, submit button with loading state, validation errors, API error display)
- [ ] 4.2 Create `LoginPage` component at `features/auth/components/login-page.tsx` (composes AuthLayout + glass card + LoginForm, redirects if already authenticated)

## 5. Routing

- [ ] 5.1 Create `ProtectedRoute` guard component at `app/router.tsx` (redirects to `/login` if unauthenticated, preserves original path in location state)
- [ ] 5.2 Create centralized router at `app/router.tsx` with public `/login` route, protected root route, and catch-all redirect
- [ ] 5.3 Wire `RouterProvider` into the application entry point (`main.tsx`)

## 6. Barrel Exports & Integration

- [ ] 6.1 Update `features/auth/index.ts` barrel to export `LoginPage` and `useLogin`
