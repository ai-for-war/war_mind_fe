# text-to-image-ui Specification

## Purpose
Define the text-to-image studio UI, its data flow, and the member-facing job lifecycle experience.

## Requirements
### Requirement: Text-to-image generate form schema
The system SHALL provide a validation schema at `src/features/text-to-image/schemas/text-to-image.schema.ts` for the text-to-image compose form. The schema SHALL validate:
- `prompt`: required string, min 1 character, max 1500 characters
- `aspect_ratio`: required enum matching the backend-supported ratios `1:1`, `16:9`, `4:3`, `3:2`, `2:3`, `3:4`, `9:16`, and `21:9`
- `seed`: optional integer, min `0`, max `2147483647`
- `prompt_optimizer`: optional boolean, default `false`

The schema SHALL export a `TextToImageFormValues` type inferred from the schema.

#### Scenario: Valid form with required fields only
- **WHEN** the form is submitted with a non-empty `prompt` and a supported `aspect_ratio`
- **THEN** validation passes with default values applied for optional fields

#### Scenario: Prompt exceeds backend limit
- **WHEN** `prompt` exceeds 1500 characters
- **THEN** validation fails with a max length error

#### Scenario: Unsupported aspect ratio
- **WHEN** `aspect_ratio` is set to a value outside the backend-supported ratio set
- **THEN** validation fails before submission

#### Scenario: Seed outside valid range
- **WHEN** `seed` is less than `0` or greater than `2147483647`
- **THEN** validation fails before submission

### Requirement: Text-to-image compose form
The system SHALL provide a `TextToImageComposeForm` component at `src/features/text-to-image/components/text-to-image-compose-form.tsx` that contains the generation form. The form SHALL include:
- a prompt textarea with live character count
- an aspect ratio selector that presents all supported ratios
- a `prompt_optimizer` toggle with helper text
- a collapsed advanced section containing the optional `seed` field
- a primary `Generate image` submit action

The form SHALL use `react-hook-form` with the feature schema and SHALL submit through a create-job mutation aligned to the backend text-to-image create endpoint.

#### Scenario: Submit generation request
- **WHEN** the user enters a valid prompt, selects an aspect ratio, and submits the form
- **THEN** the create-job mutation is triggered with `prompt`, `aspect_ratio`, optional `seed`, and `prompt_optimizer`

#### Scenario: Create request pending state
- **WHEN** the create-job mutation is pending
- **THEN** the submit action is disabled and indicates that the job is being created

#### Scenario: Create request succeeds
- **WHEN** the create-job mutation succeeds with a `job_id` and `status=pending`
- **THEN** the page selects the new job and preserves the current form values for iteration

#### Scenario: Create request fails
- **WHEN** the create-job mutation fails
- **THEN** the form displays an error message without clearing the user's draft

#### Scenario: Advanced settings collapsed by default
- **WHEN** the form first renders
- **THEN** the advanced settings section is collapsed and the `seed` field is hidden

### Requirement: Text-to-image preview and detail panel
The system SHALL provide a `TextToImagePreviewPanel` component at `src/features/text-to-image/components/text-to-image-preview-panel.tsx` that renders the currently selected generation job. The panel SHALL support exactly these display states:
- empty
- pending
- processing
- succeeded
- failed
- cancelled

The panel SHALL render content from the selected job detail response, and for succeeded jobs it SHALL use the generated output image access returned by the generation detail endpoint rather than requiring a separate image-library browsing flow.

#### Scenario: Empty state before any jobs exist
- **WHEN** there is no selected job and the current member has no generation history
- **THEN** the panel shows an empty-state placeholder explaining that generated images will appear there

#### Scenario: Pending job state
- **WHEN** the selected job detail has `status=pending`
- **THEN** the panel shows a queued state, a ratio-aware placeholder stage, and a visible `Cancel job` action

#### Scenario: Processing job state
- **WHEN** the selected job detail has `status=processing`
- **THEN** the panel shows a generating state with a non-percentage loading treatment and does not show a cancel action

#### Scenario: Succeeded job state
- **WHEN** the selected job detail has `status=succeeded` and includes `output_images`
- **THEN** the panel renders the generated image using the returned signed URL and shows job metadata plus follow-up actions

#### Scenario: Failed job state
- **WHEN** the selected job detail has `status=failed`
- **THEN** the panel shows a failure state with the persisted failure message and actions to reuse the prompt for a new generation

#### Scenario: Cancelled job state
- **WHEN** the selected job detail has `status=cancelled`
- **THEN** the panel shows a cancelled state explaining that the job ended before processing started

