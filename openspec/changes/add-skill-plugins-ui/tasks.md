## 1. Navigation and route entry points

- [x] 1.1 Update `src/widgets/sidebar/components/nav-main.tsx` to add a new `Plugins` group with a `Skill` navigation item targeting `/skill-plugins`
- [x] 1.2 Update `src/app/router.tsx` to register the protected `/skill-plugins` route under `MainLayout`
- [x] 1.3 Add the feature barrel export and route entry component wiring so the new page can be imported cleanly from `src/features/skill-plugins/`

## 2. Skill Plugins feature scaffolding

- [x] 2.1 Create the `src/features/skill-plugins/` feature slice with the directories needed for `components`, `api`, `hooks`, and `types`
- [x] 2.2 Add feature-local TypeScript types for skill summaries, skill details, tool catalog items, list filters, and create/edit form values
- [x] 2.3 Add a page-level hook or coordinator that owns selected skill id, active dialog state, search text, and status filter state

## 3. API and query integration

- [ ] 3.1 Implement lead-agent skill API helpers for list, detail, create, update, delete, enable, disable, and tool catalog requests using the existing authenticated API client
- [ ] 3.2 Implement TanStack Query hooks for the skill list, selected skill detail, and runtime tool catalog data
- [ ] 3.3 Implement TanStack Query mutations for create, update, enable, disable, and delete with cache invalidation for list and detail queries
- [ ] 3.4 Add a request-mapping helper that preserves backend update semantics for `allowed_tool_names` so unchanged, cleared, and replaced tool selections are sent correctly

## 4. Skill list page

- [ ] 4.1 Implement the `Skill Plugins` page shell with title, supporting copy, primary `New Skill` action, search input, and `All`/`Enabled`/`Disabled` filter controls
- [ ] 4.2 Implement the single-column list rendering for skill cards showing name, description, enablement state, version, allowed-tool count, and updated metadata
- [ ] 4.3 Implement loading, empty, no-results, and fetch-error states for the list page
- [ ] 4.4 Wire list item selection so clicking a skill opens the detail popup without navigating away from `/skill-plugins`

## 5. Popup workflows

- [ ] 5.1 Implement the skill detail popup showing name, description, activation prompt, allowed tools, version, enablement state, and action affordances
- [ ] 5.2 Implement the shared create/edit skill popup with controls for `name`, `description`, `activation_prompt`, and selectable `allowed_tool_names`
- [ ] 5.3 Load and render the runtime tool catalog in the create/edit popup without hardcoding tool choices in the frontend
- [ ] 5.4 Implement the enable and disable actions as dedicated popup-triggered mutations separate from edit form submission
- [ ] 5.5 Implement the delete confirmation popup with copy that distinguishes permanent deletion from disablement
- [ ] 5.6 Refresh or reconcile list and detail state after successful create, edit, enable, disable, and delete operations

## 6. Verification

- [ ] 6.1 Verify the sidebar shows the new `Plugins` group and the `Skill` item becomes active on `/skill-plugins`
- [ ] 6.2 Verify unauthenticated access to `/skill-plugins` redirects to `/login` while preserving the requested path
- [ ] 6.3 Verify the list page handles loading, empty, no-results, and error states correctly
- [ ] 6.4 Verify popup flows for detail, create, edit, enable, disable, and delete work without leaving the list page
- [ ] 6.5 Verify tool selection uses the backend tool catalog and that create/edit requests respect the backend `allowed_tool_names` semantics
- [ ] 6.6 Run lint and typecheck for the touched frontend files and resolve any issues introduced by the change
