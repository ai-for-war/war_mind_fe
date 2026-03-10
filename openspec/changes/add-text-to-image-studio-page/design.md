## Context

The backend already exposes a complete phase-1 text-to-image job flow, but the frontend currently has no route, page shell, or feature state that lets a member use it. The available backend contract is intentionally job-oriented rather than synchronous:

- `POST /image-generations/text-to-image` creates a job and returns `job_id` plus initial `status=pending`
- `GET /image-generations` returns paginated generation history summaries
- `GET /image-generations/{job_id}` returns authoritative job detail plus generated output image access
- `POST /image-generations/{job_id}/cancel` cancels only while the job is still `pending`
- Socket.IO emits lifecycle notifications for `created`, `processing`, `succeeded`, `failed`, and `cancelled`

The frontend application already has the core building blocks needed for a first implementation:

- authenticated app shell with persistent sidebar and dark theme
- feature-first organization under `src/features/`
- React Query for server state
- `socket.io-client` plus a shared socket subscription layer
- `react-hook-form` + `zod` patterns for compose flows
- a strong media-generator layout precedent in `tts-ui`
- an existing local `src/components/ui/` surface that already includes many shadcn/ui primitives such as `button`, `card`, `textarea`, `label`, `collapsible`, `badge`, `scroll-area`, `separator`, `skeleton`, `sheet`, `tabs`, and `tooltip`

The shadcn/ui MCP catalog confirms that the component library can also provide additional primitives relevant to this page, including `switch`, `aspect-ratio`, `toggle-group`, and `pagination`. Those components should be treated as the preferred extension path before inventing custom equivalents for the studio workflow.

This change is not a generic image management effort. It is a dedicated member-facing studio surface for creating and reviewing personal text-to-image jobs. The user has explicitly chosen these product constraints:

- standalone page in the sidebar
- primary user is a regular member generating for themselves
- visual direction is `Creative Studio`
- generated images live in generation history UX, not in a separate image library mental model
- phase 1 must stay tightly aligned with current backend capability, without speculative controls or fake progress

## Goals / Non-Goals

**Goals:**
- Add a standalone `Text to Image` route within the authenticated shell
- Present a studio-style workspace with three coordinated regions: compose panel, active preview/detail panel, and personal history rail
- Keep the compose form aligned exactly with the current backend request contract: `prompt`, `aspect_ratio`, optional `seed`, and optional `prompt_optimizer`
- Reflect backend lifecycle honestly across `pending`, `processing`, `succeeded`, `failed`, and `cancelled`
- Use REST as durable truth and Socket.IO as responsive notification so refresh, reconnect, and missed events remain safe
- Optimize the feature around a single member's own jobs rather than admin/team management
- Preserve a clean path to implementation with reusable components, query boundaries, and feature-local state

**Non-Goals:**
- Adding controls that backend does not currently support, such as negative prompts, style presets with API semantics, multiple outputs, model selection, or reference images
- Reframing generated assets as entries in a general image library workflow
- Inventing fake percentage progress or other synthetic execution detail that backend does not expose
- Building team-wide moderation, org-wide browsing, or admin views for text-to-image jobs
- Introducing a new realtime transport, polling loop, or separate state-sync mechanism beyond the existing socket layer and REST endpoints
- Designing phase-2 image editing or image-to-image flows

## Decisions

### 1. Implement text-to-image as a dedicated feature page and sidebar destination

**Choice:** Add a top-level authenticated route such as `/text-to-image` and a matching sidebar navigation item, rather than nesting the experience under an image management surface.

**Rationale:** The backend models generation as its own job resource family. The user also wants a standalone page, not a sub-workflow hidden inside uploads or image browsing. A dedicated route gives the feature room for its own compose, realtime state, and history without competing with unrelated media concepts.

This also aligns with existing product structure:
- `/voice-cloning`
- `/tts`
- `/multi-agent`
- `/text-to-image`

**Alternatives considered:**
- Add generation as a tab inside an existing images page: rejected because it would blur asset management and job orchestration
- Add generation as a modal or sheet launched from elsewhere: rejected because a modal is too cramped for compose, active job monitoring, and durable history

