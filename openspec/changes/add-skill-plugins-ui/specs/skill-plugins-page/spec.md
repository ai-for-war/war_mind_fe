## ADDED Requirements

### Requirement: Dedicated Skill Plugins management page
The system SHALL provide a protected `Skill Plugins` management page within the authenticated application shell at route `/skill-plugins`. The page SHALL render inside `MainLayout` and SHALL serve as the primary entry point for user-managed lead-agent skills.

#### Scenario: Navigate to Skill Plugins page
- **WHEN** an authenticated user navigates to `/skill-plugins`
- **THEN** the `Skill Plugins` page is rendered inside the shared authenticated shell

#### Scenario: Unauthenticated user accesses Skill Plugins page
- **WHEN** an unauthenticated user navigates to `/skill-plugins`
- **THEN** they are redirected to `/login` with `/skill-plugins` preserved in location state

### Requirement: Single-column skill list workspace
The `Skill Plugins` page SHALL present skills in a single-column list rather than a split-pane workspace. Each visible skill item SHALL expose the skill's display name, description, enablement state for the active organization, version, allowed-tool count, and last-updated metadata.

#### Scenario: Page renders returned skills
- **WHEN** the skill list request succeeds with one or more skills
- **THEN** the page shows a single-column list of skill items with each item's summary metadata

#### Scenario: User scans list without opening details
- **WHEN** the page renders multiple skills
- **THEN** the user can review each skill's summary information directly from the list view without navigating to a secondary detail pane

### Requirement: Search and status filtering
The page SHALL provide list controls for text search and status filtering. The status filter SHALL support `All`, `Enabled`, and `Disabled` views, and the text search SHALL narrow the visible list by skill content exposed in the list view.

#### Scenario: Filter enabled skills
- **WHEN** the user applies the `Enabled` filter
- **THEN** the page shows only skills whose current-organization `is_enabled` state is enabled

#### Scenario: Search skills by visible content
- **WHEN** the user enters a search query matching a skill's visible list content
- **THEN** the page narrows the list to matching skills only

### Requirement: List states for loading, empty, no-results, and fetch failure
The page SHALL render distinct non-happy-path states for the skill list. The page SHALL support:
- a loading state while the list request is in flight
- an empty state when the current scope has no skills
- a no-results state when active search/filter controls produce zero matches from a non-empty dataset
- an error state when the list request fails

#### Scenario: Initial list loading
- **WHEN** the page opens before the skill list request resolves
- **THEN** the page shows a loading state instead of an empty list

#### Scenario: Empty state with no skills
- **WHEN** the skill list request succeeds with zero items
- **THEN** the page shows an empty-state message and a create-skill call to action

#### Scenario: No results after filtering
- **WHEN** the current dataset is non-empty but the active search or filter produces zero visible matches
- **THEN** the page shows a no-results state instead of the default empty-state copy

#### Scenario: Fetch error
- **WHEN** the skill list request fails
- **THEN** the page shows an error state with a retry path for reloading the list

### Requirement: Page actions open modal workflows
The page SHALL use modal workflows for skill operations instead of route transitions or inline split-pane editing. Activating the create action SHALL open a create-skill popup, and selecting a skill item from the list SHALL open a popup for that specific skill.

#### Scenario: Open create popup from page action
- **WHEN** the user activates the primary `New Skill` action from the page
- **THEN** the page opens the create-skill popup without leaving `/skill-plugins`

#### Scenario: Open detail popup from list item
- **WHEN** the user clicks a skill item in the list
- **THEN** the page opens a popup for that selected skill without navigating away from `/skill-plugins`
