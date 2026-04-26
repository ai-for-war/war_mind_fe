## 1. Schedule data layer

- [ ] 1.1 Add stock research schedule types for status, cadence type, weekday enum, schedule request/response definitions, list response, create payload, update payload, and delete response.
- [ ] 1.2 Add schedule normalization and formatting utilities for schedule ids, symbols, page size, cadence labels, weekday labels, Vietnam-time hour labels, and request payload construction.
- [ ] 1.3 Extend the stock research API client with list schedules, get schedule detail, create schedule, update schedule, pause schedule, resume schedule, and delete schedule functions.
- [ ] 1.4 Add React Query keys and hooks for schedule list, selected schedule detail, create, update, pause, resume, and delete mutations with refetch/invalidation behavior.

## 2. Tabbed stock research workspace

- [ ] 2.1 Update `StockResearchPage` to render shadcn `Tabs` with `Reports` and `Schedules` while preserving the existing reports workspace as the default tab.
- [ ] 2.2 Keep the page shell constrained inside `MainLayout` using the established `min-h-0`, `max-h-[calc(100dvh-6rem)]`, and `overflow-hidden` pattern for both tabs.
- [ ] 2.3 Add schedules-tab header actions for refresh and `New Schedule` without removing the existing `New Report` action from the reports workflow.

## 3. Schedule list and detail UI

- [ ] 3.1 Build a schedules workspace component with a left schedule list/rail and right detail panel using internal `ScrollArea` chains.
- [ ] 3.2 Render schedule list items with symbol, status, cadence label, next run timestamp, and runtime summary.
- [ ] 3.3 Render selected schedule detail with symbol, status, cadence definition, next run, created/updated timestamps, and runtime config.
- [ ] 3.4 Add loading skeletons, empty states, retry-oriented error states, and no-selection states for the schedules workspace.

## 4. Create and edit schedule form

- [ ] 4.1 Build a dedicated schedule dialog using shadcn `Dialog`, `Field`, `Select`, and `ToggleGroup`, reusing the existing symbol picker.
- [ ] 4.2 Load provider, model, and reasoning values from the existing stock research runtime catalog hook and require valid provider/model values for schedule submit.
- [ ] 4.3 Implement cadence controls for `every_15_minutes`, `daily`, and `weekly`, including hour selection for daily/weekly and weekday multi-select for weekly.
- [ ] 4.4 Add field-level validation for missing symbol, runtime provider/model, required hour, and required weekly weekdays.
- [ ] 4.5 Wire create and edit submit behavior to backend-aligned request payloads without sending invalid `hour` or `weekdays` fields for the selected cadence type.

## 5. Schedule actions

- [ ] 5.1 Add edit actions from selected schedule detail and schedule list context where appropriate.
- [ ] 5.2 Add pause and resume actions that call the dedicated lifecycle endpoints, update schedule data, and show `sonner` toast feedback.
- [ ] 5.3 Add delete action with shadcn `AlertDialog` confirmation, backend delete call, list update, selected-schedule cleanup, and toast feedback.
- [ ] 5.4 Ensure the UI does not expose schedule `run-now`; keep manual report creation through the existing `New Report` flow only.

## 6. Verification

- [ ] 6.1 Verify create requests for `every_15_minutes`, `daily`, and `weekly` match the documented backend payload shapes.
- [ ] 6.2 Verify update, pause, resume, and delete flows refresh list/detail state and surface API failures through toast feedback.
- [ ] 6.3 Verify empty, loading, error, no-selection, active, and paused schedule states.
- [ ] 6.4 Verify long schedule lists and detail content scroll inside the workspace panels rather than extending the route height.
- [ ] 6.5 Run the relevant lint/build checks for the touched frontend modules and fix introduced issues.
