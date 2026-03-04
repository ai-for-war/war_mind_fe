## Context

The War Mind frontend has a complete auth API layer (`authApi.loginWithUser`, Zustand `useAuthStore`, token storage) but zero UI. There is no routing setup yet - the app currently renders a single root component. The design system uses shadcn/ui with Tailwind CSS 4, an amber/golden primary color, and full dark mode support.

## Goals / Non-Goals

**Goals:**
- Provide a functional login page that authenticates users via the existing auth API
- Establish routing infrastructure (React Router) with protected/public route patterns
- Create a reusable `AuthLayout` for future auth-related pages (register, forgot password)
- Deliver a polished dark-themed UI matching the War Mind tactical brand identity

**Non-Goals:**
- Registration / sign-up flow (future change)
- Forgot password / reset password flow (future change)
- Remember me / persistent sessions beyond token in localStorage (already handled by storage module)
- OAuth / SSO / third-party authentication
- Animated tactical background effects (keep simple for v1)

## Decisions

### 1. Centered Card layout over Split Screen
**Choice**: Single centered glass card on dark background
**Rationale**: Simpler to implement, inherently mobile-friendly, reduces scope. Split screen can be added later as an enhancement.
**Alternatives**: Split screen (60/40) was considered but adds complexity without functional value for a login form with only 2 fields.

### 2. React Hook Form + Zod for form management
**Choice**: `react-hook-form` with `@hookform/resolvers/zod`
**Rationale**: Type-safe validation, minimal re-renders, established pattern in React ecosystem. Zod schemas can be shared with backend validation shapes.
**Alternatives**: Native form handling with `useState` was considered but lacks scalable validation patterns needed for future forms (register, settings).

### 3. React Router for routing
**Choice**: `react-router-dom` v7 with a centralized `router.tsx`
**Rationale**: De facto React routing library. Supports lazy loading, nested layouts, and route guards. Needed for protected routes pattern.
**Alternatives**: TanStack Router was considered but adds learning curve and the project already uses TanStack Query - mixing both TanStack libs may increase bundle without clear benefit at this scale.

### 4. Glass card with dark background styling
**Choice**: `backdrop-blur-xl` + `bg-card/80` on dark mode, subtle border and shadow. Uses existing CSS variables (`--primary`, `--card`, `--border`).
**Rationale**: Leverages the existing shadcn theme tokens. Glass effect adds visual depth without custom CSS. Amber primary for CTA button ties to the War Mind brand.
**Alternatives**: Flat card (no blur) was considered but lacks the premium feel appropriate for a tactical intelligence product.

### 5. Custom `useLogin` hook isolates login logic
**Choice**: A hook in `features/auth/hooks/use-login.ts` that wraps `authApi.loginWithUser()` + `useAuthStore.setAuth()` + navigation
**Rationale**: Separates API orchestration from UI. The form component stays pure UI, the hook handles side effects. Testable in isolation.
**Alternatives**: Inline logic in the form component - rejected because it violates the feature-first architecture's separation of concerns.

### 6. Component file structure
**Choice**: `login-page.tsx` (full page) imports `login-form.tsx` (form only). `AuthLayout` is in `app/layouts/`.
**Rationale**: Follows the project structure rules - feature-specific components go in `features/auth/components/`, layouts go in `app/layouts/`. The page component handles layout composition while the form is a focused, testable unit.

## Risks / Trade-offs

- **[New dependencies]** Adding `react-router-dom`, `react-hook-form`, `@hookform/resolvers`, `zod` increases bundle size. → These are standard React dependencies that will be used across the entire app, not just login.
- **[No loading skeleton]** The login page renders instantly (no data fetching), so skeleton screens are unnecessary. If the app later adds SSR/server components, this may need revisiting.
- **[Dark mode only consideration]** The design prioritizes dark mode since it matches the tactical brand. Light mode will work via existing CSS variables but receives less visual polish. → Acceptable for v1, can enhance light mode later.
