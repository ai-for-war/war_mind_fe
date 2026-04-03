## Why

The application already has backend support for user-managed lead-agent skills, but there is no frontend entry point or management surface for this capability. Users need a discoverable navigation path and a focused UI to create, inspect, edit, enable, disable, and delete skill plugins without leaving the authenticated workspace shell.

## What Changes

- Add a new `Plugins` navigation group to the authenticated sidebar with a `Skill` destination that routes to `/skill-plugins`
- Add a protected `/skill-plugins` route inside the authenticated application shell
- Create a `Skill Plugins` management page that presents skills in a single-column list with search, filter, empty, loading, and error states
- Add popup-based flows for skill detail, create, edit, enable/disable, and delete actions so users can manage a selected skill without navigating to a split-pane workspace
- Integrate the page and dialogs with the existing lead-agent skill HTTP API documented in `docs/skill/lead_agent_skill_frontend_guide.md`

## Capabilities

### New Capabilities
- `skill-plugins-page`: A protected management page for listing skill plugins in a single-column layout, supporting search/filter controls, create entry point, and list states for loading, empty, no-results, and fetch errors
- `skill-plugin-dialogs`: Modal workflows for viewing skill details, creating a skill, editing a skill, toggling skill enablement for the active organization, and confirming destructive deletion

### Modified Capabilities
- `sidebar-navigation`: Extend the sidebar navigation structure with a `Plugins` group containing a `Skill` item that navigates to `/skill-plugins`
- `auth-routing`: Register the protected `/skill-plugins` route under `MainLayout` so authenticated users can access the Skill Plugins page from the shared app shell

## Impact

- **New feature area**: `src/features/skill-plugins/` for page UI, dialogs, API hooks/services, and supporting types
- **Modified files**: `src/widgets/sidebar/components/nav-main.tsx`, `src/app/router.tsx`, and potentially shared dialog or UI composition points reused by the new feature
- **Data integration**: frontend consumption of the existing lead-agent skill endpoints for list, detail, create, update, delete, enable, disable, and tool catalog retrieval
- **No backend changes required**: the proposal consumes the existing skill API contract already documented for frontend integration
- **No new top-level layout pattern**: the feature stays within the existing `MainLayout` and uses popup interactions instead of introducing a two-pane management workspace