### 2. Use a three-region studio workspace rather than a simple form-and-result page

**Choice:** Structure the page as:
- left `compose panel`
- center `active preview / selected job detail`
- right `history rail`

**Rationale:** The backend contract makes history and lifecycle first-class concepts. A simple two-part form/result layout would underrepresent the fact that users can create a job, leave it processing, return later, and reopen prior outputs. The chosen layout balances:

- creation on the left
- current focus in the center
- durable memory on the right

The closest in-product precedent is `tts-ui`, but text-to-image benefits from a stronger center stage because visual output deserves more primary space than audio playback controls.

**Planned desktop proportions:**
- left compose column: `320-360px`
- center preview/detail region: flexible primary area
- right history rail: `300-340px`

**Alternatives considered:**
- two-column compose + history, with result nested under compose: rejected because it shrinks the generated image stage too much
- tabbed `Compose / Result / History`: rejected because it hides context and increases navigation friction during iterative generation

### 3. Keep the compose contract strictly backend-aligned and move technical options behind progressive disclosure

**Choice:** The compose form exposes only:
- `prompt`
- `aspect_ratio`
- `prompt_optimizer`
- `seed` inside a collapsed advanced section

**Rationale:** The user explicitly wants phase 1 to stay close to backend support. The form should feel creative, but it must not imply capabilities the API does not have. Progressive disclosure keeps the page approachable:

- `prompt` remains the dominant control
- `aspect_ratio` is presented visually because it affects composition directly
- `prompt_optimizer` is visible because it changes generation behavior
- `seed` is available without making the whole UI feel overly technical

**Detailed UI decisions:**
- `prompt` uses a large textarea with live `0 / 1500` counter
- `aspect_ratio` uses visual chips or segmented cards, not a plain dropdown
- `prompt_optimizer` uses a switch with helper copy
- `seed` lives under `Advanced settings`, collapsed by default
- form values persist after a successful create so the user can iterate quickly

**Alternatives considered:**
- expose all controls inline: rejected because it makes the studio feel technical too early
- hide `prompt_optimizer`: rejected because it is a real backend behavior users should understand and control
- add prompt inspiration presets with generation semantics: rejected because the request is to stay within backend truth

### 4. Treat the center pane as a selected-job surface, not just the latest-result surface

**Choice:** The center region always represents one explicit selection:
- the newly created job, automatically selected after create
- or a job chosen from history

**Rationale:** This keeps the UI stable and understandable. Users do not think in terms of "whatever image the app considers current"; they think in terms of "the job I just ran" or "that older image I want to revisit." A selection-driven center pane also maps cleanly to the backend split between summary list and detail endpoint.

**Selection behavior:**
- on successful create, auto-select the new job
- on initial page load, auto-select the newest available job if history is non-empty
- clicking a history item replaces the current selection
- if the selected item updates by socket event, the center pane updates in place

**Alternatives considered:**
- always show only the latest created job: rejected because it breaks deliberate browsing of history
- show no selection until the user clicks an item: rejected because it wastes the center pane on initial load

### 5. Use list summaries for the rail and detail fetches for the center pane

**Choice:** The history rail consumes list summary data, while the center pane uses detail data for the selected job.

**Rationale:** This mirrors the backend design and avoids over-fetching or preloading signed image access for every historical record. The rail needs to be lightweight and scan-friendly, while the center pane needs richer data for actions and accurate state display.

**History rail summary contents:**
- prompt excerpt
- aspect ratio
- requested time
- status
- success/failure counters as needed
- thumbnail only when cheaply derivable from currently loaded detail or when list payload already supports it later

**Center detail contents:**
- full authoritative job record
- output image access for succeeded jobs
- failure/cancellation metadata
- actionable buttons such as `Download`, `Open full size`, `Copy prompt`, and `Generate again`

**Alternatives considered:**
- fetch detail for every list item: rejected because it adds signing work and unnecessary network cost
- render the entire page from list data only: rejected because completed-image actions need detail-level access

### 6. Use REST as the source of truth and Socket.IO as invalidation-plus-reconciliation, not as the only state channel

