## Context

The backend already defines a concrete realtime interview assistant contract in `docs/interview/frontend_integration_guide.md`, but the frontend currently has only the shared Socket.IO transport layer and no interview-specific runtime. This creates a gap at three levels:

- no browser media orchestration for two independent sources
- no audio transform path that can produce backend-compatible `PCM16`, `16kHz`, `2-channel` interleaved frames
- no frontend state model that understands the semantics of `stt:partial`, `stt:final`, `stt:utterance_closed`, and `interview:answer:*`

The existing frontend architecture already gives us several building blocks:

- authenticated application shell
- shared Socket.IO client and subscription hook under `src/features/socket/`
- feature-first organization under `src/features/`
- Zustand used for client-side runtime state

This feature is different from the current REST-heavy features because it is a realtime runtime rather than a query-and-mutate screen. It has continuous media capture, binary socket streaming, event reduction, and hard-stop cleanup requirements. Those concerns justify a dedicated design before implementation.

Phase-one constraints for this change are explicit:

- Chromium-only browser support is acceptable
- the frontend generates `conversation_id`
- the frontend generates a fresh `stream_id` per start
- the `interviewer` source comes from Google Meet tab capture
- the `user` source comes from microphone capture
- the captured tab audio is assumed to be interviewer-only
- loss of socket, tab audio, or mic during an active session is a hard-stop condition

## Goals / Non-Goals

**Goals:**
- Add a dedicated interview lab feature slice under `src/features/interview-lab/`
- Create a browser runtime that starts only when auth, socket transport, microphone capture, and tab audio capture are all ready
- Transform the two browser audio sources into backend-compatible `stt:audio` binary frames
- Reduce backend STT and AI answer events into normalized client state with authoritative turn semantics
- Keep the interview lab page thin by moving orchestration into services and state into a feature-local store
- Make teardown deterministic so tracks, audio contexts, worklets, timers, and socket listeners do not leak across page mounts or failed sessions

**Non-Goals:**
- Supporting browsers outside Chromium in phase one
- Supporting more than two speakers or changing the backend `channel_map` contract
- Adding local VAD, local transcript inference, or any client-side turn-boundary logic
- Adding TTS, audio playback of AI answers, or reuse of prior AI answers in context
- Creating a generic reusable live STT platform feature before this interview-specific runtime is proven
- Supporting session resume across socket reconnects or browser refreshes

## Decisions

### 1. Implement the feature as a dedicated `interview-lab` feature slice

**Choice:** Build the implementation under `src/features/interview-lab/` instead of extending `src/features/socket/` or creating a generic `live-speech-to-text` abstraction.

**Rationale:** The runtime semantics are interview-specific, not generic STT. The browser sends a fixed two-lane speaker mapping, the backend emits `stt:utterance_closed` as an authoritative turn event, and AI answer aggregation is part of the same runtime. A generic abstraction this early would blur business rules and create an unstable API.

**Planned structure direction:**
- `components/` for the page shell only
- `hooks/` as React bindings into the runtime
- `stores/` for Zustand session state
- `services/` for orchestration, media capture, audio transform, socket adapter, and teardown
- `reducers/` for authoritative event reduction
- `types/`, `constants/`, and `utils/` for feature-local support code

**Alternatives considered:**
- extend `src/features/socket/`: rejected because transport is shared infrastructure, not the correct home for interview session rules
- create `src/features/live-speech-to-text/`: rejected because the current contract is not generic enough to justify a shared abstraction yet

### 2. Use one interview session controller as the single orchestration boundary

**Choice:** Introduce a single controller service that owns `start`, `stop`, `reset`, dependency coordination, and teardown.

**Rationale:** The runtime crosses multiple imperative systems:
- browser permission and media APIs
- Web Audio graph and worklet lifecycle
- binary socket emission
- state transitions and error handling

If those concerns are distributed directly across React hooks and components, race conditions become harder to reason about. A controller centralizes ordering rules:
- media must be ready before `stt:start`
- `stt:audio` must not start before `stt:started`
- hard-stop teardown must happen exactly once

**Controller responsibilities:**
- generate `conversation_id` and `stream_id`
- prepare required audio sources
- create and start the audio transform engine
- emit `stt:start`
- begin frame emission only after `stt:started`
- route inbound socket events into the reducer/store
- execute hard-stop and reset flows

