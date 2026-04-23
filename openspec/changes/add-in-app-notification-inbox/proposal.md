## Why

The backend now exposes an authenticated in-app notification contract, but the frontend has no inbox surface to show unread state, react to realtime events, or let users open notification targets inside the app. This leaves users without visibility into completed or failed backend workflows that are already being emitted.

## What Changes

- Add an authenticated in-app notification inbox in the application header with an unread badge and a dedicated trigger separate from the user avatar menu
- Add a responsive notification surface that uses a desktop popover and a mobile drawer to display the inbox list, empty/loading states, and a mark-all-as-read action
- Add frontend notification data flow for unread-count fetch, paginated inbox fetch, mark-one-read, mark-all-read, and realtime `notification:created` subscription scoped to the active organization
- Add realtime toast behavior so every newly received notification immediately surfaces a toast while also updating the inbox badge and list state
- Add notification navigation resolution that prefers `target_type` plus `target_id`, falls back to `link` when available, and otherwise only marks the notification as read without navigating

## Capabilities

### New Capabilities
- `notification-inbox`: In-app notification badge, inbox surface, realtime updates, toast delivery, and notification interaction behavior for authenticated users

### Modified Capabilities
- `header-bar`: Extend the authenticated header requirements to include a dedicated notification trigger alongside the existing sidebar trigger and user navigation

## Impact

- **Existing UI areas**: `src/widgets/header/`, authenticated layout shell, and route navigation behavior for notification targets
- **New frontend modules**: notification feature API layer, query/state hooks, socket subscription handling, and inbox/presentation components
- **Existing infrastructure reused**: shared socket client layer, active-organization context, router navigation, and app-level `sonner` toaster
- **No backend changes**: reuse the current notification REST endpoints and `notification:created` socket event contract from `docs/notification/frontend_integration_guide.md`
