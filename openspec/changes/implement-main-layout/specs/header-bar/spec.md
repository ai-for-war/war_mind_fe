## ADDED Requirements

### Requirement: Header bar structure
The system SHALL provide an `AppHeader` widget at `src/widgets/header/` that renders a horizontal header bar at the top of the main content area. The header SHALL contain a `SidebarTrigger` on the left and a user navigation section on the right, separated by flexible space.

#### Scenario: Header renders with trigger and user nav
- **WHEN** the header is displayed
- **THEN** the `SidebarTrigger` button appears on the left side and the user navigation appears on the right side

### Requirement: Sidebar trigger in header
The header SHALL include a `SidebarTrigger` component (from shadcn sidebar) on the left side. Clicking it SHALL toggle the sidebar between expanded and collapsed states on desktop, or open/close the Sheet drawer on mobile.

#### Scenario: Click trigger toggles sidebar on desktop
- **WHEN** the user clicks the `SidebarTrigger` on desktop
- **THEN** the sidebar toggles between expanded and collapsed states

#### Scenario: Click trigger opens drawer on mobile
- **WHEN** the user clicks the `SidebarTrigger` on a mobile viewport
- **THEN** the sidebar Sheet drawer slides in from the left

### Requirement: User navigation with avatar dropdown
The header SHALL display a `HeaderUserNav` component on the right side containing a user `Avatar` that, when clicked, opens a `DropdownMenu` with the following items: "Profile" and "Logout".

#### Scenario: User avatar is displayed
- **WHEN** the header is rendered
- **THEN** a user avatar is visible on the right side of the header, showing initials as fallback if no profile image is available

#### Scenario: Clicking avatar opens dropdown menu
- **WHEN** the user clicks on the avatar
- **THEN** a dropdown menu appears with "Profile" and "Logout" options

### Requirement: Logout action from dropdown
When the user selects "Logout" from the dropdown menu, the system SHALL call `useAuthStore.logout()` to clear authentication state and redirect the user to the login page.

#### Scenario: User logs out via header dropdown
- **WHEN** the user clicks "Logout" in the avatar dropdown menu
- **THEN** the auth state is cleared (token removed, user set to null)
- **AND** the user is redirected to `/login`

### Requirement: Profile action placeholder
When the user selects "Profile" from the dropdown menu, no action SHALL be taken for now. This is a placeholder for future implementation.

#### Scenario: User clicks Profile
- **WHEN** the user clicks "Profile" in the avatar dropdown menu
- **THEN** no navigation or action occurs (placeholder for future feature)
