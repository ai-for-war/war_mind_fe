## Why

Stock research currently supports only manual report creation, while the backend now exposes an organization-scoped schedule contract for recurring stock research jobs. This change lets users manage automated research cadence from the existing Stock Research workspace without inventing unsupported batch, watchlist, or per-schedule report-history behavior.

## What Changes

- Add a `Schedules` tab beside the existing `Reports` view on the protected Stock Research page.
- Add a schedule management workspace for listing schedules, selecting one schedule, viewing schedule details, and manually refreshing schedule data.
- Add create and edit schedule flows covering symbol, runtime config, cadence type, hour, and weekly weekdays.
- Add schedule actions for pause, resume, and delete with toast feedback and destructive confirmation where appropriate.
- Reuse the existing manual `New Report` flow for ad hoc report generation instead of exposing the backend `run-now` endpoint in the UI.
- Use the stock research runtime catalog to populate provider, model, and reasoning controls for schedules.
- Preserve backend contract boundaries: one symbol per schedule, fixed `Asia/Saigon` hour semantics for daily/weekly schedules, no timezone picker, no watchlist/batch scheduling, and no generated-report history tied to a schedule until the report API exposes that relationship.

## Capabilities

### New Capabilities

- `stock-research-schedules`: Schedule API integration and UI behavior for creating, listing, viewing, editing, pausing, resuming, and deleting stock research schedules.

### Modified Capabilities

- `stock-research-page`: Extend the Stock Research workspace from a reports-only page into a tabbed workspace with `Reports` and `Schedules`, while preserving the existing manual report workflow and explicit refresh behavior.

## Impact

- Affected code: `src/features/stock-research/` types, API client, hooks, page composition, schedule-specific components, and shared runtime/symbol form utilities.
- APIs: `GET /api/v1/stock-research/reports/catalog`, `GET /api/v1/stock-research/schedules`, `GET /api/v1/stock-research/schedules/{schedule_id}`, `POST /api/v1/stock-research/schedules`, `PATCH /api/v1/stock-research/schedules/{schedule_id}`, `POST /api/v1/stock-research/schedules/{schedule_id}/pause`, `POST /api/v1/stock-research/schedules/{schedule_id}/resume`, and `DELETE /api/v1/stock-research/schedules/{schedule_id}`.
- Explicitly unused API: `POST /api/v1/stock-research/schedules/{schedule_id}/run-now`; users will continue to use the existing `New Report` action for manual reports.
- Dependencies: no new packages expected. Use existing shadcn primitives already installed in the repo, including `tabs`, `toggle-group`, `dialog`, `alert-dialog`, `field`, `select`, `dropdown-menu`, `scroll-area`, `empty`, `skeleton`, `badge`, `button`, and `sonner`.
- UX scope: desktop-first operational workspace inside `MainLayout`, with internal scrolling and toast-based request feedback.