**Alternatives considered:**
- component-only orchestration with several hooks: rejected because ordering and teardown would be spread across multiple React effects
- pushing orchestration into the Zustand store: rejected because the store should model state, not own browser and socket side effects

### 3. Model the runtime with an explicit session state machine

**Choice:** Use a small explicit session lifecycle in the store:
- `idle`
- `preparing_media`
- `media_ready`
- `starting`
- `streaming`
- `finalizing`
- `completed`
- `stopping`
- `stopped`
- `failed`

**Rationale:** This feature has real side-effect boundaries and terminal states. A boolean-based model such as `isLoading` or `isActive` would obscure important transitions:
- media can fail before socket start
- socket can accept the session before audio starts
- user stop differs from runtime failure
- cleanup may be in flight during stop

The explicit machine makes UI binding simpler and clarifies which commands are legal from each state.

**Important rules:**
- only `idle`, `stopped`, `completed`, and `failed` may start a fresh session
- only `streaming` and `starting` may transition into hard-stop from source loss
- `finalizing` exists for completeness but phase-one behavior is dominated by hard-stop

**Alternatives considered:**
- minimal `idle/active/error`: rejected because it cannot distinguish media preparation, accepted session startup, and teardown paths

### 4. Keep two distinct state layers: imperative runtime services and normalized client state

**Choice:** Separate runtime side effects from normalized domain state:
- services own media, worklet, socket emit, and teardown
- Zustand store owns normalized session state
- reducer owns event semantics

**Rationale:** The backend events are semantically rich. The page should not have to know that:
- `stt:partial` is full preview, not delta
- `stt:final` is stable fragment, not a closed turn
- `stt:utterance_closed` is the only authoritative transcript commit
- `interview:answer` and `interview:answer:completed` are duplicate final signals

That logic belongs in one reducer. The store then exposes stable state to the page:
- session status
- source readiness
- open utterances per speaker
- committed closed utterances
- answer state by `utterance_id`
- session-level errors

**Alternatives considered:**
- storing raw events and letting the page interpret them: rejected because it duplicates domain logic in the UI layer
- using React local state only: rejected because the runtime is too stateful and cross-cutting for one page component tree

### 5. Start audio emission only after `stt:started`

**Choice:** Prepare the browser audio graph before session start, but do not emit `stt:audio` frames until the backend responds with `stt:started`.

**Rationale:** The backend validates ownership and start payload before accepting audio. Starting frame emission before acknowledgement creates avoidable races:
- audio may be sent against a not-yet-created stream
- stream IDs from abandoned start attempts may leak into the transport
- error handling becomes ambiguous when the backend rejects startup

The chosen order is:
1. prepare media
2. create audio engine
3. emit `stt:start`
4. wait for `stt:started`
5. begin frame emission

**Alternatives considered:**
- optimistic frame emission immediately after `stt:start`: rejected because it weakens startup determinism without clear latency benefit

### 6. Use `AudioContext` plus `AudioWorklet` for the transform pipeline

**Choice:** Implement audio conversion through Web Audio with an `AudioWorklet`-based transform path rather than `MediaRecorder`, WebRTC sender hacks, or main-thread processing loops.

**Rationale:** The backend contract is strict:
- raw binary `PCM16`
- `16kHz`
- `2-channel`
- interleaved per sample

`MediaRecorder` does not provide that output format. Main-thread processing would risk timing instability and UI-thread contention. `AudioWorklet` is the most appropriate browser primitive for deterministic sample processing in Chromium.

**Pipeline shape:**
- capture interviewer tab stream
- capture user microphone stream
- convert each source to a mono lane
- resample to the output rate
- interleave `interviewer` then `user`
- encode to `PCM16`
- emit fixed-duration frame chunks to the socket adapter

The pipeline must preserve both lanes even when one source is silent by filling silence samples rather than changing the output contract.

**Alternatives considered:**
- `MediaRecorder`: rejected because output codec/container is wrong for backend requirements
- ScriptProcessorNode: rejected because it is legacy and less suitable than `AudioWorklet`

### 7. Treat the page as a thin runtime host, not the place where business logic lives

**Choice:** Keep `interview-lab-page.tsx` focused on page composition and user commands. Runtime semantics belong to controller, reducer, and store.

