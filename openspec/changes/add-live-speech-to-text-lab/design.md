## Context

`war_mind_fe` already has the authenticated application shell, grouped sidebar navigation, a shared Socket.IO client, a `SocketProvider`, and a reusable subscription hook. The backend now exposes a live speech-to-text contract over that same authenticated Socket.IO channel, but the frontend has no dedicated page to validate the end-to-end flow from browser microphone capture through partial and final transcript rendering.

This change is intentionally an internal tool rather than an end-user dictation feature. The UI therefore needs to optimize for truthfulness, observability, and operational clarity over polish-heavy interaction design. The page must answer three things quickly:

- whether the shared authenticated socket is ready
- whether microphone capture is working and audio is being emitted in the expected format
- whether the backend stream lifecycle and transcript events behave correctly under normal and failing conditions

Current frontend constraints and relevant existing behavior:

- The authenticated shell is mounted through `MainLayout` and routed from `src/app/router.tsx`.
- The sidebar is driven by `src/widgets/sidebar/components/nav-main.tsx`.
- The app already uses feature-first slices (`src/features/<feature>/...`) and exports feature entrypoints from feature `index.ts` files.
- Shared Socket.IO transport is already implemented in `src/features/socket/`.
- Existing UI pages rely on shadcn/ui primitives and dark-mode-first neutral styling.
- The backend STT contract is fixed for phase 1:
  - browser only
  - `AudioWorklet` capture
  - `PCM16`, mono, `16kHz`
  - realtime `stt:start`, `stt:audio`, `stt:finalize`, `stt:stop`
  - outbound `stt:started`, `stt:partial`, `stt:final`, `stt:completed`, `stt:error`
  - one active stream per socket
  - transcript persistence is out of scope

This design needs to bridge three domains cleanly:

- browser audio capture and PCM framing
- socket event orchestration on top of the shared authenticated transport
- UI state and transcript presentation suitable for an internal lab page

## Goals / Non-Goals

**Goals:**
- Add a standalone authenticated `STT Lab` page reachable from the application sidebar
- Reuse the existing shared authenticated Socket.IO client instead of creating a new transport
- Implement microphone capture through `AudioWorklet` and emit raw binary PCM16 mono 16kHz audio chunks to the backend
- Model the stream lifecycle explicitly in the frontend: `idle`, `starting`, `streaming`, `finalizing`, `completed`, `error`, `stopped`
- Present partial and final transcripts with clear semantic separation so testers can verify commit boundaries visually
- Provide internal diagnostics for socket transport status, microphone readiness, stream identifiers, chunk counts, error payloads, and event sequencing
- Prioritize shadcn/ui primitives already present in the repo and add missing shadcn components only when they materially improve the lab workflow

**Non-Goals:**
- End-user dictation UX, prompt submission UX, or automatic message sending
- Transcript persistence, transcript history, or restoring prior STT sessions
- Downstream workflow or agent execution triggered from live transcripts
- Multiple simultaneous STT streams within one browser tab or one socket
- Browser-direct provider communication that bypasses the backend Socket.IO contract
- Multi-speaker diarization, waveform-quality audio review, or production-grade recording studio controls
- Reworking the shared socket infrastructure beyond the additions needed to consume the existing STT events

## Decisions

### 1. Add a standalone internal route at `/stt-lab` and expose it from the authenticated sidebar

**Choice**: Introduce a dedicated route `/stt-lab` rendered within the existing `MainLayout`, and add a new sidebar navigation item labeled `STT Lab`.

**Rationale**: This feature is a focused validation tool, not a sub-mode of an existing page. A dedicated route keeps the tooling isolated, makes direct linking easy for QA and development, and avoids polluting end-user flows such as chat compose or TTS.

**Alternatives considered**:
- Embed speech testing inside the chat workspace: would couple an internal validation tool to a product-facing flow and make stream-state debugging harder
- Add a modal or sheet launched from an existing page: too constrained for the amount of transcript and debug information that needs to be visible at once

**Implementation direction**:
- Add route wiring in `src/app/router.tsx`
- Add a new feature slice at `src/features/live-speech-to-text/`
- Update `NavMain` configuration to include `STT Lab`

### 2. Use a three-region lab workspace optimized for observability instead of a simple form page

