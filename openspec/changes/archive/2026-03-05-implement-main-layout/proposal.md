## Why

After login, the application currently renders a blank placeholder page with no navigation structure. Users need a persistent layout with sidebar navigation and a header bar to access the two core features: Multi-Agent and Voice Cloning. This is the foundational UI shell that all authenticated pages will live inside.

## What Changes

- Add a `MainLayout` component (`src/app/layouts/main-layout.tsx`) that composes a sidebar and header around an `<Outlet />` for route content
- Create a `sidebar` widget (`src/widgets/sidebar/`) with collapsible sidebar containing two navigation items: Multi-Agent and Voice Cloning
- Create a `header` widget (`src/widgets/header/`) with sidebar toggle trigger and user avatar dropdown (Profile, Logout)
- Add `use-app-store.ts` Zustand store for sidebar UI state
- Install 7 new shadcn/ui components: `sidebar`, `sheet`, `tooltip`, `separator`, `skeleton`, `avatar`, `dropdown-menu`
- Update `router.tsx` to wrap protected routes in `MainLayout`, add `/multi-agent` and `/voice-cloning` routes, and redirect `/` to `/voice-cloning`
- Dark theme only (fixed)
- Sidebar uses `variant="sidebar"` (fixed position, pushes content) with `collapsible="icon"` (collapses to icon-only mode)

## Capabilities

### New Capabilities
- `main-layout`: Application shell layout composing sidebar widget, header widget, and content outlet for all authenticated pages
- `sidebar-navigation`: Collapsible sidebar widget with app logo, two nav items (Multi-Agent, Voice Cloning), mobile-responsive Sheet drawer, icon-only collapsed mode, and keyboard shortcut toggle (Ctrl+B)
- `header-bar`: Header widget with sidebar toggle trigger and user avatar dropdown menu (Profile, Logout)
- `app-ui-state`: Zustand store managing sidebar open/collapsed state

### Modified Capabilities
- `auth-routing`: Add MainLayout as layout wrapper for protected routes, add `/multi-agent` and `/voice-cloning` route paths, redirect `/` to `/voice-cloning`

## Impact

- **New directories**: `src/widgets/sidebar/`, `src/widgets/header/`
- **New files**: `src/app/layouts/main-layout.tsx`, `src/stores/use-app-store.ts`
- **Modified files**: `src/app/router.tsx`
- **New dependencies**: 7 shadcn/ui components (`sidebar`, `sheet`, `tooltip`, `separator`, `skeleton`, `avatar`, `dropdown-menu`) and their Radix UI sub-dependencies
- **Removed**: `src/App.tsx` will no longer be used as the root page component
