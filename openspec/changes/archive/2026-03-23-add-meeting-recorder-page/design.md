## Context

The backend already exposes a concrete live meeting contract in `docs/meeting/frontend_integration_guide.md`, but the frontend currently has no meeting-specific runtime. The application does already have several relevant building blocks:

- authenticated application shell and protected routes
- shared Socket.IO transport and organization-scoped subscription support under `src/features/socket/`
- a realtime `interview-lab` feature that already demonstrates the repo pattern for controller, reducer, store, and browser audio processing
- feature-first organization under `src/features/`

The meeting recorder feature is similar to the interview runtime in that it is a live browser media flow, but its semantics are different enough that a direct reuse would be misleading:

- backend meeting audio is `PCM16`, `16kHz`, `1-channel`, not stereo speaker-mapped audio
- backend emits `meeting:final` and `meeting:utterance_closed`, but no `meeting:partial`
- AI output is additive `meeting:note:created` chunks, not token-streamed answer text
- outbound events are emitted to the user room rather than a meeting room, so frontend filtering must be stricter
- `meeting:completed` and `meeting:interrupted` do not mean notes are finished; tail note chunks may arrive later

The product constraints for phase one are also explicit:

- production page, not a lab-only debug screen
- Chromium-based desktop browsers are acceptable as the supported browser scope
- audio comes from two browser sources: shared meeting tab audio plus local microphone
- the frontend mixes both sources into one mono stream before upload
- session resume/history replay is out of scope
- `meeting:error` is terminal
- user stop uses `meeting:finalize`; forced teardown uses `meeting:stop`

These constraints justify a dedicated design before implementation because the change crosses browser media APIs, Web Audio processing, Socket.IO lifecycle, reducer semantics, app routing, and sidebar navigation.

## Goals / Non-Goals

**Goals:**
- Add a dedicated `meeting-recorder` feature slice under `src/features/meeting-recorder/`
- Reuse the shared Socket.IO client while keeping meeting-specific business rules isolated from `interview-lab`
- Capture meeting tab audio and local microphone audio, mix them into backend-compatible mono `PCM16` frames, and stream them over Socket.IO
- Normalize meeting events into frontend state that separates realtime transcript drafts, canonical transcript timeline, and additive AI note chunks
- Keep the page component thin by moving orchestration into services and normalized state into a feature-local store
- Preserve completed/interrupted session state while still accepting late `meeting:note:created` events for the active `meeting_id`
- Expose the feature through a dedicated route and sidebar navigation entry

**Non-Goals:**
- Supporting browsers outside Chromium-based desktop browsers in phase one
- Supporting session resume, event replay, or history reconstruction after reload
- Mapping `speaker_label` values to real participant identities
- Reusing the interview runtime as a shared generic live-meeting platform before this meeting-specific flow is validated
- Adding meeting title requirements, export flows, or history APIs
- Introducing a backend completion signal for note draining in this change

## Decisions

### 1. Implement the feature as a dedicated `meeting-recorder` feature slice

**Choice:** Build the implementation under `src/features/meeting-recorder/` rather than extending `src/features/interview-lab/` or creating a generic shared realtime-meeting abstraction.

**Rationale:** The interview runtime and the meeting runtime share infrastructure patterns but not the same business semantics. The interview flow is speaker-lane based and answer-stream based; the meeting flow is mono-upload based and note-chunk based. Keeping meeting logic local avoids coupling unrelated reducers, store shapes, and audio contracts.

**Planned structure direction:**
- `components/` for the production page shell
- `hooks/` for React bindings into the controller/runtime
- `stores/` for Zustand session state
- `reducers/` for authoritative event reduction
- `services/` for media capture, audio transform, socket adapter, controller, and teardown
- `types/`, `constants/`, and `utils/` for feature-local support code

**Alternatives considered:**
- extend `interview-lab`: rejected because it would mix incompatible runtime semantics into one feature slice
- create a generic realtime meeting/stt core now: rejected because there is only one confirmed production use case and the abstraction boundary is still unstable

### 2. Use one meeting session controller as the orchestration boundary

**Choice:** Introduce a single controller service that owns session startup, acknowledgement waiting, stop/finalize behavior, runtime teardown, and inbound event routing.

**Rationale:** The meeting runtime crosses multiple imperative systems:
- browser permission and capture APIs
- Web Audio graph and worklet lifecycle
- binary socket emission
- late asynchronous note delivery after terminal transcript lifecycle
- session-level state transitions and error handling