**Choice:** The feature will use React Query for durable reads and treat socket events as signals to patch or invalidate relevant query state rather than as the sole authoritative store.

**Rationale:** The backend design explicitly positions REST as authoritative and sockets as additive notifications. The frontend should match that contract:

- create mutation returns a new job quickly
- list and detail queries remain canonical after refresh or reconnect
- socket events make the interface feel live without risking long-term drift

**Recommended query model:**
- `history` query: paginated list for the current member
- `detail(jobId)` query: selected job only
- `create` mutation
- `cancel(jobId)` mutation

**Socket event response strategy:**
- `created`: prepend or invalidate the first page of history if needed
- `processing`: patch selected detail if active, patch visible history status if present
- `succeeded`: patch or invalidate selected detail and top history entries so thumbnail/status become current
- `failed`: patch or invalidate as above, plus surface error state
- `cancelled`: patch selected detail and history item, remove cancel affordance

**Reconnect behavior:**
- on socket reconnect, invalidate the selected detail and first history page

**Alternatives considered:**
- rely on polling only: rejected because it wastes the realtime channel already provided
- keep a fully custom local store as authoritative state for jobs: rejected because long-lived server truth belongs in React Query

### 7. Model the frontend job display with a small explicit UI state machine

**Choice:** Define one display state machine for the center pane:
- `empty`
- `pending`
- `processing`
- `succeeded`
- `failed`
- `cancelled`

**Rationale:** The backend status model is already intentionally small. The UI should preserve that clarity rather than invent additional pseudo-states. This is especially important because the user does not want fake progress behavior.

**State-specific UI rules:**
- `empty`: illustration/placeholder and guidance copy only
- `pending`: queued copy and visible `Cancel job` action
- `processing`: shimmer/skeleton stage, no cancel action
- `succeeded`: image stage plus actions
- `failed`: failure summary plus `Generate again`
- `cancelled`: neutral terminal state plus `Generate again`

**Important honesty rules:**
- no percentage progress bar
- no `Cancel` button after `processing`
- no `Retry` action unless implemented as "reuse existing prompt/settings and create a new job"

**Alternatives considered:**
- add a synthetic `queued` UI state distinct from backend `pending`: rejected because it complicates mapping without adding meaning
- blur `pending` and `processing` into a single "loading" state: rejected because cancelability differs materially

### 8. Keep ephemeral UI state minimal and feature-local

**Choice:** Use React Query for job data and a small feature-local UI state layer for:
- selected job ID
- active history filter
- local compose draft
- advanced panel open/closed

No separate long-lived store is needed unless implementation complexity proves otherwise.

**Rationale:** Unlike streaming chat, this page does not need token-level aggregation or complex optimistic overlays. The backend create response already gives a stable `job_id`, and the state transitions are coarse. A heavy Zustand store would add complexity without clear benefit in phase 1.

**Recommended state ownership split:**
- URL / router: route only
- component or feature-local state:
  - `selectedJobId`
  - `statusFilter`
  - form state via `react-hook-form`
  - `isAdvancedOpen`
- React Query:
  - history pages
  - selected job detail
  - mutation state

**Alternatives considered:**
- put all state in component-local props only: acceptable but clumsy once compose, preview, and history need to coordinate
- build a dedicated Zustand store immediately: rejected as premature for a non-streaming, single-page workflow

### 9. Design the history rail as a compact personal timeline, not a gallery

**Choice:** Use a compact vertically scrollable list with light thumbnail or ratio placeholders, status badges, prompt excerpts, and time metadata.

**Rationale:** The center pane is the gallery-sized viewing surface. The right rail should optimize for scanning and switching, not compete with the preview stage. This also keeps the layout stable even when some items have no output image because they are still pending, failed, or cancelled.

**History affordances:**
- status filters across `All`, `In progress`, `Succeeded`, `Failed`, `Cancelled`
- newest-first ordering
- load more or infinite pagination later; phase 1 can start with paginated load more
- selected state highlight

**Thumbnail behavior:**
- `succeeded`: show image thumbnail if available from current data path
- non-succeeded: show ratio-aware placeholder frame

