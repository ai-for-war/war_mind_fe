## 1. Install shadcn/ui Dependencies

- [ ] 1.1 Install shadcn components: `separator`, `skeleton`, `tooltip`, `sheet`, `scroll-area`, `collapsible`, `avatar`, `breadcrumb`, `dropdown-menu`, `sidebar`
- [ ] 1.2 Verify all new component files exist in `src/components/ui/` and the `useIsMobile` hook is generated

## 2. App UI State Store

- [ ] 2.1 Create `src/stores/use-app-store.ts` Zustand store with `isSidebarOpen` (default `true`), `toggleSidebar`, and `setSidebarOpen` actions

## 3. Sidebar Widget

- [ ] 3.1 Create `src/widgets/sidebar/` directory structure: `components/`, `index.ts`
- [ ] 3.2 Implement `nav-main.tsx` — config-driven navigation menu rendering two items (Multi-Agent with `Bot` icon, Voice Cloning with `Mic` icon) using `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton` with `isActive` derived from current route via `useLocation`
- [ ] 3.3 Implement `app-sidebar.tsx` — compose `Sidebar` (`variant="sidebar"`, `collapsible="icon"`) with `SidebarHeader` (logo + "WAR MIND"), `SidebarContent` (renders `NavMain`), `SidebarFooter` (empty), and `SidebarRail`
- [ ] 3.4 Create barrel export `src/widgets/sidebar/index.ts` exporting `AppSidebar`

## 4. Header Widget

- [ ] 4.1 Create `src/widgets/header/` directory structure: `components/`, `index.ts`
- [ ] 4.2 Implement `header-user-nav.tsx` — `Avatar` with fallback initials + `DropdownMenu` with "Profile" (placeholder, no action) and "Logout" (calls `useAuthStore.logout()` and navigates to `/login`)
- [ ] 4.3 Implement `app-header.tsx` — horizontal header with `SidebarTrigger` on the left, flex spacer, and `HeaderUserNav` on the right
- [ ] 4.4 Create barrel export `src/widgets/header/index.ts` exporting `AppHeader`

## 5. Main Layout

- [ ] 5.1 Create `src/app/layouts/main-layout.tsx` — `SidebarProvider` wrapping `AppSidebar` + `SidebarInset` containing `AppHeader` and `<Outlet />`

## 6. Placeholder Pages

- [ ] 6.1 Create placeholder page component for Voice Cloning at `src/features/voice-cloning/components/voice-cloning-page.tsx` with title text
- [ ] 6.2 Create placeholder page component for Multi-Agent at `src/features/multi-agent/components/multi-agent-page.tsx` with title text
- [ ] 6.3 Create barrel exports for both feature folders

## 7. Router Update

- [ ] 7.1 Update `src/app/router.tsx` — wrap protected routes in `MainLayout`, add `/voice-cloning` and `/multi-agent` child routes, redirect `/` to `/voice-cloning`, update catch-all to redirect authenticated users to `/voice-cloning`
- [ ] 7.2 Remove or repurpose `src/App.tsx` (no longer used as root page)

## 8. Verification

- [ ] 8.1 Verify sidebar renders expanded with two nav items, collapses to icons on toggle, tooltips appear on hover in collapsed mode
- [ ] 8.2 Verify header renders with sidebar trigger and user avatar dropdown, logout clears auth and redirects
- [ ] 8.3 Verify route navigation works: `/` → redirects to `/voice-cloning`, `/multi-agent` renders placeholder, unknown routes redirect correctly
- [ ] 8.4 Verify mobile responsive: sidebar renders as Sheet drawer on small viewports