**Choice**: Structure the page into three coordinated regions:
- `Session Control`
- `Transcript Stage`
- `Debug Timeline`

Desktop layout should be three-column; mobile should degrade to stacked panels or tabs.

**Rationale**: Internal STT testing needs simultaneous visibility into controls, transcript semantics, and low-level event flow. A simple single-column form would force testers to scroll between cause and effect. The three-region model keeps the full feedback loop visible.

**Alternatives considered**:
- Two-column layout only: too little room for persistent diagnostics
- One-column stack only: acceptable on small viewports but weak for desktop validation
- Heavy dashboard treatment with charts: unnecessary for phase 1 and risks obscuring the core lifecycle truth

**UI composition**:
- `Session Control`: start/finalize/stop actions, language selection, socket/mic/stream status, audio level meter, session stats
- `Transcript Stage`: committed transcript segments, current live partial text, final plain textarea
- `Debug Timeline`: ordered event feed with timestamps, event type badges, and short payload previews

### 3. Reuse the existing shared socket client and transport store; keep STT session state feature-local

**Choice**: Build STT on top of `useSocket`, `useSocketSubscription`, and `useSocketTransportStore`, but keep the active stream state local to the STT feature rather than adding a global Zustand store.

**Rationale**: Transport status is already global because it belongs to the shared socket connection. The live STT session, transcript buffers, debug log, and microphone resources are page-scoped and ephemeral. A feature-local hook avoids leaking tool state into the rest of the app and makes cleanup simpler when the page unmounts.

**Alternatives considered**:
- Add a new global Zustand store for STT: unnecessary persistence and higher coupling to the app shell
- Create a second socket namespace or raw websocket client just for STT: conflicts with the backend contract and duplicates transport concerns

**Implementation direction**:
- Keep connection status sourced from `useSocketTransportStore`
- Create a feature hook such as `useLiveSpeechToTextSession`
- Use `useReducer` inside the feature hook for deterministic state transitions and append-only debug event logging

### 4. Build the browser capture pipeline around `AudioWorklet` and emit binary `stt:audio` frames directly

**Choice**: Capture microphone audio with `getUserMedia`, pipe it through an `AudioWorkletNode`, convert audio to mono PCM16 at 16kHz, and emit binary payloads using the existing socket client as `socket.emit("stt:audio", metadata, audioBuffer)`.

**Rationale**: The backend contract already fixes `AudioWorklet`, binary PCM16, mono, and 16kHz. The frontend should not abstract away those details because this page exists partly to validate them. Sending binary buffers directly avoids base64 overhead and mirrors the backend expectation exactly.

**Alternatives considered**:
- `MediaRecorder` with compressed containers: simpler capture API but violates the fixed phase 1 contract and makes timing less explicit
- Server-side resampling: moves a frontend responsibility into the backend and creates ambiguity around the test surface
- Base64 encoding before emit: slower, larger, and explicitly discouraged by the integration guide

**Implementation direction**:
- Request microphone permission only when the user starts a session
- Use an `AudioContext` and `AudioWorkletNode`
- Keep chunk duration stable in the 20-40ms range
- Emit best-effort `sequence` and `timestamp_ms` metadata per chunk

### 5. Keep the worklet implementation as a small static module loaded by the page, not a generic shared audio framework

**Choice**: Create a narrowly scoped STT worklet module dedicated to this feature rather than inventing a generic audio engine abstraction.

**Rationale**: The page is an internal lab tool with a fixed backend audio contract. A small dedicated module is easier to reason about, easier to debug, and less likely to overfit future use cases prematurely.

**Alternatives considered**:
- Generic reusable audio framework shared across voice features: extra abstraction before the product has confirmed multiple capture-driven features
- Inline processing on the main thread: increases timing jitter and undermines the purpose of using `AudioWorklet`

**Implementation direction**:
- Store the worklet alongside the STT feature or in a narrowly named public worklet path
- Use a message channel from the worklet back to React code to deliver audio chunks and level information
- Keep conversion responsibilities inside the worklet:
  - downmix to mono
  - resample to 16kHz if needed
  - convert Float32 samples to signed PCM16 little-endian

### 6. Buffer a short pre-start audio queue and begin “Listening” only after `stt:started`