If those concerns are split across multiple React effects, the ordering rules become fragile. A controller keeps the lifecycle deterministic:
1. validate auth/socket/org prerequisites
2. prepare both audio sources
3. create the audio transform engine
4. emit `meeting:start`
5. wait for `meeting:started`
6. start audio emission
7. on user stop, emit `meeting:finalize`
8. on terminal events, stop capture/send but keep note listeners alive until page reset or unmount

**Alternatives considered:**
- page-only orchestration: rejected because cleanup and ordering would be spread across component effects
- pushing side effects into Zustand actions: rejected because the store should model state, not own browser/media side effects

### 3. Model session state so capture lifecycle and note-listening lifecycle can diverge

**Choice:** Use an explicit meeting session lifecycle with states such as:
- `idle`
- `preparing_media`
- `media_ready`
- `starting`
- `streaming`
- `finalizing`
- `completed`
- `interrupted`
- `failed`
- `stopped`

The controller will treat `completed` and `interrupted` as terminal for capture/upload, but not terminal for note ingestion.

**Rationale:** The most important semantic difference in this feature is that the live meeting session can be over while the note pipeline is still active. A minimal state model such as `idle/active/error` would collapse two distinct truths:
- browser capture is done
- note chunks may still arrive for the same `meeting_id`

The store therefore needs to preserve:
- active session identifiers
- transcript data already committed
- note chunks already received
- a soft UI signal that final AI notes may still arrive

**Alternatives considered:**
- dispose the whole runtime immediately on `meeting:completed`: rejected because late note chunks would be lost
- treat late note delivery as a page concern instead of a runtime concern: rejected because session identity matching belongs in the runtime layer

### 4. Build a dedicated mono mixing pipeline instead of reusing the interview stereo pipeline

**Choice:** Implement a meeting-specific audio transform engine using `AudioContext` plus `AudioWorklet`, but produce a single mixed mono output instead of dual interleaved speaker lanes.

**Rationale:** The existing interview pipeline is useful as a reference for browser capture and worklet-driven processing, but its output contract is wrong for this feature. The backend meeting runtime expects:
- `encoding = linear16`
- `sample_rate = 16000`
- `channels = 1`
- raw PCM16 binary

The cleanest approach is:
1. capture shared meeting tab audio
2. capture microphone audio
3. normalize each source to mono
4. mix the two mono lanes into one mono stream inside Web Audio
5. resample to `16kHz`
6. encode to `PCM16`
7. emit fixed-duration binary frames via `meeting:audio`

Using Web Audio for the mix keeps timing stable and avoids duplicating queue logic in React or on the main thread.

**Alternatives considered:**
- reuse the interview audio engine and downmix later: rejected because it adds unnecessary stereo-specific complexity to a mono contract
- `MediaRecorder`: rejected because it does not produce the raw PCM format required by the backend
- main-thread sample mixing: rejected because it is more sensitive to UI thread contention and timing jitter

### 5. Reduce backend events into three normalized data layers

**Choice:** Normalize meeting data into three separate layers inside the meeting store:
- lifecycle state
- transcript state
- note state

**Transcript layer:**
- `meeting:final` updates realtime draft utterance state keyed by `utterance_id`
- `meeting:utterance_closed` appends authoritative transcript entries keyed by `sequence`

**Note layer:**
- `meeting:note:created` appends additive note chunks keyed by `meeting_id`
- derived selectors merge those chunks into aggregate `key_points`, `decisions`, and `action_items` for display

**Rationale:** The backend explicitly distinguishes transcript events from note events. The frontend should preserve that distinction rather than trying to flatten everything into one list. This also lets the page show both:
- a stable transcript timeline
- individual note chunk cards with authoritative ranges such as `1..7`, `8..14`

**Alternatives considered:**
- storing raw socket events and deriving everything in the page: rejected because page components should not own business semantics
- replacing note state with a merged snapshot on every chunk: rejected because the backend contract is additive, not snapshot-based, and the UI needs chunk ranges

### 6. Filter inbound events by `organization_id` first, then by `stream_id` and `meeting_id`

**Choice:** All meeting inbound events will be filtered in the runtime before reduction using a layered identity check:
1. `organization_id` must match the active organization
2. `stream_id` must match for live transcript lifecycle events
3. `meeting_id` must match once bound by `meeting:started`
4. `meeting:note:created` must be matched by `meeting_id` because it does not include `stream_id`

**Rationale:** Backend delivery is scoped to a user room, not a meeting room. That means the same user may receive events on multiple sockets or tabs. Without strict filtering, one page could render transcript or notes from another page's session.

