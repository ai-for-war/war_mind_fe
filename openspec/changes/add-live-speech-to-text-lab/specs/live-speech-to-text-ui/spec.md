## ADDED Requirements

### Requirement: Standalone STT Lab page in the authenticated app shell
The system SHALL provide a standalone `STT Lab` page within the authenticated application shell at route `/stt-lab`. The page SHALL render inside the existing `MainLayout` and SHALL be intended for internal live speech-to-text validation rather than end-user dictation workflows.

#### Scenario: Navigate to the STT Lab page
- **WHEN** an authenticated user navigates to `/stt-lab`
- **THEN** the application renders the `STT Lab` page inside the existing protected shell

#### Scenario: Redirect unauthenticated user away from the STT Lab page
- **WHEN** an unauthenticated user attempts to access `/stt-lab`
- **THEN** the protected routing flow redirects the user to `/login`

### Requirement: STT Lab uses a three-region workspace optimized for testing
The `STT Lab` page SHALL present three coordinated regions for internal testing:
- a `Session Control` region
- a `Transcript Stage` region
- a `Debug Timeline` region

On desktop viewports, these regions SHALL be visible together. On smaller viewports, the page SHALL preserve access to all three regions through stacked panels or equivalent responsive layout behavior.

#### Scenario: Desktop workspace shows all testing regions together
- **WHEN** an authenticated user opens `/stt-lab` on a desktop viewport
- **THEN** the page displays `Session Control`, `Transcript Stage`, and `Debug Timeline` together in the same workspace

#### Scenario: Smaller viewport preserves all testing regions
- **WHEN** an authenticated user opens `/stt-lab` on a smaller viewport
- **THEN** the page still exposes `Session Control`, `Transcript Stage`, and `Debug Timeline` through a responsive stacked or equivalent layout

### Requirement: Session Control reflects socket, microphone, and stream readiness
The `Session Control` region SHALL display enough state for the tester to understand whether the live stream can be started and what phase it is currently in. The region SHALL expose at least:
- shared socket transport readiness
- microphone readiness or failure
- current STT stream state
- current stream identifier when a stream exists
- a language selector
- controls for `Start Recording`, `Finalize`, and `Stop`

The frontend SHALL support at least these stream states:
- `idle`
- `starting`
- `streaming`
- `finalizing`
- `completed`
- `error`
- `stopped`

#### Scenario: Ready state before streaming
- **WHEN** the shared socket transport is connected and no STT stream is active
- **THEN** the `Session Control` region shows the socket as ready and the stream state as `idle`

#### Scenario: Stream state becomes streaming only after backend acknowledgement
- **WHEN** the user starts a stream and the backend emits `stt:started`
- **THEN** the `Session Control` region shows the stream as active in the `streaming` state

#### Scenario: Stream state reflects a finalizing session
- **WHEN** the user requests normal stream completion through `Finalize`
- **THEN** the `Session Control` region shows the stream state as `finalizing` until the session completes or fails

### Requirement: Frontend starts live STT using the shared authenticated Socket.IO client
The frontend SHALL start live STT using the existing shared authenticated Socket.IO client already mounted in the protected application shell. The frontend SHALL NOT create a second realtime transport for this page.

To start a stream, the frontend SHALL:
- ensure the shared socket is available
- request microphone access from the browser
- create a new client-generated `stream_id`
- emit `stt:start` with the configured stream metadata
- emit `stt:audio` binary chunks associated with that active stream

#### Scenario: Successful stream start over the shared socket
- **WHEN** the shared socket is connected, microphone access is granted, and the user starts a new stream
- **THEN** the frontend emits `stt:start` for a new `stream_id` and begins the STT start flow on the shared authenticated Socket.IO client

#### Scenario: Cannot start when socket is unavailable
- **WHEN** the user attempts to start a stream while the shared socket transport is not connected
- **THEN** the frontend does not create an STT stream and instead surfaces that the socket is not ready

### Requirement: Frontend captures browser microphone audio in the phase 1 STT format
The frontend SHALL capture browser microphone audio for `STT Lab` according to the backend phase 1 audio contract:
- browser microphone input
- `AudioWorklet` capture path
- mono PCM16 audio
- sample rate `16000`
- binary chunk emission for `stt:audio`
- per-chunk `sequence` metadata that increases monotonically within one stream

The frontend SHALL NOT base64-encode live audio chunks for STT transport.

