## ADDED Requirements

### Requirement: Protected stock research workspace route
The system SHALL provide a protected `Stock Research` page at `/stocks/research` inside `MainLayout`. The page SHALL request report history from `GET /api/v1/stock-research/reports` and present a desktop-first workspace with a history rail and a report detail surface.

#### Scenario: Authenticated user opens the stock research route
- **WHEN** an authenticated user navigates to `/stocks/research`
- **THEN** the application renders the `Stock Research` page inside `MainLayout`
- **AND** the page requests report history from `GET /api/v1/stock-research/reports`

#### Scenario: Unauthenticated user accesses the stock research route
- **WHEN** an unauthenticated user navigates to `/stocks/research`
- **THEN** they are redirected to `/login` with `/stocks/research` stored in location state

### Requirement: Report history reflects backend summaries and supports explicit selection
The stock research page SHALL render report history from the backend summary payload only. Each history entry SHALL show backend-derived report identity and status metadata, and selecting one history entry SHALL load its latest detail from `GET /api/v1/stock-research/reports/{report_id}`.

#### Scenario: User selects a report from history
- **WHEN** the history request succeeds and the user selects one report entry
- **THEN** the selected report becomes the active report in the workspace
- **AND** the page requests `GET /api/v1/stock-research/reports/{report_id}` for that selected report

#### Scenario: No report is selected yet
- **WHEN** the page has loaded report history but the user has not selected a report
- **THEN** the detail surface shows a neutral empty state
- **AND** the history rail remains available for report selection

### Requirement: Stock research uses a shared create-report dialog with catalog-driven runtime controls
The stock research experience SHALL provide a create-report dialog that can be opened from the stock research page and reused by other stock surfaces. The dialog SHALL load runtime options from `GET /api/v1/stock-research/reports/catalog`, SHALL display `symbol`, `provider`, `model`, and `reasoning` controls, and SHALL submit `POST /api/v1/stock-research/reports`.

#### Scenario: User queues a report with backend defaults
- **WHEN** the user submits the create-report dialog with a valid symbol and without selecting a runtime override
- **THEN** the frontend sends `POST /api/v1/stock-research/reports` with `{ "symbol": "<value>" }`
- **AND** the dialog closes after a successful `202 Accepted` response
- **AND** the user receives a success toast without automatic navigation

#### Scenario: User queues a report with an explicit runtime override
- **WHEN** the user selects provider and model values from the catalog and submits the create-report dialog
- **THEN** the frontend sends `POST /api/v1/stock-research/reports` with `symbol` plus `runtime_config`
- **AND** the runtime values come from the catalog response rather than hardcoded frontend lists

#### Scenario: Runtime catalog cannot be loaded
- **WHEN** the create-report dialog cannot load the runtime catalog
- **THEN** the dialog shows a retry-oriented failure state
- **AND** the user cannot submit a runtime override until catalog data is available

### Requirement: Report detail renders backend markdown and source references without fake realtime behavior
The active report detail surface SHALL render backend `content` as markdown close to its stored form, SHALL show report `sources` as separate references, and SHALL display backend status or failure data without polling or synthetic progress estimation.

#### Scenario: Completed report renders markdown and sources
- **WHEN** the selected report detail returns `status: completed` or `status: partial` with markdown content
- **THEN** the page renders the returned markdown content in the detail surface
- **AND** the page renders the returned `sources` list as reference links mapped by `source_id`

#### Scenario: Running or queued report has no content yet
- **WHEN** the selected report detail returns `status: queued` or `status: running` with `content: null`
- **THEN** the page shows a waiting-state message for the active report
- **AND** the page does not invent streaming text, generated sections, or time-based progress bars

#### Scenario: Failed report shows backend failure details
- **WHEN** the selected report detail returns `status: failed` with a non-null `error`
- **THEN** the page shows the backend-provided failure message for that report
- **AND** the page keeps the history rail available so the user can switch reports or retry refresh

### Requirement: Stock research refresh is user-driven
The stock research page SHALL provide an explicit refresh action that refetches report history and the currently selected report detail. The page SHALL NOT poll automatically after a report is created or while a report remains queued or running.

#### Scenario: User refreshes the stock research workspace
- **WHEN** the user activates the page refresh action while a report is selected
- **THEN** the page refetches `GET /api/v1/stock-research/reports`
- **AND** the page refetches the selected report detail from `GET /api/v1/stock-research/reports/{report_id}`

#### Scenario: User creates a report from the stock research page
- **WHEN** the user successfully queues a report from the create-report dialog
- **THEN** the page does not start background polling automatically
- **AND** the user remains in control of when to refresh the workspace snapshot
