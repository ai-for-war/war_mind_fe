## 1. Routing and feature scaffolding

- [x] 1.1 Add the `Text to Image` route to the authenticated app router and point it to a new `TextToImagePage` entry component
- [x] 1.2 Update sidebar navigation configuration to include the `Text to Image` item with the `/text-to-image` path and a suitable Lucide icon
- [x] 1.3 Install the missing shadcn/ui primitives needed for the page, specifically `switch`, `toggle-group`, `aspect-ratio`, and `pagination` if the final history UX uses first-party pagination controls
- [x] 1.4 Verify which required shadcn/ui primitives are already present in `src/components/ui/` and plan to reuse them instead of creating custom equivalents
- [x] 1.5 Create the `src/features/text-to-image/` feature slice structure for `components`, `hooks`, `schemas`, `types`, and query-key utilities
- [x] 1.6 Add feature barrel exports or import paths needed for the new page to integrate cleanly with the existing app structure

## 2. Types, schemas, and query primitives

- [x] 2.1 Add text-to-image TypeScript types for create request, history response, detail response, job statuses, lifecycle payloads, and output image access
- [x] 2.2 Add a `text-to-image.schema.ts` validation schema for `prompt`, `aspect_ratio`, optional `seed`, and `prompt_optimizer`
- [x] 2.3 Add query-key helpers for history, detail, and any lifecycle-related invalidation paths
- [x] 2.4 Add API-layer functions for create job, list history, get detail, and cancel job aligned to the backend endpoints
- [x] 2.5 Add React Query hooks for create, history, detail, and cancel flows using the new API-layer functions

## 3. Compose experience

- [x] 3.1 Implement `TextToImageComposeForm` with `react-hook-form` and the feature schema
- [x] 3.2 Add the prompt textarea with live character count and validation error rendering
- [x] 3.3 Add the aspect ratio selector that renders all backend-supported ratios in a visual single-select control, preferably using shadcn `toggle-group`
- [x] 3.4 Add the `prompt_optimizer` toggle with helper copy that explains its effect, using shadcn `switch`
- [x] 3.5 Add the collapsed advanced settings section containing the optional `seed` field
- [x] 3.6 Wire form submission to the create-job mutation and preserve form values after successful job creation
- [x] 3.7 Add create-request loading and failure states so submission is clearly communicated without clearing the draft

## 4. History rail

- [x] 4.1 Implement `TextToImageHistoryList` to fetch the current member's generation history with newest-first ordering
- [x] 4.2 Implement `TextToImageHistoryItem` to render prompt excerpt, aspect ratio, requested time, and status in a compact rail card
- [x] 4.3 Add status filter controls for `All`, `In progress`, `Succeeded`, `Failed`, and `Cancelled`
- [x] 4.4 Add empty, loading, and error states for the history rail
- [x] 4.5 Add pagination or `Load more` behavior for additional history items, using shadcn `pagination` if it improves the final rail UX over a simpler button
- [x] 4.6 Add selected-item highlighting and click handling so the rail controls the active preview selection

## 5. Preview and detail panel

- [x] 5.1 Implement `TextToImagePreviewPanel` as a selected-job surface driven by the job detail query
- [x] 5.2 Add the empty-state presentation shown when no jobs exist or nothing is selected
- [x] 5.3 Add the `pending` state with queued copy, an `aspect-ratio`-backed placeholder stage, and a visible cancel action
- [x] 5.4 Add the `processing` state with a non-percentage loading treatment and no cancel affordance
- [x] 5.5 Add the `succeeded` state that renders the returned `output_images` signed URL in a stable ratio-aware frame and shows image-focused metadata
- [x] 5.6 Add the `failed` state that surfaces the persisted failure message and supports prompt reuse for a new generation
- [x] 5.7 Add the `cancelled` state that explains the job ended before processing started and supports prompt reuse
- [x] 5.8 Add post-success actions such as `Open full size`, `Download`, `Copy prompt`, and `Generate again` while preserving the generation-history mental model

## 6. Page orchestration and selection behavior

- [x] 6.1 Implement `TextToImagePage` to compose the form, preview panel, and history rail into the three-region studio layout
- [x] 6.2 Add page-level selected-job state so only one job is active in the preview panel at a time
- [x] 6.3 Auto-select the newly created job after create mutation success
- [x] 6.4 Auto-select the newest history item on initial load when history is non-empty and no job is currently selected
- [x] 6.5 Keep the preview panel in sync when the user changes the selected history item

## 7. Cancellation and prompt reuse flows

- [x] 7.1 Wire the preview panel cancel action to the cancel-job mutation for `pending` jobs only
- [x] 7.2 Remove or disable cancel affordances for `processing`, `succeeded`, `failed`, and `cancelled` states
- [x] 7.3 Handle cancel conflicts by refetching the selected job and reflecting that it is no longer cancellable
- [x] 7.4 Implement `Generate again` so it repopulates the compose form from the selected job's prompt and settings rather than implying backend retry semantics

## 8. Realtime lifecycle synchronization

- [x] 8.1 Implement a text-to-image lifecycle subscription hook using the existing socket subscription layer
- [x] 8.2 Handle `created` events by reconciling the current history page so newly created jobs appear promptly
- [x] 8.3 Handle `processing` events by updating or invalidating the selected detail and visible history entries
- [x] 8.4 Handle `succeeded` events by updating or invalidating selected detail so returned `output_images` can render in the preview panel
- [x] 8.5 Handle `failed` and `cancelled` events by reconciling visible history and selected detail state
- [x] 8.6 Invalidate selected detail and current history data on socket reconnect so REST truth is restored after missed events

## 9. Responsive and visual polish

- [ ] 9.1 Implement the desktop three-column studio layout with the center preview region as the primary visual area
- [ ] 9.2 Implement the mobile stacked layout order of compose, preview, then history
- [ ] 9.3 Ensure the history rail remains usable without turning into a separate hidden workflow on smaller screens
- [ ] 9.4 Apply styling that fits the existing dark app shell while adding subtle `Creative Studio` emphasis in the preview stage and aspect ratio controls
- [ ] 9.5 Ensure loading, empty, failure, and terminal states remain visually distinct and honest without fake progress indicators

## 10. Verification and refinement

- [ ] 10.1 Verify route registration and sidebar navigation active state for `/text-to-image`
- [ ] 10.2 Verify create, detail, history, and cancel flows against the current backend contract
- [ ] 10.3 Verify that succeeded jobs render images from generation detail `output_images.signed_url` and do not depend on a separate image-library page
- [ ] 10.4 Verify selection behavior on initial load, after create, after history clicks, and after lifecycle updates
- [ ] 10.5 Verify desktop and mobile layouts for usability and visual hierarchy
- [ ] 10.6 Verify reconnect and missed-event recovery by forcing refetch-based reconciliation paths
- [ ] 10.7 Run lint/typecheck for the touched frontend files and resolve any issues introduced by the change
