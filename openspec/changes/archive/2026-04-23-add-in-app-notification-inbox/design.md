## Context

The authenticated frontend shell already has a minimal top header with a sidebar trigger on the left and the avatar menu on the right. The backend now exposes a complete in-app notification contract under `/api/v1/notifications` plus a `notification:created` Socket.IO event, but there is no frontend feature area that consumes it.

This change crosses multiple frontend concerns:
- header composition and right-side actions
- notification REST API integration and cache management
- realtime event subscription on top of the shared socket layer
- route resolution from notification payloads
- desktop and mobile inbox presentation patterns

The backend contract has important constraints that the frontend must respect:
- notifications are scoped by authenticated user plus active organization
- REST is the complete source of truth; socket is only a signal for new items
- `target_type` and `target_id` are the primary navigation inputs
- `link` is optional and cannot be assumed to exist
- `metadata` is optional and not globally schema-fixed

## Goals / Non-Goals

**Goals:**
- Add a dedicated notification trigger in the authenticated header with an unread badge.
- Provide a desktop popover inbox and a mobile drawer inbox that share the same notification data and interaction model.
- Integrate unread count, paginated inbox fetch, mark-one-read, mark-all-read, and realtime `notification:created` updates.
- Always show a toast when a new notification is received.
- Resolve notification navigation by preferring `target_type` plus `target_id`, then falling back to `link`, and otherwise only marking the item as read.

**Non-Goals:**
- Browser push notifications, service workers, or OS-level notification permissions.
- Notification creation, editing, filtering, searching, or categorization beyond the backend payload already provided.
- A dedicated full-page notification center route in v1.
- Support for speculative target mappings that are not backed by a known frontend route.
- Rich inline error banners inside the inbox for routine failures that can be handled with toast feedback.

## Decisions

### Decision: Use a dedicated inbox panel, not a dropdown menu
The notification surface will be implemented as a rich inbox panel with `Popover` on desktop and `Drawer` on mobile rather than a `DropdownMenu`.

Why:
- The surface contains scrollable content, empty/loading states, list items, and a mark-all action, which fits a content panel better than an action menu.
- This keeps the avatar dropdown focused on account actions and preserves clear semantics in the header.
- The project already has `popover`, `drawer`, `scroll-area`, and related primitives installed, so this does not add dependencies.

Alternatives considered:
- Use `DropdownMenu` for both desktop and mobile.
  Rejected because the notification UI is not a short action list and would be constrained by menu semantics and styling.

### Decision: Create a feature-owned notification module with shared data hooks
The implementation will add a dedicated `src/features/notifications/` area that owns API calls, types, query keys, socket subscription glue, and UI components.

Why:
- The feature has multiple responsibilities that do not belong inside `src/widgets/header/`.
- This matches the repo's feature-first organization and keeps the header focused on composition.
- It avoids mixing notification cache updates and routing logic into generic layout components.

Alternatives considered:
- Keep all notification logic directly inside the header widget.
  Rejected because the feature will quickly outgrow a single widget file and would violate the repo guidance to split child components and utility logic early.

### Decision: Treat REST as source of truth and use socket only to reconcile forward
Unread count and inbox items will be loaded from REST queries. The socket event will optimistically prepend the new item into the inbox cache, increment the badge state, and show a toast, while preserving REST-backed refetch paths as the canonical recovery mechanism.

Why:
- The backend guide explicitly states that REST is the complete state source.
- This keeps the feature correct across reconnects, org switches, and missed socket events.
- It lets the UI feel realtime without inventing a socket-only state model.

Alternatives considered:
- Rely on socket events as the primary inbox state source after initial load.
  Rejected because missed events or reconnect gaps would make badge and list state drift.

### Decision: Prefer deterministic route resolution from `target_type` and `target_id`
Notification click handling will use a frontend resolver keyed by `target_type`, with `target_id` as the route parameter source. If no resolver exists for the type, the UI will fall back to `link` when present. If neither path exists, the interaction will only mark the notification as read.

Why:
- The user explicitly chose `target_type` and `target_id` as the primary navigation source.
- This avoids coupling the main UX to optional backend route strings.
- It allows future notification types to degrade safely instead of breaking click behavior.

Alternatives considered:
- Always navigate via `link` when present.
  Rejected because it makes the frontend overly dependent on a nullable field the backend documents as optional.

### Decision: Always emit a toast for new realtime notifications
Every incoming `notification:created` event for the active organization will show a toast in addition to updating the badge and inbox cache.

Why:
- The user explicitly requested always-on toast visibility for new notifications.
- It gives immediate feedback even when the inbox panel is closed.
- The app already standardizes transient feedback through `sonner`.

Alternatives considered:
- Only update the badge.
  Rejected because it hides new notifications unless the user happens to notice the header.
- Only toast when the inbox is closed.
  Rejected because the requested behavior is to always toast.

### Decision: Reset notification scope on organization changes
Notification queries, unread badge state, and the active subscription handling will be scoped to the active organization and reset/refetch when the organization changes.

Why:
- The backend contract scopes inbox data by `current_user + organization`.
- Carrying badge or item state across organizations would be incorrect and confusing.
- The main layout already resets other realtime/workspace state on org changes, so notification behavior should align.

Alternatives considered:
- Keep previous organization notification cache visible until the next fetch completes.
  Rejected because it risks showing the wrong inbox under the new organization context.

## Risks / Trade-offs

- [Notification type has no known route mapping] -> Fall back to `link`, and if absent mark the item as read without navigation.
- [Badge/list drift after reconnect or mutation race] -> Keep REST queries authoritative and invalidate/refetch after mutating actions where needed.
- [Toast fatigue from frequent notification bursts] -> Accept this as an explicit product choice for v1 and keep the toast content concise.
- [Header crowding on smaller viewports] -> Use a compact trigger on desktop and move the inbox body into `Drawer` on mobile.
- [Nullable `metadata` or unsupported metadata shape] -> Render only safe, optional adornments such as known chips when present; never depend on metadata for core interaction.

## Migration Plan

1. Add the notification feature module with typed API and query helpers using the current authenticated API client and active organization header behavior.
2. Add the notification trigger to the authenticated header and wire the responsive inbox surface.
3. Subscribe to `notification:created` through the shared socket layer with active-organization filtering.
4. Release with current backend routes and event contract only; no backend migration is required.
5. If rollback is needed, remove the header trigger and feature module while leaving the backend contract untouched.

## Open Questions

- None for proposal readiness. The interaction rules for toast behavior, target resolution, and `link` fallback have been clarified.