This is stricter than the interview runtime because organization-scoped filtering alone is not sufficient for meeting events.

**Alternatives considered:**
- rely only on the shared `organizationScoped` socket hook: rejected because it does not protect against multiple meeting sessions within the same organization
- trust event arrival timing: rejected because terminal events and late notes may arrive after a fast restart or from another tab

### 7. Use `meeting:finalize` for normal stop and reserve `meeting:stop` for forced teardown

**Choice:** The page-level stop command maps to graceful finalize, while forced teardown conditions map to stop.

**Normal path:**
- user clicks stop
- controller emits `meeting:finalize`
- local status moves to `finalizing`
- backend emits `meeting:completed` or `meeting:error`

**Forced path:**
- socket transport loss while active
- capture source loss before normal completion
- controller disposal while session is still live
- controller emits `meeting:stop` when possible

**Rationale:** This matches the agreed product behavior and aligns with backend semantics. It also keeps the user-facing stop path optimistic and clean while preserving an explicit forced-cleanup path for abnormal conditions.

**Alternatives considered:**
- always emit `meeting:stop`: rejected because it throws away the cleaner finalize path that the backend already provides
- always emit `meeting:finalize`, even on dependency loss: rejected because the client cannot guarantee a clean stream when a required dependency is already gone

### 8. Keep the page as a thin runtime host with shared language options

**Choice:** The meeting recorder page will consume normalized state from the store and use the same supported language option list already defined for `interview-lab`, instead of defining a second independent language source.

**Rationale:** The page needs to render:
- source readiness
- language selector
- transcript panels
- note chunk cards and aggregate notes
- terminal error state

But it should not own:
- socket listener wiring
- session identity matching
- media track lifecycle
- transcript semantics
- note aggregation rules

Reusing the interview language option list keeps the UX consistent and avoids drift between two pages that solve the same selection problem.

**Alternatives considered:**
- page-local event interpretation: rejected because it would duplicate runtime semantics in the UI layer
- independent meeting language list: rejected because it would introduce unnecessary product/config divergence

## Risks / Trade-offs

- **[Meeting tab audio may already contain the local speaker voice, causing double voice when mixed with the mic source]** -> Accept the risk for phase one, keep the mixing boundary isolated, and document the limitation in product copy if needed
- **[No backend event exists for “note processing fully complete”]** -> Represent the waiting state as a soft UI state after `completed` or `interrupted` and continue appending chunks without trying to infer a hard completion moment
- **[User-room event delivery can leak unrelated meeting events into the same browser tab]** -> Guard all meeting events by `organization_id`, `stream_id`, and `meeting_id` before reduction
- **[Teardown after completion is more complex because note listeners must survive longer than capture resources]** -> Split controller cleanup into capture/upload teardown versus full page disposal
- **[Chromium tab audio capture behavior varies across meeting products and OS/browser versions]** -> Gate the feature to Chromium-based desktop browsers and fail early when required tracks are unavailable
- **[State may be lost on reload because there is no replay/history API]** -> Treat the page as a live-only runtime and avoid building false expectations of persistence
- **[The meeting runtime may later need to share abstractions with interview runtime]** -> Prefer clear duplication at the feature boundary now and extract only after a second stable use case emerges

## Migration Plan

1. Create the `src/features/meeting-recorder/` slice with feature-local constants, types, store, reducer, services, hooks, and page component
2. Add the authenticated route and sidebar navigation entry for the meeting recorder page
3. Implement the meeting socket adapter and controller with start/finalize/stop/teardown ordering before wiring browser audio
4. Implement browser media capture for shared tab audio and microphone capture, including startup validation and source-ended hooks
5. Implement the meeting-specific audio transform engine that mixes both sources into mono `PCM16` frames and emits `meeting:audio`
6. Implement reducer-driven handling for `meeting:started`, `meeting:final`, `meeting:utterance_closed`, `meeting:note:created`, `meeting:completed`, `meeting:interrupted`, and `meeting:error`
7. Implement the page UI using normalized store state, including shared language selection, transcript panels, and note chunk cards with ranges
8. Validate the critical paths: startup prerequisites, acknowledgement gating, audio emission, terminal finalize flow, forced teardown, late note chunk handling, and route leave cleanup

Rollback is low risk because this is a net-new feature slice and navigation entry. The route and sidebar item can be removed without affecting existing authenticated features or shared socket infrastructure.

## Open Questions

- None blocking for design. The main product choices needed for implementation are already settled: Chromium-only support, dual-source capture mixed to mono, no resume/history, graceful finalize for user stop, and additive late note handling after meeting completion.