**Choice**: The UI should move to `starting` immediately after the user initiates a stream, but it should only show the fully active listening state once `stt:started` arrives. Audio frames captured before the ack should be kept in a very small in-memory queue and flushed once the stream is acknowledged.

**Rationale**: The backend guide allows the frontend to send audio before `stt:started`, but explicitly notes that waiting or briefly buffering gives a more stable UX. Without a short queue, early speech can be lost; without gating UI on `stt:started`, the page can claim to be listening before the backend has actually accepted the stream.

**Alternatives considered**:
- Send all audio immediately with no queue: simplest, but risks losing the first spoken words if the provider session is not yet ready
- Wait to start microphone capture until `stt:started`: safer for correctness, but adds latency and makes the start interaction feel sluggish

**Implementation direction**:
- Pre-start queue should be bounded by count or duration, not unbounded
- On `stt:started`, flush queued chunks in original order and switch to direct emit mode
- If `stt:error` happens before `stt:started`, discard the queue and tear down capture resources

### 7. Model transcript state as final segments plus one partial preview, not as one mutable text blob

**Choice**: Maintain transcript UI state in two parts:
- `finalSegments: Array<{ text; confidence?; startMs?; endMs? }>`
- `partialText: string`

Derive the textarea content from committed final segments rather than mutating one giant string in place.

**Rationale**: The backend contract makes a hard semantic distinction between partial and final transcript events. A segmented state model preserves that distinction, makes UI commit boundaries visible, and avoids accidentally treating provisional text as stable output.

**Alternatives considered**:
- Keep one mutable `transcript` string and overwrite it on every event: simpler but hides the difference between preview text and committed segments
- Store raw provider events only and compute everything on the fly: more complex than needed for the page

**Implementation direction**:
- `stt:partial` updates only `partialText`
- `stt:final` appends a new final segment and clears or replaces the corresponding partial preview
- `stt:completed` leaves the final segments intact for inspection
- The plain textarea displays the committed transcript only

### 8. Keep the final transcript output in a plain shadcn `Textarea` fed by committed segments only

**Choice**: Use a normal `Textarea` component as the final output surface, populated from committed segments, with actions such as copy and clear.

**Rationale**: The user explicitly wants a regular textarea rather than a richer prompt input. For an internal tool, a plain textarea is the most direct way to inspect, copy, and manually compare final output while avoiding product-specific composer behavior.

**Alternatives considered**:
- Reuse the multi-agent prompt input: wrong abstraction and wrong workflow for a standalone lab tool
- Render final text as read-only prose only: less useful for copy-paste and manual testing

**Implementation direction**:
- Use shadcn `Textarea`
- Default behavior is to mirror final committed segments
- Clear action resets transcript state for the next test run

### 9. Capture internal diagnostics as an append-only event timeline with capped retention

**Choice**: Maintain a local ordered debug timeline that records control events, transport events, transcript events, and failures with timestamps and compact payload previews.

**Rationale**: The page exists to validate the end-to-end pipeline, so the absence of visible sequencing would weaken its main value. An append-only timeline makes failure analysis faster without requiring browser devtools for basic verification.

**Alternatives considered**:
- No timeline, transcript only: insufficient for diagnosing whether failures occurred before, during, or after stream establishment
- Full raw JSON inspector by default: too noisy for primary use

**Implementation direction**:
- Record outbound intents such as `start-sent`, `audio-sent`, `finalize-sent`, `stop-sent`
- Record inbound events such as `started`, `partial`, `final`, `completed`, `error`
- Record transport warnings such as disconnected socket or denied microphone permission
- Cap retention to a fixed number of events such as 200 to avoid unbounded memory growth

### 10. Use shadcn/ui primitives aggressively and install only the few missing items that improve the lab materially

**Choice**: Reuse the app’s existing shadcn stack for layout and state presentation, and add missing shadcn items such as `alert`, `progress`, `empty`, and optionally `resizable`.

**Rationale**: The app already uses shadcn with `new-york`, neutral base colors, and Lucide icons. Reusing that system keeps the lab page visually native to the application and reduces maintenance cost. Only a few extra components add real value here.

**Recommended mapping**:
- existing:
  - `Card`, `Badge`, `Button`, `Select`, `Textarea`, `ScrollArea`, `Separator`, `Sidebar`, `Tabs`, `Tooltip`, `Spinner`