**Alternatives considered:**
- dense gallery grid in the rail: rejected because it weakens scanability and steals attention from the selected preview
- raw table view: rejected because it feels operational rather than studio-like

### 10. Preserve the "generation history" mental model and avoid cross-linking into a broader image library flow

**Choice:** The page presents outputs as results of generation jobs, not as assets that now primarily belong to another library feature.

**Rationale:** The user explicitly wants generated images to remain in generation history UX. Even if backend storage reuses image records under the hood, the product experience for this page should stay focused on:
- prompt
- job lifecycle
- final generated output
- regeneration from the same settings

That means the main post-success actions are:
- `Download`
- `Open full size`
- `Copy prompt`
- `Generate again`

It does not mean:
- "Move to library"
- "Manage in image repository"
- "Edit in image catalog"

**Alternatives considered:**
- immediately redirect or cross-promote into image management after success: rejected because it changes the mental model of the page and the user explicitly does not want that

### 11. Responsive behavior keeps the studio hierarchy but simplifies the layout on smaller screens

**Choice:** Preserve the same conceptual regions on smaller viewports, but stack them instead of maintaining three narrow columns.

**Responsive plan:**
- desktop: three columns visible simultaneously
- tablet: compose and preview remain prominent; history becomes a narrower lower-priority rail or stacked section
- mobile: compose first, active preview second, history third

**Rationale:** The center pane must remain readable. Forcing three columns on small screens would make prompt writing and image viewing materially worse. The layout should preserve the same mental model, but translate it into a vertical flow.

**Mobile interaction rules:**
- selected job remains visible in the preview section
- history remains accessible without hidden state dependencies
- compose stays near the top to preserve creation as the primary action

**Alternatives considered:**
- hide history behind a tab or sheet by default on all small screens: rejected because history is a core part of the product concept, not an advanced tool
- keep the desktop grid and let columns shrink aggressively: rejected because it harms prompt editing and image readability

### 12. Reuse existing frontend patterns where they fit, but create a dedicated `text-to-image` feature slice

**Choice:** Build the implementation under `src/features/text-to-image/`, borrowing patterns from `tts-ui` and the shared socket/query layers rather than extending `tts` or `voice-cloning`.

**Rationale:** The page shares workflow DNA with TTS, but the domain model, output medium, and active preview behavior are different enough to deserve their own feature boundary. Keeping a dedicated slice also makes future phase-2 work easier.

**Planned file structure direction:**
- `src/features/text-to-image/components/text-to-image-page.tsx`
- `src/features/text-to-image/components/text-to-image-compose-form.tsx`
- `src/features/text-to-image/components/text-to-image-preview-panel.tsx`
- `src/features/text-to-image/components/text-to-image-history-list.tsx`
- `src/features/text-to-image/components/text-to-image-history-item.tsx`
- `src/features/text-to-image/hooks/use-image-generation-history.ts`
- `src/features/text-to-image/hooks/use-image-generation-detail.ts`
- `src/features/text-to-image/hooks/use-create-text-to-image-job.ts`
- `src/features/text-to-image/hooks/use-cancel-text-to-image-job.ts`
- `src/features/text-to-image/hooks/use-image-generation-lifecycle-subscriptions.ts`
- `src/features/text-to-image/schemas/text-to-image.schema.ts`
- `src/features/text-to-image/query-keys.ts`
- `src/features/text-to-image/types/text-to-image.types.ts`

**Alternatives considered:**
- place implementation under `src/features/images/`: rejected because no frontend image-management feature currently owns this workflow and the job semantics are distinct
- fold the feature into `tts` as another generator page: rejected because that would create an artificial cross-domain feature bucket

### 13. Reuse installed shadcn primitives first and install only the missing controls the studio page genuinely needs

**Choice:** Build the page primarily from the shadcn/ui primitives already present in `src/components/ui/`, and add only the missing catalog-backed primitives that materially improve the text-to-image workflow.

**Rationale:** The MCP catalog shows a broad set of available shadcn/ui v4 components, while the current frontend already includes many of the exact primitives this page needs. The most maintainable path is:

- reuse existing installed primitives where they already cover the requirement
- install a small number of missing primitives where they map cleanly to the chosen UX
- avoid creating custom UI primitives when a first-party shadcn component already fits

