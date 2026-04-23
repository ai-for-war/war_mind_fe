## 1. Notification data layer

- [ ] 1.1 Add notification types that mirror the backend notification contract, including unread count, list response, mark-read responses, and nullable payload fields.
- [ ] 1.2 Implement notification API functions for unread count, paginated inbox fetch, mark-one-read, and mark-all-read using the organization-aware API client.
- [ ] 1.3 Add notification query keys, list/count hooks, and mutation helpers with cache updates or invalidation that keep REST as the source of truth.

## 2. Notification routing and realtime behavior

- [ ] 2.1 Add a notification target resolver that prefers `target_type` plus `target_id`, falls back to `link`, and safely supports the no-navigation case.
- [ ] 2.2 Add notification socket subscription handling for `notification:created` using the shared socket layer with active-organization scoping.
- [ ] 2.3 Add toast behavior for every newly received notification and make toast clicks reuse the same mark-read and navigation flow as inbox item clicks.

## 3. Notification inbox UI

- [ ] 3.1 Build the notification inbox components under a dedicated notifications feature area, including list row, empty state, loading state, and mark-all action.
- [ ] 3.2 Implement the responsive inbox surfaces with `Popover` on desktop and `Drawer` on mobile while preserving the same data and actions.
- [ ] 3.3 Ensure notification item interactions update read state correctly and render safe optional metadata without depending on unsupported payload shapes.

## 4. Header integration

- [ ] 4.1 Update the authenticated header composition so a dedicated notification trigger appears separately from the avatar dropdown.
- [ ] 4.2 Add unread badge rendering and open/close behavior for the notification trigger without regressing existing sidebar or user-nav interactions.
- [ ] 4.3 Reset or refetch notification state correctly when the active organization changes inside the protected shell.

## 5. Verification

- [ ] 5.1 Verify unread count, inbox loading, mark-one-read, mark-all-read, and realtime notification flows against the documented backend contract.
- [ ] 5.2 Verify supported target navigation, `link` fallback, and the mark-read-only path when no destination is available.
- [ ] 5.3 Run the relevant lint or test checks for the touched frontend modules and fix any introduced issues.
