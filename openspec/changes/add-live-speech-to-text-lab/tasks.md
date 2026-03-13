## 1. Setup & Feature Scaffolding

- [ ] 1.1 Add any missing shadcn/ui components needed for the lab page, prioritizing `alert`, `progress`, and `empty`, and decide whether `resizable` is included in the first pass
- [ ] 1.2 Create the `src/features/live-speech-to-text/` feature slice structure for `components`, `hooks`, `types`, and audio helper/worklet files
- [ ] 1.3 Add the feature entrypoint exports in `src/features/live-speech-to-text/index.ts`

## 2. Routing & Navigation

- [ ] 2.1 Add the authenticated `/stt-lab` route in `src/app/router.tsx` and wire it to a new `SttLabPage` component
- [ ] 2.2 Update `src/widgets/sidebar/components/nav-main.tsx` to add the `STT Lab` entry under the existing grouped navigation structure
- [ ] 2.3 Verify the sidebar active state highlights `STT Lab` when the current route is `/stt-lab`

## 3. STT Types & Event Contracts

- [ ] 3.1 Define frontend STT payload and event types for `stt:start`, `stt:audio`, `stt:finalize`, `stt:stop`, `stt:started`, `stt:partial`, `stt:final`, `stt:completed`, and `stt:error`
- [ ] 3.2 Define page-local types for stream state, transcript segments, debug timeline entries, and session stats
- [ ] 3.3 Add any small formatting helpers needed for timestamps, stream labels, textarea assembly, and debug preview text

## 4. Audio Capture Pipeline

- [ ] 4.1 Create the dedicated STT `AudioWorklet` module that downmixes input to mono, resamples to `16kHz` when needed, and converts audio to PCM16 little-endian chunks
- [ ] 4.2 Implement the browser microphone/audio helper that requests microphone access, loads the worklet, starts capture, and exposes chunk + level events back to React
- [ ] 4.3 Add aggressive cleanup for microphone tracks, `AudioContext`, worklet node, and any queued buffers so one session cannot leak into the next
- [ ] 4.4 Verify the emitted chunk shape is binary-safe and includes monotonically increasing `sequence` metadata for one active stream

## 5. Session Orchestration Hook

- [ ] 5.1 Implement a page-scoped hook such as `useLiveSpeechToTextSession` that owns stream lifecycle, transcript state, debug timeline, and cleanup
- [ ] 5.2 Integrate the hook with the existing shared socket client and `useSocketTransportStore` instead of creating a new transport
- [ ] 5.3 Implement the `Start Recording` flow: check socket readiness, request microphone access, generate `stream_id`, emit `stt:start`, and enter `starting`
- [ ] 5.4 Implement the bounded pre-start audio queue and flush it only after `stt:started` is received
- [ ] 5.5 Implement the active streaming path so audio chunks emit as `stt:audio` binary payloads with metadata once the stream is acknowledged
- [ ] 5.6 Implement the `Finalize` flow so local capture stops, `stt:finalize` is emitted, and the hook waits for trailing `stt:final` and `stt:completed`
- [ ] 5.7 Implement the `Stop` flow so local capture stops, `stt:stop` is emitted, and the session exits the active stream state without relying on normal finalization
- [ ] 5.8 Implement inbound event handling for `stt:started`, `stt:partial`, `stt:final`, `stt:completed`, and `stt:error`
- [ ] 5.9 Append internal debug timeline entries for outbound intents, inbound STT events, transport issues, and microphone failures with capped retention

## 6. Transcript State & Derived Output

- [ ] 6.1 Store transcript state as `finalSegments` plus `partialText` rather than as one mutable transcript string
- [ ] 6.2 Append committed transcript segments only from `stt:final` and clear or replace the corresponding live partial preview
- [ ] 6.3 Derive the final textarea value from committed segments only so `stt:partial` never becomes permanently committed output
- [ ] 6.4 Preserve optional final-segment metadata (`confidence`, `start_ms`, `end_ms`) in state for low-emphasis UI or debug rendering

## 7. STT Lab UI Components

- [ ] 7.1 Create `SttLabPage` as the page-level workspace shell for the lab
- [ ] 7.2 Create the `Session Control` panel using shadcn primitives to show socket readiness, microphone readiness, stream state, `stream_id`, language selection, and `Start` / `Finalize` / `Stop` actions
- [ ] 7.3 Create the audio activity meter using shadcn `Progress` or an equivalent reusable visualization fed by the worklet level output
- [ ] 7.4 Create the `Transcript Stage` panel with separate regions for committed transcript segments, current live partial text, and the final plain textarea
- [ ] 7.5 Create the `Debug Timeline` panel using scrollable shadcn layout primitives and event badges for lifecycle visibility
- [ ] 7.6 Add empty-state treatment for transcript/debug regions when no stream has run yet
- [ ] 7.7 Add copy and clear utility actions for the committed textarea without introducing prompt-submit behavior

## 8. Error, Readiness, and Cleanup UX

- [ ] 8.1 Surface socket transport problems in the page using the existing transport store plus an inline `Alert`
- [ ] 8.2 Surface microphone permission denial and worklet initialization failures clearly in the UI and in the debug timeline
- [ ] 8.3 Surface backend `stt:error` payloads with `error_code`, `error_message`, and retry context when available
- [ ] 8.4 Ensure page unmount or route change tears down active capture resources and leaves no active page-local STT session behind

## 9. Responsive Layout & Visual Integration

- [ ] 9.1 Implement the desktop-first three-region workspace using the existing dark neutral visual language of the app
- [ ] 9.2 Add smaller-viewport behavior that preserves access to `Session Control`, `Transcript Stage`, and `Debug Timeline` through stacked panels or tabs
- [ ] 9.3 Verify the new page feels consistent with the current app shell and uses existing shadcn/ui primitives wherever practical

## 10. Verification

- [ ] 10.1 Verify route and sidebar integration manually: authenticated navigation to `/stt-lab`, active sidebar highlight, and unauthenticated redirect behavior
- [ ] 10.2 Verify the happy path manually against the backend contract: `stt:start`, binary `stt:audio`, `stt:partial`, `stt:final`, `stt:finalize`, and `stt:completed`
- [ ] 10.3 Verify failure cases manually: disconnected socket, denied microphone permission, backend `stt:error`, and forced `Stop`
- [ ] 10.4 Run project validation relevant to the new code, including at least linting and any targeted checks available for the new feature slice
