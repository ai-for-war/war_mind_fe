## Why

The backend already supports asynchronous text-to-image generation jobs with durable history, detail reads, pending-only cancellation, and realtime lifecycle events, but the frontend has no dedicated surface to use that capability. A standalone `Text to Image` page is needed now so members can create images for themselves, monitor generation state honestly, and revisit prior results without leaving the authenticated workspace.

## What Changes

- Add a new standalone `Text to Image` route and sidebar entry in the authenticated frontend shell
- Add a studio-style text-to-image workspace with three coordinated regions: compose panel, active preview/detail panel, and personal generation history rail
- Add a create-job form that stays within the current backend contract: `prompt`, `aspect_ratio`, optional `seed`, and optional `prompt_optimizer`
- Add realtime-aware job state handling for `pending`, `processing`, `succeeded`, `failed`, and `cancelled` so the UI reflects backend lifecycle truth without fake progress
- Add a personal generation history experience for the current member, including newest-first summaries, state filters, selection-driven detail loading, and generated image actions after success
- Keep generated images scoped to generation history UX rather than treating them as entries in a separate image library flow

## Capabilities

### New Capabilities
- `text-to-image-ui`: Dedicated frontend experience for creating text-to-image jobs, viewing the active job state, receiving lifecycle updates, and browsing personal generation history

### Modified Capabilities
- `sidebar-navigation`: Add a `Text to Image` navigation item that routes users to the new standalone page in the authenticated app shell

## Impact

- **Affected frontend areas**: `src/app/router.tsx`, sidebar navigation widgets, and a new `src/features/text-to-image/` feature slice for page UI, hooks, state, and types
- **Primary UI surfaces**: a studio workspace page with compose controls on the left, active preview/detail in the center, and a member-scoped generation history rail on the right
- **Data and state integration**: the new UI will consume existing backend create/list/detail/cancel endpoints plus existing Socket.IO infrastructure for lifecycle updates
- **Behavior constraints from backend**: phase 1 must stay within the current API surface, including one image per job, pending-only cancel, durable REST history/detail, and no fake percentage progress
- **Responsive behavior**: the page must preserve the studio mental model on desktop while stacking cleanly on smaller viewports
- **Backend dependency**: no blocking backend change is required; this proposal is a frontend productization of the already-available text-to-image job flow
