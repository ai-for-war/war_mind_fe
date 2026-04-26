## ADDED Requirements

### Requirement: Stock research workspace provides Reports and Schedules tabs
The stock research page SHALL present the existing report workspace and the new schedule workspace as top-level tabs within the protected `/stocks/research` page.

#### Scenario: Authenticated user opens stock research page
- **WHEN** an authenticated user navigates to `/stocks/research`
- **THEN** the page renders tab controls for `Reports` and `Schedules`
- **AND** the `Reports` tab preserves the existing report history, report detail, manual refresh, and `New Report` behavior

#### Scenario: User switches to schedules tab
- **WHEN** the user selects the `Schedules` tab
- **THEN** the page renders the schedule management workspace
- **AND** the page does not navigate to a separate schedule route

#### Scenario: User uses manual report creation
- **WHEN** the user wants to create an ad hoc stock research report
- **THEN** the page keeps using the existing `New Report` flow
- **AND** the schedules workspace does not replace manual report creation with a schedule `run-now` action

### Requirement: Stock research tab layout preserves MainLayout scroll constraints
The stock research page SHALL preserve the desktop workspace height and internal scrolling constraints used by stable `MainLayout` pages when rendering either tab.

#### Scenario: Reports tab renders inside MainLayout
- **WHEN** the `Reports` tab is active
- **THEN** the reports workspace remains constrained by the page shell with `min-h-0`, `max-h-[calc(100dvh-6rem)]`, and internal overflow handling

#### Scenario: Schedules tab renders inside MainLayout
- **WHEN** the `Schedules` tab is active
- **THEN** the schedules workspace is constrained by the same page shell pattern
- **AND** long schedule lists or detail content scroll inside their panels rather than extending the route height
