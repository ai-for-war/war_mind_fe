## ADDED Requirements

### Requirement: Schedule data layer mirrors backend contract
The system SHALL provide frontend types, API functions, and query hooks for stock research schedules that mirror the documented backend schedule contract without speculative field aliases or unsupported payload mappings.

#### Scenario: List schedules
- **WHEN** the schedules tab loads schedule history
- **THEN** the frontend requests `GET /api/v1/stock-research/schedules` with supported pagination params only
- **AND** the returned items are represented with `id`, `symbol`, `status`, `schedule`, `next_run_at`, timestamps, and `runtime_config`

#### Scenario: Get schedule detail
- **WHEN** a user selects a schedule from the schedules list
- **THEN** the frontend requests `GET /api/v1/stock-research/schedules/{schedule_id}` for the selected schedule
- **AND** the detail view uses the backend response fields without inventing related report data

#### Scenario: Runtime catalog is loaded for schedule forms
- **WHEN** the user opens a create or edit schedule form
- **THEN** the frontend loads runtime options from `GET /api/v1/stock-research/reports/catalog`
- **AND** provider, model, and reasoning controls use catalog values rather than hardcoded lists

### Requirement: User can create stock research schedules
The system SHALL allow users to create a stock research schedule for one stock symbol with a required runtime config and one valid schedule definition.

#### Scenario: Create every-15-minutes schedule
- **WHEN** the user submits a valid symbol, runtime config, and cadence `every_15_minutes`
- **THEN** the frontend sends `POST /api/v1/stock-research/schedules` with `symbol`, `runtime_config`, and `schedule: { "type": "every_15_minutes" }`
- **AND** the frontend does not send `hour` or `weekdays` for that schedule type

#### Scenario: Create daily schedule
- **WHEN** the user submits a valid symbol, runtime config, cadence `daily`, and an hour
- **THEN** the frontend sends `POST /api/v1/stock-research/schedules` with `schedule: { "type": "daily", "hour": <hour> }`
- **AND** the frontend does not send `weekdays`
- **AND** the UI labels the hour as Vietnam time

#### Scenario: Create weekly schedule
- **WHEN** the user submits a valid symbol, runtime config, cadence `weekly`, an hour, and at least one weekday
- **THEN** the frontend sends `POST /api/v1/stock-research/schedules` with `schedule: { "type": "weekly", "hour": <hour>, "weekdays": [...] }`
- **AND** weekdays are sent only from the backend-supported weekday enum values

#### Scenario: Create schedule validation fails before submit
- **WHEN** the user attempts to create a schedule without a symbol, runtime provider, runtime model, required hour, or required weekly weekday
- **THEN** the form blocks submission
- **AND** the relevant field shows validation feedback

### Requirement: User can view and refresh schedule workspace data
The system SHALL provide a schedules workspace that displays backend schedule summaries, selected schedule detail, loading states, empty states, request failure states, and explicit refresh behavior.

#### Scenario: Schedules tab has no schedules
- **WHEN** the schedule list request succeeds with no items
- **THEN** the schedules workspace shows an empty state
- **AND** the user can open the create schedule dialog from that state

#### Scenario: Schedule list is loading
- **WHEN** the schedule list request is in flight
- **THEN** the schedules workspace shows skeleton placeholders matching the schedule list layout

#### Scenario: Schedule list request fails
- **WHEN** the schedule list request fails
- **THEN** the schedules workspace shows a retry-oriented failure state
- **AND** the user can retry the request without leaving the page

#### Scenario: User refreshes schedules
- **WHEN** the user activates the schedules refresh action
- **THEN** the frontend refetches `GET /api/v1/stock-research/schedules`
- **AND** if a schedule is selected, the frontend also refetches `GET /api/v1/stock-research/schedules/{schedule_id}`

### Requirement: User can edit schedule definitions and runtime config
The system SHALL allow users to edit a selected schedule's symbol, runtime config, and schedule definition through the backend update endpoint.

#### Scenario: User edits cadence
- **WHEN** the user saves a valid changed schedule definition
- **THEN** the frontend sends `PATCH /api/v1/stock-research/schedules/{schedule_id}` with a valid `schedule` object for the selected cadence type
- **AND** the UI refreshes schedule list and selected schedule detail after a successful response

#### Scenario: User edits runtime config
- **WHEN** the user saves changed provider, model, or reasoning values from the runtime catalog
- **THEN** the frontend sends `PATCH /api/v1/stock-research/schedules/{schedule_id}` with `runtime_config`
- **AND** provider and model values are non-empty catalog-derived values

#### Scenario: User edits symbol
- **WHEN** the user saves a changed symbol
- **THEN** the frontend sends `PATCH /api/v1/stock-research/schedules/{schedule_id}` with the normalized uppercase `symbol`
- **AND** backend validation errors are surfaced through toast feedback

### Requirement: User can pause and resume schedules
The system SHALL provide explicit pause and resume actions for selected or listed schedules using the backend lifecycle endpoints.

#### Scenario: User pauses an active schedule
- **WHEN** the user activates pause for an active schedule
- **THEN** the frontend sends `POST /api/v1/stock-research/schedules/{schedule_id}/pause`
- **AND** the schedule status updates to `paused` after a successful response
- **AND** the user receives a success toast

#### Scenario: User resumes a paused schedule
- **WHEN** the user activates resume for a paused schedule
- **THEN** the frontend sends `POST /api/v1/stock-research/schedules/{schedule_id}/resume`
- **AND** the schedule status updates to `active` after a successful response
- **AND** the user receives a success toast

### Requirement: User can delete schedules
The system SHALL let users delete schedules with destructive confirmation before calling the backend delete endpoint.

#### Scenario: User confirms schedule deletion
- **WHEN** the user confirms deletion for a schedule
- **THEN** the frontend sends `DELETE /api/v1/stock-research/schedules/{schedule_id}`
- **AND** the deleted schedule is removed from the visible list after a successful response
- **AND** the user receives a success toast

#### Scenario: User cancels schedule deletion
- **WHEN** the delete confirmation dialog is open and the user cancels
- **THEN** the frontend does not send a delete request
- **AND** the schedule remains selected and visible

### Requirement: Schedule UI excludes unsupported or intentionally omitted behavior
The system SHALL NOT expose schedule capabilities that are unsupported by the current frontend scope or backend response contracts.

#### Scenario: User views schedule actions
- **WHEN** a user opens schedule row actions or selected schedule actions
- **THEN** the UI does not show a `Run now` action
- **AND** manual report creation remains available through the existing `New Report` flow

#### Scenario: User creates or edits a schedule
- **WHEN** the schedule form is shown
- **THEN** the form does not offer watchlist scheduling, batch symbols, portfolio scheduling, or a timezone selector

#### Scenario: User views selected schedule detail
- **WHEN** selected schedule detail is rendered
- **THEN** the UI does not show generated reports for that schedule unless a future backend response exposes a stable schedule-report relationship
