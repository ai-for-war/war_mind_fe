## Context

The backend already exposes a concrete lead-agent skill management contract in `docs/skill/lead_agent_skill_frontend_guide.md`, but the frontend currently has no route, no sidebar entry, and no management UI for this capability. The current authenticated shell already provides the right host surface for this feature:

- `MainLayout` wraps protected routes with the shared sidebar and header
- `NavMain` renders grouped sidebar navigation from a configuration array
- the app already uses React 19, react-router-dom 7, shadcn/ui, Zustand, and TanStack Query
- the sidebar today behaves as navigation, not as a control center with embedded CRUD surfaces

The product decisions for this change are already constrained:

- add a `Plugins` sidebar group with a `Skill` item
- use a dedicated protected route at `/skill-plugins`
- keep the page as a single-column management screen, not a split-pane workspace
- use popup interactions for detail, create, edit, enable/disable, and delete
- do not show a sidebar status capsule for skill state

This is a good candidate for a design artifact because the change crosses navigation, routing, page composition, data fetching, and modal workflow orchestration, and the backend contract has a few non-obvious semantics around organization-scoped enablement and runtime-driven tool catalog data.

## Goals / Non-Goals

**Goals:**
- Add a discoverable authenticated entry point for Skill Plugins through sidebar navigation and protected routing
- Keep the primary page easy to scan by using a single-column list with lightweight controls instead of a dense split-pane UI
- Keep destructive and editing actions in modal workflows so the user can complete tasks without losing list context
- Respect backend semantics for `is_enabled`, `allowed_tool_names`, slug-generated `skill_id`, and runtime tool catalog validation
- Fit the implementation into the repo's feature-first structure without introducing cross-cutting global UI state

**Non-Goals:**
- Reordering skills, duplicating skills, or sharing/publishing skills across users
- Inline editing directly inside the list page
- Adding backend API changes or changing the existing lead-agent skill contract
- Showing sidebar badges, counters, or status capsules for skills in this change
- Building a multi-pane workspace, draft autosave, or URL-deep-linking into modal states

## Decisions

### 1. Introduce a dedicated `skill-plugins` feature slice

**Choice:** Build the UI under `src/features/skill-plugins/` with feature-local components, hooks, types, and API/query helpers.

**Rationale:** This feature is page-oriented, API-driven, and self-contained. It does not belong in `widgets/` because it is not a cross-app shell primitive, and it does not belong inside `sidebar/` because the sidebar should only expose the entry point. Keeping the implementation in one feature slice makes the page, dialogs, and API contract evolve together.

**Expected structure direction:**
- `components/` for page shell, list item cards, toolbar, and dialogs
- `api/` for lead-agent skill requests and query helpers
- `hooks/` for page-level orchestration and dialog coordination
- `types/` for skill, tool catalog, filters, and form values
- `index.ts` barrel exporting the page

**Alternatives considered:**
- place the page under `widgets/`: rejected because this is a route feature, not a shared shell widget
- spread logic across `app/`, `widgets/`, and `features/lead-agent/`: rejected because it would make the UI harder to reason about and test

### 2. Treat the sidebar as navigation only, not as a management surface

**Choice:** Add `Plugins > Skill` to the existing grouped navigation config and keep all actual skill management on `/skill-plugins`.

**Rationale:** The existing sidebar is clearly navigational. Adding counters, inline toggles, or embedded list controls there would change its information architecture and create a second management surface. A plain entry under a new `Plugins` group gives the capability visibility without overloading the sidebar.

**Alternatives considered:**
- add a sidebar mini-dashboard with status capsule and quick actions: rejected by product direction and would blur navigation vs management responsibilities
- nest all skill operations in the sidebar only: rejected because prompt editing and tool selection need more room than the sidebar can provide cleanly

### 3. Use a single-column page with modal workflows

**Choice:** The `/skill-plugins` route will render a list-first page with search, filters, and a primary create action. Clicking a list item opens a detail popup; create/edit/delete/enablement all happen in modal surfaces layered above the list.

**Rationale:** This matches the chosen UX direction and keeps the user's list context stable. It also avoids building a secondary detail panel state machine and avoids responsive complexity from a split-pane layout.

**Popup model:**
- detail popup for read-heavy inspection and quick actions
- create/edit popup sharing the same form shell
- delete confirmation popup for destructive action

**Alternatives considered:**
- two-pane master/detail layout: rejected by product direction and would add unnecessary layout/state complexity
- separate create/edit routes: rejected because they would interrupt list context and require more routing work for a mostly modal workflow

### 4. Use TanStack Query for server state and keep modal state local to the feature

**Choice:** Skill list, skill detail, mutations, and tool catalog loading will use TanStack Query. Selected skill id, open dialog type, search text, and active filter will stay in feature-local component state or a feature hook rather than a global Zustand store.

**Rationale:** The data is server-owned and mutation-heavy, which fits Query well: cache, invalidation, loading/error states, and optimistic refresh hooks are already solved there. The popup and filter state is page-local UI state and does not need to leak into the global app store.

**Data split:**
- Query: list skills, selected skill detail if needed, tool catalog
- Mutation: create, update, enable, disable, delete
- Local UI state: selected skill, current dialog, filter/search values, draft form state

