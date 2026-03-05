## ADDED Requirements

### Requirement: Organization switcher component
The system SHALL provide an `OrgSwitcher` component at `src/widgets/sidebar/components/org-switcher.tsx` that displays the active organization and provides a dropdown menu to switch between organizations. The component SHALL consume `useOrganizationStore` for data and actions.

#### Scenario: Active organization is displayed
- **WHEN** the sidebar renders with an active organization in the store
- **THEN** the `OrgSwitcher` in the sidebar footer displays: an avatar (2-character initials from org name, uppercase, `rounded-lg`, `bg-sidebar-primary`), the organization name (`font-semibold`, truncated if long), and the user's role in that org (`text-xs text-muted-foreground`)

#### Scenario: No active organization
- **WHEN** the organization store has `activeOrganization` as `null`
- **THEN** the `OrgSwitcher` SHALL NOT render (return `null`)

### Requirement: Dropdown lists all organizations
The `OrgSwitcher` dropdown SHALL use shadcn `DropdownMenu` with `DropdownMenuContent` positioned `side="top"` and `align="start"`. The content SHALL include a `DropdownMenuLabel` with text "Organizations" and a `DropdownMenuRadioGroup` listing all organizations from the store.

#### Scenario: User has multiple organizations
- **WHEN** the user clicks the org switcher trigger and has 3 organizations
- **THEN** the dropdown opens above the trigger and shows all 3 organizations, each with an avatar (initials), org name, and the currently active org has a radio indicator

#### Scenario: User has single organization
- **WHEN** the user clicks the org switcher trigger and has only 1 organization
- **THEN** the dropdown opens and shows 1 organization item with radio indicator (active)

### Requirement: Switch organization via dropdown
When the user selects a different organization in the dropdown, the component SHALL call `setActiveOrganization(orgId)` from the organization store. The dropdown SHALL close after selection. The trigger SHALL re-render to display the newly selected organization.

#### Scenario: Switch to different org
- **WHEN** the user selects "Beta Team" in the dropdown while "Alpha Corp" is active
- **THEN** `setActiveOrganization("beta-team-id")` is called, the dropdown closes, and the trigger now displays "Beta Team" with its role

#### Scenario: Select already active org
- **WHEN** the user selects the currently active organization
- **THEN** `setActiveOrganization` is called with the same orgId, the dropdown closes, and no visible change occurs

### Requirement: Trigger uses SidebarMenuButton
The trigger SHALL use `SidebarMenuButton size="lg"` wrapped in `SidebarMenu > SidebarMenuItem` to match sidebar styling. The button SHALL contain: an avatar div (left), org name + role text block (center), and a `ChevronsUpDown` icon (right, `size-4 text-muted-foreground`).

#### Scenario: Sidebar expanded state
- **WHEN** the sidebar is in expanded state
- **THEN** the trigger displays avatar, org name, role text, and chevron icon

#### Scenario: Sidebar collapsed state
- **WHEN** the sidebar is in collapsed (icon-only) state
- **THEN** only the avatar is visible in the trigger, text and chevron are hidden by sidebar's built-in responsive behavior

### Requirement: Avatar initials generation
The avatar SHALL display the first 2 characters of the organization name, uppercased. The avatar container SHALL use `rounded-lg bg-sidebar-primary text-sidebar-primary-foreground` styling with fixed dimensions.

#### Scenario: Short org name
- **WHEN** the organization name is "AI"
- **THEN** the avatar displays "AI"

#### Scenario: Long org name
- **WHEN** the organization name is "Alpha Corporation"
- **THEN** the avatar displays "AL"

#### Scenario: Single character org name
- **WHEN** the organization name is "X"
- **THEN** the avatar displays "X"

### Requirement: Dropdown item layout
Each item in the dropdown radio group SHALL display an avatar (smaller, `size-6 rounded-sm`) with org name initials, followed by the organization name as text. The `value` prop of each radio item SHALL be `organization.id`.

#### Scenario: Dropdown item renders correctly
- **WHEN** the dropdown is open with org "Gamma Inc" (role: admin)
- **THEN** the item shows a small "GA" avatar followed by "Gamma Inc" text

### Requirement: Dropdown content styling
The `DropdownMenuContent` SHALL use `side="top"` (opens upward from footer), `align="start"` (left-aligned), `sideOffset={4}`, and `className="min-w-56 rounded-lg"` to ensure adequate width and visual consistency.

#### Scenario: Dropdown opens upward
- **WHEN** the user clicks the org switcher trigger in the sidebar footer
- **THEN** the dropdown menu appears above the trigger, not below it
