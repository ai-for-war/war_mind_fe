## MODIFIED Requirements

### Requirement: Header bar structure
The system SHALL provide an `AppHeader` widget at `src/widgets/header/` that renders a horizontal header bar at the top of the main content area. The header SHALL contain a `SidebarTrigger` on the left and a right-side actions cluster on the right, separated by flexible space. The right-side actions cluster SHALL include a dedicated notification trigger and the user navigation section.

#### Scenario: Header renders with trigger and right-side actions
- **WHEN** the header is displayed
- **THEN** the `SidebarTrigger` button appears on the left side
- **AND** the right side shows a notification trigger together with the user navigation section

## ADDED Requirements

### Requirement: Header exposes notification unread status
The header SHALL expose notification unread status through a dedicated notification trigger that is visually separate from the user avatar dropdown.

#### Scenario: Header shows unread badge when unread notifications exist
- **WHEN** the header is rendered and the active organization has unread notifications
- **THEN** the notification trigger displays the unread count badge

#### Scenario: Header trigger opens the notification inbox
- **WHEN** the user activates the notification trigger
- **THEN** the system opens the notification inbox surface without opening the avatar dropdown
