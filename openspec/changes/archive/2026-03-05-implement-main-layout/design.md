## Context

The application currently has only an authentication flow (login page with `AuthLayout`). After successful login, authenticated users land on a blank placeholder (`App.tsx`). There is no navigation structure, no persistent layout shell, and no way to switch between features.

The project follows a Feature-First Architecture with a `widgets/` layer for large composite UI blocks (defined in project rules but not yet created). The tech stack includes React 19, react-router-dom 7, Zustand, Tailwind CSS 4, and shadcn/ui (4 components installed so far). The app uses dark theme throughout (`bg-neutral-950` in auth layout).

Two core features need navigation entries: Multi-Agent and Voice Cloning. The default landing page after login is Voice Cloning (`/voice-cloning`).

## Goals / Non-Goals

**Goals:**
- Provide a persistent sidebar + header layout shell for all authenticated pages
- Enable navigation between Multi-Agent and Voice Cloning features
- Support sidebar collapse to icon-only mode on desktop
- Support mobile-responsive sidebar (Sheet drawer)
- Follow existing project architecture rules (widgets layer, dependency direction, barrel exports)

**Non-Goals:**
- Light/dark theme toggle (dark only for now)
- Breadcrumb navigation (deferred)
- User profile info in sidebar footer (deferred)
- Notification system or search in header (deferred)
- Page-specific content implementation (Multi-Agent and Voice Cloning pages are placeholder only)

## Decisions

### Decision 1: Use shadcn/ui Sidebar component as the foundation

**Choice**: Use the full shadcn `Sidebar` component system (24+ sub-components + `useSidebar` hook).

**Rationale**: shadcn's Sidebar is purpose-built for exactly this layout pattern. It handles mobile responsiveness (auto-converts to Sheet), keyboard shortcuts (Ctrl+B), collapsible states (icon-only), cookie persistence, and Tooltip integration out of the box. Building from scratch would duplicate all this functionality.

**Alternatives considered**:
- Custom sidebar from scratch — rejected: significant effort to replicate responsive, accessible, keyboard-navigable sidebar
- Headless UI sidebar — rejected: no dedicated sidebar component, would need manual composition

### Decision 2: Widget architecture for Sidebar and Header

**Choice**: Create `src/widgets/sidebar/` and `src/widgets/header/` following the project's widget pattern.

**Rationale**: Both sidebar and header are composite UI blocks that combine multiple sub-components, have their own logic (navigation state, user menu), appear across all pages, and don't belong to a single feature. This matches the widget criteria defined in project rules.

**Structure**:
- `widgets/sidebar/` — `AppSidebar` (main), `NavMain` (menu items)
- `widgets/header/` — `AppHeader` (main), `HeaderUserNav` (avatar + dropdown)
- Each widget has `components/`, `index.ts` barrel export

### Decision 3: MainLayout in app/layouts composing widgets

**Choice**: `src/app/layouts/main-layout.tsx` wraps `SidebarProvider` → `AppSidebar` + `SidebarInset` → `AppHeader` + `<Outlet />`.

**Rationale**: Follows the existing pattern established by `auth-layout.tsx`. The layout lives in `app/layouts/` and composes widgets. The `app/` layer is allowed to import from `widgets/` per dependency rules.

### Decision 4: Sidebar variant and collapsible mode

**Choice**: `variant="sidebar"` with `collapsible="icon"`.

**Rationale**: `variant="sidebar"` is the standard fixed sidebar that pushes content — appropriate for a workspace app. `collapsible="icon"` allows the sidebar to shrink to icon-width (3rem) instead of disappearing entirely, maintaining navigation context while reclaiming screen space.

**Alternatives considered**:
- `variant="floating"` — rejected: overlays content, better for secondary panels
- `variant="inset"` — rejected: adds visual container/border-radius, more suited for dashboard-style apps
- `collapsible="offcanvas"` — rejected: fully hides sidebar, loses navigation context

### Decision 5: Minimal Zustand store for app UI state

**Choice**: Create `src/stores/use-app-store.ts` with sidebar open state only.

**Rationale**: While shadcn's `SidebarProvider` manages sidebar state internally (including cookie persistence), having a Zustand store provides a centralized place for future UI state (theme, notification panel, etc.). For now, it only tracks sidebar state synced with `SidebarProvider`.

Note: The shadcn sidebar already persists its state via a cookie (`sidebar_state`). The Zustand store complements this by making the state accessible to components outside the `SidebarProvider` tree if needed.

### Decision 6: Router restructure with MainLayout wrapper

**Choice**: Nest all protected routes under a `MainLayout` element in the router. Add `/multi-agent` and `/voice-cloning` as child routes. Redirect `/` to `/voice-cloning`.

**Rationale**: react-router-dom's nested layout route pattern (layout component renders `<Outlet />`) is the standard approach. The redirect from `/` to `/voice-cloning` ensures authenticated users always land on a meaningful page.

### Decision 7: Navigation items driven by config array

**Choice**: Define sidebar nav items as a typed configuration array rather than hardcoding JSX.

**Rationale**: Makes it trivial to add/remove/reorder menu items later. Each nav item config includes: `title`, `url`, `icon`. The `NavMain` component maps over this array to render `SidebarMenuButton` items. Active state is derived by matching `url` against the current route path.

## Risks / Trade-offs

- **[shadcn sidebar is opinionated]** → The sidebar component has its own patterns for state management and mobile handling. Accept these patterns rather than fighting them. If customization is needed later, the source code is in `components/ui/sidebar.tsx` and can be modified directly.

- **[7 new shadcn dependencies at once]** → Large batch install increases bundle size. Mitigated by tree-shaking (only imported components are bundled) and the fact that these are all necessary for the layout.

- **[Cookie-based sidebar persistence]** → shadcn sidebar uses a cookie to persist open/collapsed state. This is fine for now but may need to move to localStorage or user preferences API later for multi-device sync.

- **[Placeholder pages]** → Multi-Agent and Voice Cloning pages will be empty placeholders initially. This is intentional — layout comes first, feature content follows.