**Alternatives considered:**
- use Zustand for both server and UI state: rejected because it would duplicate query lifecycle logic and manual cache invalidation
- use route search params for modal and filter state: rejected for phase one because it complicates a straightforward internal page workflow

### 5. Model forms directly against backend semantics, not a simplified frontend abstraction

**Choice:** The create/edit form will expose `name`, `description`, `activation_prompt`, and `allowed_tool_names`, and it will preserve backend semantics for update payloads:
- omit `allowed_tool_names` or send `null` to preserve existing tools on partial edit flows
- send `[]` to explicitly clear all allowed tools
- do not expose `skill_id` or `version` as editable fields

**Rationale:** The backend contract has meaningful differences between `null`, omitted, and `[]`. If the frontend hides those semantics behind an overly simplified abstraction, it risks accidental data loss when editing tools. The UI can still be simple while the submit layer stays faithful to the contract.

**Alternatives considered:**
- always submit the entire normalized skill object on edit: rejected because it makes accidental overwrite of tool permissions more likely
- hide tool clearing as an unsupported case: rejected because clearing tools is explicitly supported by the backend

### 6. Load tool choices from the runtime tool catalog and group them at render time

**Choice:** The create/edit popup will fetch available tools from `GET /api/v1/lead-agent/tools` and render them as grouped selectable items using the backend-provided `category`, `display_name`, and `description`.

**Rationale:** The backend guide explicitly says the frontend should not hardcode selectable tools. Querying the tool catalog at runtime ensures the form only offers valid values and avoids drift when the server-side catalog changes.

**Alternatives considered:**
- hardcode tool names in the frontend: rejected because it violates the documented source of truth
- fetch tools only on app load: rejected because the form is the only place that needs them and local lazy loading keeps the feature isolated

### 7. Keep enable/disable as a separate mutation path from content editing

**Choice:** The detail popup will surface enable/disable as a dedicated action that does not share the create/edit form submission path.

**Rationale:** `is_enabled` is organization-scoped operational state, not static skill content. Separating its action path keeps the UX clearer and aligns with the backend model where enable/disable are their own endpoints.

**Alternatives considered:**
- fold enablement into edit form save: rejected because it mixes content editing with environment-scoped operational state
- make enablement a list-row inline toggle: rejected for phase one because it weakens the popup-centered interaction model and makes accidental state changes easier

### 8. Reuse shared dialog and confirmation primitives where possible

**Choice:** The feature will build on existing shadcn dialog primitives and reuse the existing confirm-delete dialog pattern if it fits the copy and loading semantics.

**Rationale:** This keeps the UI consistent with the rest of the app and avoids custom modal stacks. The feature needs multiple modal states, so consistency in shell, buttons, focus handling, and destructive confirmation is more important than bespoke dialog styling.

**Alternatives considered:**
- custom popup implementation per skill action: rejected because it would create unnecessary divergence in interaction and accessibility behavior

## Risks / Trade-offs

- **[Organization-scoped enablement can be misunderstood as a global skill state]** -> Surface enable/disable copy inside the detail popup that makes the organization scope explicit and avoid placing enablement in generic edit fields
- **[Editing tools can accidentally clear permissions if payload semantics are mishandled]** -> Keep a narrow API adapter that explicitly maps unchanged vs cleared tool selections before sending mutations
- **[Modal-heavy interactions can create state coordination bugs]** -> Centralize modal orchestration in a single page-level hook or coordinator component and allow only one primary popup flow at a time
- **[Fetching tool catalog only when opening forms can create a perceived delay]** -> Prefetch the tool catalog when the page loads or on first hover/open of the create action if the delay becomes noticeable
- **[List and detail data can go stale after mutations]** -> Use TanStack Query invalidation keyed by list and skill detail queries immediately after successful mutations
- **[Long activation prompts may not fit comfortably in small dialogs]** -> Use a wide dialog with a large textarea and allow the detail popup to scroll independently from the page
- **[No URL-backed dialog state means popup context is not shareable or restorable on refresh]** -> Accept this trade-off for phase one because the interaction model is intentionally lightweight and local

## Migration Plan

1. Add the `Plugins` group and `Skill` item to sidebar navigation config
2. Add the protected `/skill-plugins` route and a feature barrel export for the page
3. Create the `src/features/skill-plugins/` slice with types, API/query helpers, and page shell
4. Implement list fetching plus loading, empty, no-results, and error states
5. Implement the list item UI and page toolbar with search/filter/create controls
6. Implement popup orchestration for detail, create/edit, enable/disable, and delete confirmation
7. Wire the create/edit form to the runtime tool catalog and skill mutations
8. Validate end-to-end flows against the backend guide: list, detail, create, update, clear tools, enable, disable, delete, and protected-route redirect behavior

Rollback is low risk because this is a net-new route and navigation entry backed by existing APIs. Removing the route and sidebar item cleanly hides the feature without affecting the existing authenticated shell or other features.

## Open Questions

- Should the list page fetch full skill detail lazily on click, or can it rely on the list payload for the initial detail popup render and only fetch when additional freshness is needed?
- Should the tool catalog be prefetched on page load for smoother popup open, or loaded only when create/edit is opened to reduce unnecessary requests?
- Does product want the detail popup to show raw timestamps (`created_at`, `updated_at`) or relative time only in phase one?
