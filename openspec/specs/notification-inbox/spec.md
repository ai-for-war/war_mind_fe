## Purpose
Define the authenticated in-app notification inbox, including unread status, inbox presentation, realtime updates, and notification interaction behavior.

## Requirements

### Requirement: Authenticated users can access an in-app notification inbox
The system SHALL provide an in-app notification inbox for authenticated users in the protected application shell. The inbox SHALL expose a dedicated notification trigger with an unread badge and SHALL use the active organization context for all notification data.

#### Scenario: Header shows notification trigger
- **WHEN** an authenticated route inside the protected shell is rendered
- **THEN** the header displays a dedicated notification trigger separate from the avatar menu
- **AND** the trigger displays the unread count when unread notifications exist for the active organization

#### Scenario: Organization scope changes
- **WHEN** the active organization changes
- **THEN** the notification inbox state is reset to the new organization scope
- **AND** unread count and inbox items are fetched for the newly active organization

### Requirement: Notification inbox uses responsive inbox surfaces
The system SHALL present the notification inbox as a rich content surface rather than an action dropdown. The inbox SHALL use a desktop popover and a mobile drawer while preserving the same list data and actions.

#### Scenario: Desktop inbox opens in a popover
- **WHEN** the user activates the notification trigger on a desktop viewport
- **THEN** the system opens the inbox in a popover anchored to the trigger

#### Scenario: Mobile inbox opens in a drawer
- **WHEN** the user activates the notification trigger on a mobile viewport
- **THEN** the system opens the inbox in a drawer

#### Scenario: Inbox shows loading and empty states
- **WHEN** the inbox content is still loading or the current organization has no notifications
- **THEN** the system displays explicit loading or empty states inside the inbox surface

### Requirement: Notification inbox consumes the backend notification contract
The system SHALL integrate with the backend notification API contract using authenticated requests scoped by the active organization. The inbox SHALL support unread count, paginated list retrieval, mark-one-read, and mark-all-read.

#### Scenario: Unread count is loaded
- **WHEN** the protected shell initializes notification state
- **THEN** the system requests `GET /api/v1/notifications/unread-count`
- **AND** uses the returned `unread_count` to render the header badge

#### Scenario: Inbox list is loaded
- **WHEN** the user opens the inbox
- **THEN** the system requests `GET /api/v1/notifications`
- **AND** renders notification items in newest-first order from the backend response

#### Scenario: User marks one notification as read
- **WHEN** the user opens a notification item or explicitly marks it as read
- **THEN** the system calls `POST /api/v1/notifications/{notification_id}/read`
- **AND** updates the item's read state and unread badge to match the successful response

#### Scenario: User marks all notifications as read
- **WHEN** the user activates the mark-all action in the inbox
- **THEN** the system calls `POST /api/v1/notifications/read-all`
- **AND** updates the inbox items and unread badge to reflect that all unread items in the current scope are now read

### Requirement: Notification clicks resolve navigation from backend payloads
The system SHALL resolve notification navigation by preferring `target_type` plus `target_id`. If no supported route mapping exists for the notification `target_type`, the system SHALL fall back to `link` when `link` is present. If neither resolution path exists, the interaction SHALL only mark the notification as read.

#### Scenario: Supported target type navigates by target mapping
- **WHEN** the user activates a notification whose `target_type` is supported by the frontend route resolver
- **THEN** the system marks the notification as read
- **AND** navigates using the resolved route built from `target_type` and `target_id`

#### Scenario: Unsupported target type falls back to link
- **WHEN** the user activates a notification whose `target_type` has no frontend route resolver
- **AND** the notification payload includes a non-null `link`
- **THEN** the system marks the notification as read
- **AND** navigates to the provided `link`

#### Scenario: No navigation target is available
- **WHEN** the user activates a notification whose `target_type` has no frontend route resolver
- **AND** the notification payload has `link = null`
- **THEN** the system marks the notification as read
- **AND** does not navigate away from the current route

### Requirement: Realtime notification creation updates the inbox and shows a toast
The system SHALL subscribe to `notification:created` through the shared socket layer for the active organization. Every new notification event delivered to the active organization SHALL update the inbox state and show a toast.

#### Scenario: Active-organization event arrives
- **WHEN** a `notification:created` event is received for the active organization
- **THEN** the system adds the new notification to the inbox state
- **AND** updates the unread badge
- **AND** shows a toast announcing the new notification

#### Scenario: Toast click follows the same interaction rules as inbox click
- **WHEN** the user activates the toast for a newly received notification
- **THEN** the system applies the same mark-read and navigation resolution behavior used by inbox item clicks
