## Why

The application has auth API infrastructure (`authApi.loginWithUser`, Zustand auth store, token storage) but no user-facing login UI. Users currently have no way to authenticate through the browser. A login page is needed as the entry point to the application.

## What Changes

- Add a centered glass-card login page with dark tactical aesthetic matching the War Mind brand (amber primary, dark background)
- Add a login form component with email/password fields, validation (React Hook Form + Zod), error handling, and loading states
- Add a custom `useLogin` hook encapsulating the login flow (API call + store update + navigation)
- Add an `AuthLayout` wrapper for unauthenticated pages (centered content, dark background)
- Install required shadcn/ui primitives: `input`, `label`, `card`
- Add routing setup with React Router: public `/login` route and protected route guard

## Capabilities

### New Capabilities
- `login-page`: Login page UI including form, validation, error display, loading states, and navigation after successful authentication
- `auth-routing`: React Router setup with public/protected route guards and auth-based redirects

### Modified Capabilities
- `auth-api`: Add barrel export for login page component so it can be consumed by the router

## Impact

- **New dependencies**: `react-router-dom`, `react-hook-form`, `@hookform/resolvers`, `zod`
- **New files**: `features/auth/components/login-page.tsx`, `features/auth/components/login-form.tsx`, `features/auth/hooks/use-login.ts`, `features/auth/schemas/login.schema.ts`, `app/layouts/auth-layout.tsx`, `app/router.tsx`
- **Modified files**: `features/auth/index.ts` (add component exports)
- **Consumes**: `authApi.loginWithUser()`, `useAuthStore.setAuth()`, shadcn/ui components