**Reuse from current project:**
- `card` for the compose panel, preview shell, and history rail containers
- `button` for primary and secondary actions
- `textarea`, `input`, and `label` for the compose form
- `collapsible` for advanced settings
- `badge` for lifecycle state labels
- `scroll-area` for the history rail
- `separator` for panel subdivision
- `skeleton` for loading treatments
- `sheet` for any mobile or compact supporting interaction if needed
- `tooltip` for compact action affordances and icon-only states

**Install for this feature:**
- `switch` for the `prompt_optimizer` control
- `toggle-group` for the aspect ratio selector so ratio choices behave like a single visual selection set
- `aspect-ratio` for ratio-aware preview placeholders and stable image framing
- `pagination` for a richer history pagination affordance if the feature moves beyond a simple `Load more` button

**Installation strategy:**
- install the missing shadcn/ui components before composing the page UI
- continue using local wrappers under `src/components/ui/` so feature code imports the same way as the rest of the app
- treat `pagination` as optional if implementation confirms that a simple `Load more` button remains the better MVP affordance, but still document it as the preferred first-party option

**Alternatives considered:**
- build all missing controls as custom feature-local components: rejected because it duplicates a design system already available through shadcn/ui
- install a wide bundle of new primitives up front: rejected because this page only needs a narrow set of additional controls
- use non-shadcn third-party form and layout libraries for these primitives: rejected because the app already standardizes on shadcn/ui patterns

## Risks / Trade-offs

- **[Socket events can arrive before or after current visible queries are loaded]** -> Prefer job ID-based patching when safe and fall back to query invalidation so REST remains the reconciliation layer
- **[List data may not include everything needed for rich thumbnails]** -> Keep the history rail lightweight and allow the center detail pane to be the only guaranteed full-fidelity surface
- **[Auto-selecting the newest or newly created job may surprise some users]** -> Make selection behavior consistent and visually obvious so the preview pane always clearly reflects the active item
- **[Status filter vocabulary can drift from backend vocabulary]** -> Internally preserve raw statuses while allowing small UX-friendly groupings like `In progress` only when mappings are deterministic
- **[Keeping history visible on mobile can create a long page]** -> Use vertical stacking with compact item density rather than hiding history completely behind secondary navigation
- **[The feature may later need richer local state as real-time behavior grows]** -> Start with minimal feature-local state and React Query; introduce a dedicated store only if implementation pressure appears during build
- **[The studio aesthetic could drift too far from the existing app shell]** -> Reuse current dark shell, spacing, and card language; add only subtle creative affordances in the preview stage and ratio controls
- **[Some desired shadcn primitives are not yet installed in the project]** -> Install only the missing catalog-backed components (`switch`, `toggle-group`, `aspect-ratio`, and optionally `pagination`) before building the feature UI

## Migration Plan

1. Add `design.md` to lock page architecture, state boundaries, and interaction rules before spec and implementation work
2. Install the missing shadcn/ui primitives needed by the page and confirm they integrate cleanly with the existing `src/components/ui/` surface
3. Add or update routing and sidebar navigation so the new page has a stable entry point in the authenticated shell
4. Create the `text-to-image` feature slice with types, query keys, and API hooks aligned to current backend endpoints
5. Implement the compose form and validation first so create-job behavior is grounded in the backend contract
6. Implement the history rail using paginated summaries and selection state
7. Implement the selected-job preview/detail panel and success/failure/cancelled terminal states
8. Wire in lifecycle subscriptions so history and selected detail stay current during `pending` and `processing`
9. Verify refresh, reconnect, and missed-event behavior by forcing REST refetch paths
10. Verify responsive behavior across desktop, tablet, and mobile layouts

Rollback is low risk because this is a net-new route and feature slice. The page can be removed from routing and sidebar navigation without affecting existing TTS, voice cloning, or multi-agent workflows.

## Open Questions

- None blocking at this time. The major product decisions for phase 1 have been explicitly chosen: standalone route, member-scoped history, creative-studio presentation, generation-history mental model, and strict alignment with current backend capability.
