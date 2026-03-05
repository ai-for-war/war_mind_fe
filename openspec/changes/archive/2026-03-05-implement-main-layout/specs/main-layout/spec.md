## ADDED Requirements

### Requirement: Main layout shell structure
The system SHALL provide a `MainLayout` component at `src/app/layouts/main-layout.tsx` that renders a full-viewport layout composed of a sidebar on the left and a main content area on the right. The layout SHALL use shadcn `SidebarProvider` as the root wrapper, `AppSidebar` widget for the sidebar, and `SidebarInset` for the main content area.

#### Scenario: Layout renders sidebar and content area
- **WHEN** an authenticated user navigates to any protected route
- **THEN** the `MainLayout` renders with the `AppSidebar` widget on the left and the main content area (containing the header and page content) on the right

### Requirement: Content area renders route outlet
The main content area inside `SidebarInset` SHALL render the `AppHeader` widget at the top followed by a content region that displays the current route's component via react-router-dom `<Outlet />`.

#### Scenario: Route content displays below header
- **WHEN** a user navigates to `/voice-cloning`
- **THEN** the `AppHeader` is rendered at the top of the content area and the Voice Cloning page component is rendered below it via `<Outlet />`

### Requirement: Layout uses dark theme
The `MainLayout` SHALL apply dark theme styling consistent with the application's dark-only design. The layout background SHALL use dark colors.

#### Scenario: Dark theme applied
- **WHEN** the `MainLayout` renders
- **THEN** the layout uses dark background colors and light text throughout the sidebar, header, and content area