#### Scenario: Emit valid binary audio chunks for an active stream
- **WHEN** an STT stream is active and microphone capture is running
- **THEN** the frontend emits binary `stt:audio` payloads for that stream using the expected phase 1 contract

#### Scenario: Monotonic sequence values during one stream
- **WHEN** multiple `stt:audio` chunks are emitted for one active stream
- **THEN** each emitted chunk includes a `sequence` value that increases monotonically within that stream

### Requirement: Finalize and Stop are distinct user actions with distinct UI behavior
The frontend SHALL expose `Finalize` and `Stop` as separate actions and SHALL treat them differently in the UI.

- `Finalize` SHALL represent the normal completion path that asks the backend to flush remaining transcript output before completion
- `Stop` SHALL represent an immediate termination path for cancellation or forced cleanup

#### Scenario: Normal completion through Finalize
- **WHEN** the user clicks `Finalize` while a stream is active
- **THEN** the frontend stops local capture, emits `stt:finalize`, and waits for remaining `stt:final` events and `stt:completed`

#### Scenario: Forced stop through Stop
- **WHEN** the user clicks `Stop` while a stream is active
- **THEN** the frontend stops local capture, emits `stt:stop`, and transitions the page out of the active streaming flow without waiting for a normal finalization path

### Requirement: Transcript Stage separates committed final text from live partial preview
The `Transcript Stage` region SHALL render the live transcript using separate surfaces for committed and uncommitted text.

- `stt:partial` SHALL be shown as the current live preview only
- `stt:final` SHALL be appended to committed transcript segments
- committed transcript segments SHALL remain visible after commit for inspection

The UI SHALL NOT treat `stt:partial` text as permanently committed transcript content.

#### Scenario: Render live partial text without committing it
- **WHEN** the backend emits `stt:partial`
- **THEN** the `Transcript Stage` displays that text in the current live preview region without permanently appending it to committed transcript segments

#### Scenario: Commit a final transcript segment
- **WHEN** the backend emits `stt:final`
- **THEN** the `Transcript Stage` appends the segment to committed transcript content and clears or replaces the corresponding live partial preview

### Requirement: Final transcript textarea mirrors committed transcript output
The `Transcript Stage` region SHALL provide a plain textarea that contains the committed transcript output for the current test run. The textarea SHALL be assembled from committed `stt:final` segments rather than from `stt:partial` previews.

#### Scenario: Textarea updates after a final segment arrives
- **WHEN** the backend emits `stt:final`
- **THEN** the textarea content updates to include the newly committed transcript segment

#### Scenario: Partial preview does not update committed textarea content
- **WHEN** the backend emits `stt:partial` without a new `stt:final`
- **THEN** the committed transcript textarea does not permanently change from that partial event alone

### Requirement: Debug Timeline records the ordered STT lifecycle for the current page session
The `Debug Timeline` region SHALL display an ordered event feed for the current page session. The feed SHALL include relevant outbound intents and inbound STT events so testers can inspect sequencing without leaving the page.

The timeline SHALL cover at least:
- stream start intent
- stream acknowledgement
- partial transcript events
- final transcript events
- completion events
- error events

#### Scenario: Timeline shows start and acknowledgement sequence
- **WHEN** the user starts a stream and the backend acknowledges it
- **THEN** the `Debug Timeline` shows an ordered record of the start attempt followed by the acknowledgement event

#### Scenario: Timeline shows transcript and completion events
- **WHEN** a stream produces transcript output and then completes
- **THEN** the `Debug Timeline` shows the emitted `partial`, `final`, and `completed` events in order for that session

### Requirement: STT Lab surfaces stream and transport failures clearly and cleans up active resources
The page SHALL surface STT failures and readiness problems in the UI and SHALL clean up active stream resources when the stream ends, fails, or is manually stopped.

Cleanup SHALL occur for at least these situations:
- `stt:completed`
- `stt:error`
- manual `Stop`
- microphone permission failure
- page unmount while a stream is active

#### Scenario: Backend error during a stream
- **WHEN** the backend emits `stt:error`
- **THEN** the page displays the failure in the UI, records it in the `Debug Timeline`, and exits the active streaming flow with local resources cleaned up

#### Scenario: Microphone permission denied before start
- **WHEN** the browser denies microphone access for a new stream
- **THEN** the page surfaces that failure and does not enter the active streaming flow

#### Scenario: Page unmount during an active stream
- **WHEN** the `STT Lab` page unmounts while a stream is active
- **THEN** the frontend stops capture, releases local audio resources, and leaves no active STT session state attached to the page
