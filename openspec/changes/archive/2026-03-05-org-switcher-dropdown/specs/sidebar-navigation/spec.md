## MODIFIED Requirements

### Requirement: Sidebar component structure
The system SHALL provide an `AppSidebar` widget at `src/widgets/sidebar/` that renders a shadcn `Sidebar` component with `variant="sidebar"` and `collapsible="icon"`. The sidebar SHALL contain three sections: `SidebarHeader` (logo/app name), `SidebarContent` (navigation menu), and `SidebarFooter` (organization switcher). The `SidebarFooter` SHALL render the `OrgSwitcher` component.

#### Scenario: Sidebar renders with three sections
- **WHEN** the sidebar is displayed
- **THEN** it renders a header section with the app logo/name, a content section with navigation items, and a footer section containing the organization switcher

#### Scenario: Footer displays active organization
- **WHEN** the sidebar is displayed and the user has an active organization
- **THEN** the footer section shows the `OrgSwitcher` component displaying the active organization name, avatar, and role