- add:
  - `Alert` for transport and stream errors
  - `Progress` for the audio level meter
  - `Empty` for transcript and debug empty states
  - `Resizable` if desktop panel resizing is implemented

**Alternatives considered**:
- Build bespoke utility components for every lab panel: unnecessary duplication of design system primitives
- Use community drop-in logging or waveform packages for panel chrome: overkill for simple internal diagnostics

### 11. Keep microphone, worklet, and stream cleanup aggressive and centralized

**Choice**: Centralize teardown in one cleanup path invoked on `completed`, `error`, `stop`, provider failure, and component unmount.

**Rationale**: Microphone resources, audio contexts, event listeners, and socket subscriptions are easy to leak in realtime features. A single cleanup path lowers the chance of zombie microphone capture, duplicate listeners, or a stuck stream state between test runs.

**Alternatives considered**:
- Scatter cleanup across each button handler and event callback: more brittle and harder to audit

**Implementation direction**:
- Stop all `MediaStreamTrack`s
- Disconnect `AudioWorkletNode` and any analyser/source nodes
- Close or suspend the `AudioContext`
- Clear pre-start audio queue
- Reset local emission counters and partial state as appropriate

### 12. Treat confidence and time-range metadata as optional enrichments, not primary UI

**Choice**: Preserve `confidence`, `start_ms`, and `end_ms` when present on `stt:final`, but render them in a low-emphasis secondary treatment or only in debug views.

**Rationale**: The user indicated these values are nice to have but not required. They should not dominate the transcript stage or complicate the core page contract.

**Alternatives considered**:
- Omit metadata entirely: loses potentially useful debugging signal
- Make metadata prominent in the main transcript view: visually noisy for routine testing

## Risks / Trade-offs

**[AudioWorklet setup differs across browsers and sample rates]** → Keep the feature explicitly browser-scoped, validate only supported capture paths, and surface microphone or worklet failures through inline alerts and the debug timeline.

**[Short pre-start buffering can still drop some earliest speech under extreme latency]** → Bound the queue and document that the page is a validation tool, not a guaranteed-lossless recorder. Favor correctness and transparency over pretending the start boundary does not exist.

**[Binary audio emits can overwhelm the page if cleanup leaks duplicate listeners]** → Centralize lifecycle cleanup and keep STT session state local to one hook tied to page mount.

**[The existing sidebar spec is already behind actual code reality]** → Update the delta spec with the full new requirement block reflecting the intended grouped navigation end state, not just the incremental STT addition.

**[Adding `resizable` introduces an extra dependency]** → Treat `resizable` as optional for implementation. The design supports a fixed CSS grid fallback if dependency cost is not justified.

**[Textarea mirroring final segments can create ambiguity if users manually edit the value]** → Define the textarea primarily as committed-output display with utility actions. Avoid product semantics such as autosend or form submission in phase 1.

**[Socket connection state belongs to the shared app, not only this page]** → Read from the existing transport store rather than inferring transport status from STT events alone, so the lab does not lie about underlying connectivity.

## Migration Plan

1. Add the new feature slice `src/features/live-speech-to-text/` with local types, hooks, audio helpers/worklet, and page components.
2. Add or generate any missing shadcn/ui components needed for the lab page, prioritizing `alert`, `progress`, and `empty`.
3. Wire the new `STT Lab` route into `src/app/router.tsx`.
4. Update sidebar navigation configuration to include the new page.
5. Implement the page in incremental layers:
   - transport and readiness indicators
   - microphone start/stop/finalize controls
   - transcript stage
   - debug timeline
6. Verify happy-path behavior against the backend contract:
   - socket connected
   - `stt:start`
   - binary `stt:audio`
   - `stt:partial`
   - `stt:final`
   - `stt:completed`
7. Verify failure-path behavior:
   - microphone permission denied
   - disconnected socket
   - invalid stream lifecycle
   - backend `stt:error`
8. If rollout needs to be reversed, remove the route and sidebar item and leave the existing shared socket infrastructure untouched.

## Open Questions

- Whether the desktop implementation should ship with a fixed three-column CSS grid first or add `ResizablePanelGroup` in the first pass
- Whether final-segment metadata (`confidence`, `start_ms`, `end_ms`) should appear inline in the committed transcript panel by default or only inside the debug timeline/details view