### Requirement: Pending-only cancellation
The system SHALL allow cancellation only for jobs whose selected detail state is `pending`. The UI MUST remove or disable the cancel affordance for `processing`, `succeeded`, `failed`, and `cancelled` jobs.

#### Scenario: Cancel queued job
- **WHEN** the selected job is `pending` and the user activates `Cancel job`
- **THEN** the cancel mutation is sent for that `job_id`

#### Scenario: No cancel action after processing starts
- **WHEN** the selected job transitions from `pending` to `processing`
- **THEN** the preview panel no longer presents a cancel action

#### Scenario: Cancel mutation conflict
- **WHEN** the cancel request is rejected because the job has already moved to `processing`
- **THEN** the UI reflects that the job is no longer cancellable and refreshes the selected job state

### Requirement: Personal generation history rail
The system SHALL provide a `TextToImageHistoryList` component at `src/features/text-to-image/components/text-to-image-history-list.tsx` that displays the current member's generation job history using the generation history endpoint. The history rail SHALL:
- order items by newest first
- support status-based filtering
- render prompt excerpt, aspect ratio, requested time, and status for each item
- allow selecting one item at a time
- support pagination for additional history items

#### Scenario: Initial history load
- **WHEN** an authenticated member opens the page and history data is available
- **THEN** the rail shows generation jobs ordered from newest to oldest

#### Scenario: Empty history
- **WHEN** the history endpoint returns no items for the current member
- **THEN** the rail shows an empty-state message encouraging the member to create their first image

#### Scenario: Filter by status
- **WHEN** the user applies a status filter such as `Succeeded` or `Failed`
- **THEN** the rail shows only jobs matching that filter grouping

#### Scenario: Select history item
- **WHEN** the user clicks a history item
- **THEN** that item becomes selected and its job detail is loaded into the preview panel

#### Scenario: Load more history
- **WHEN** more history items exist beyond the current page
- **THEN** the rail presents a pagination affordance to request more items

### Requirement: Page-level selection and default focus behavior
The system SHALL provide a `TextToImagePage` component at `src/features/text-to-image/components/text-to-image-page.tsx` that coordinates the compose panel, preview panel, and history rail. The page SHALL maintain a single active selection for the job shown in the preview panel.

#### Scenario: Select newly created job automatically
- **WHEN** a create-job mutation succeeds
- **THEN** the page selects the newly created job immediately

#### Scenario: Select newest existing job on initial load
- **WHEN** the page loads, no job is currently selected, and history contains one or more items
- **THEN** the newest history item becomes the selected job

#### Scenario: No selected job with empty history
- **WHEN** the page loads and history is empty
- **THEN** the page shows the empty preview state and an unselected history rail

### Requirement: Realtime lifecycle reconciliation
The system SHALL subscribe to text-to-image lifecycle events for the active organization and reconcile the visible page state with REST-backed query data. The UI SHALL treat REST detail/history responses as authoritative durable state and SHALL use socket events to patch or invalidate relevant data for responsiveness.

#### Scenario: Processing event updates visible job
- **WHEN** a lifecycle event indicates that a visible job has moved to `processing`
- **THEN** the page updates or refetches the corresponding history item and selected detail so the preview reflects `processing`

#### Scenario: Succeeded event updates selected preview
- **WHEN** a lifecycle event indicates that the selected job has `status=succeeded`
- **THEN** the page updates or refetches the selected job detail so the preview can render the returned output image access

#### Scenario: Failed or cancelled event updates history and detail
- **WHEN** a lifecycle event indicates that a visible job has failed or been cancelled
- **THEN** the page updates or refetches the corresponding history and selected detail state to match the terminal status

#### Scenario: Socket reconnect
- **WHEN** the socket transport reconnects while the page is open
- **THEN** the page invalidates the selected detail and current history page so server truth is restored after any missed events

### Requirement: Responsive studio layout
The page SHALL preserve the text-to-image studio mental model across responsive breakpoints. The layout SHALL be:
- desktop: compose panel on the left, preview/detail in the center, history rail on the right
- mobile: a stacked order of compose panel, preview/detail, then history rail

#### Scenario: Desktop layout
- **WHEN** the page is viewed on desktop-width screens
- **THEN** all three studio regions are visible simultaneously with the preview/detail region as the primary visual area

#### Scenario: Mobile layout
- **WHEN** the page is viewed on a narrow viewport
- **THEN** the compose panel stacks above the preview/detail panel and the history rail stacks below them

#### Scenario: Selected job remains visible on mobile
- **WHEN** the user selects a history item on mobile
- **THEN** the preview/detail section continues to represent that selected job in the stacked layout