**Rationale:** The page needs to show and trigger:
- start
- stop
- reset
- current session status
- transcript state
- answer state

But it should not own:
- socket subscription wiring
- event filtering
- media track lifecycle
- teardown order
- transcript semantics

This keeps the page easy to replace or expand later while protecting the logic core.

**Alternatives considered:**
- page-local orchestration: rejected because the page would become the de facto runtime engine and be difficult to test or evolve

### 8. Filter inbound events by active session identity before reduction

**Choice:** All inbound interview events must be guarded against the current active `conversation_id` and `stream_id` before being reduced into store state.

**Rationale:** This prevents stale or delayed events from mutating a newly started session. It is especially important because:
- users may stop and restart quickly
- socket delivery is asynchronous
- old final events may arrive after local teardown

The guard utility should drop:
- events with missing session identifiers when the event type is expected to include them
- events whose identifiers do not match the current session
- events for inactive sessions after terminal teardown

**Alternatives considered:**
- trusting event timing alone: rejected because it makes fast restart behavior fragile

### 9. Use hard-stop teardown as the only recovery strategy for dependency loss

**Choice:** When socket, microphone, or interviewer tab audio is lost during an active session, the runtime uses hard-stop teardown and does not attempt graceful finalize or session resume.

**Rationale:** This is explicitly aligned with the chosen product behavior. It also keeps the runtime simpler and more honest:
- the backend stores live session state in memory and ties ownership to socket/session runtime
- a resumed or partially recovered local session would not map cleanly to backend session ownership
- a graceful finalize path after source loss may imply transcript integrity the client cannot guarantee

**Hard-stop sequence:**
1. mark the runtime as stopping
2. stop frame emission immediately
3. emit `stt:stop` when transport is still available
4. tear down tracks, worklet, audio context, subscriptions, and transient buffers
5. move into `stopped` for user-initiated stop or `failed` for dependency loss

**Alternatives considered:**
- auto-reconnect and resume same `stream_id`: rejected because backend ownership and session state do not support it
- fallback to `stt:finalize`: rejected because the chosen product rule is hard-stop

## Risks / Trade-offs

- **[Chromium-only capture assumptions may not hold identically across browsers or OS variants]** -> Restrict phase-one support to Chromium and explicitly gate unsupported environments before session start
- **[Google Meet tab capture may fail to provide audio or may end unexpectedly]** -> Treat missing or ended interviewer audio as a startup failure or hard-stop event rather than attempting degraded capture
- **[AudioWorklet integration adds implementation complexity]** -> Keep the transform boundary isolated in `audio-transform-engine.ts` with a small typed interface to the controller
- **[Delayed socket events could mutate a newer session]** -> Guard all inbound events by active identifiers before reduction
- **[Teardown bugs could leak media tracks or audio contexts across page mounts]** -> Centralize teardown in one service invoked by stop, failure, and unmount paths
- **[Zustand store shape can become noisy if it mixes raw events and normalized state]** -> Store normalized state only and keep raw socket semantics inside the reducer
- **[The feature is interview-specific and may later need generalization]** -> Prefer a clean interview-local boundary now; extract generic layers only after a second concrete use case appears

## Migration Plan

1. Create the `src/features/interview-lab/` slice with feature-local types, constants, store, reducer, and service boundaries
2. Implement the page shell and controller hook with no audio streaming first so lifecycle wiring can be exercised independently
3. Implement media capture management for microphone and Chromium tab audio, including startup validation and track-ended hooks
4. Implement the `AudioWorklet` transform path that produces backend-compatible interleaved `PCM16` frames
5. Implement the socket adapter and event subscriptions for `stt:*` and `interview:answer:*`
6. Implement reducer-driven transcript and answer state handling
7. Wire hard-stop teardown through user stop, dependency loss, and page unmount
8. Validate startup ordering, binary frame emission, transcript semantics, duplicate final-answer handling, and fast stop/start cycles

Rollback is low-risk because this is a net-new feature slice and page. The route and navigation entry can be removed without affecting existing socket infrastructure or other features.

## Open Questions

- None blocking for design. The critical product and runtime assumptions needed for phase one are already decided: Chromium-only support, frontend-generated identifiers, interviewer-only tab audio, and hard-stop behavior on dependency loss.
