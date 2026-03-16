## 1. Feature scaffolding and entry points

- [x] 1.1 Create the `src/features/interview-lab/` feature slice with `components`, `hooks`, `stores`, `services`, `reducers`, `types`, `constants`, and `utils`
- [x] 1.2 Add the feature barrel exports needed for the interview lab page to integrate cleanly with the existing app structure
- [x] 1.3 Add the authenticated route and page entry component for the interview lab feature
- [x] 1.4 Update sidebar navigation or other authenticated entry points so the interview lab page is reachable from the app shell

## 2. Runtime types, constants, and store

- [x] 2.1 Add interview session, transcript, socket payload, and audio pipeline TypeScript types under `src/features/interview-lab/types/`
- [x] 2.2 Add feature constants for session statuses, source roles, channel mapping, and audio metadata defaults under `src/features/interview-lab/constants/`
- [x] 2.3 Implement the Zustand interview session store for lifecycle status, source readiness, open utterances, closed utterances, AI answers, and session errors
- [x] 2.4 Add utility helpers for generating `conversation_id`, generating `stream_id`, guarding inbound events, and deduplicating final AI answer events

## 3. Transcript and answer reduction logic

- [x] 3.1 Implement the interview event reducer that normalizes `stt:*` and `interview:answer:*` events into store-safe actions
- [x] 3.2 Add reduction logic for `stt:partial` as open-utterance preview updates without timeline commit
- [x] 3.3 Add reduction logic for `stt:final` as stable-fragment updates without turn closure
- [x] 3.4 Add reduction logic for `stt:utterance_closed` as the authoritative committed transcript event that clears the matching open utterance
- [x] 3.5 Add streamed AI answer aggregation keyed by `utterance_id`, including duplicate final-event handling for `interview:answer:completed` and `interview:answer`

## 4. Socket adapter and session orchestration

- [x] 4.1 Implement the interview socket adapter that wraps the shared Socket.IO client for `stt:start`, `stt:audio`, `stt:finalize`, and `stt:stop`
- [x] 4.2 Add inbound event filtering by active `conversation_id` and `stream_id` before reducer dispatch
- [x] 4.3 Implement the interview session controller that coordinates identifier generation, media preparation, session start, active streaming, stop, reset, and teardown
- [x] 4.4 Enforce the startup order so `stt:audio` emission begins only after the backend confirms the session with `stt:started`
- [x] 4.5 Add deterministic session teardown logic shared by user stop, dependency-loss failure, and page unmount flows

## 5. Browser media capture and audio transformation

- [x] 5.1 Implement microphone capture management for the `user` lane with permission and track validation
- [x] 5.2 Implement Chromium tab capture management for the `interviewer` lane with audio-track validation for the selected Google Meet tab
- [x] 5.3 Add track-ended and source-failure listeners that escalate active-session dependency loss into hard-stop teardown
- [x] 5.4 Implement the `AudioContext` and `AudioWorklet` transform pipeline that normalizes each source into a mono lane
- [x] 5.5 Implement resampling, `PCM16` encoding, and `2-channel` interleaving so emitted binary frames match the backend contract
- [x] 5.6 Add fixed-duration frame chunk emission with monotonically increasing `sequence` values and correct metadata for each `stt:audio` event

## 6. Page integration and runtime host hooks

- [x] 6.1 Implement the interview lab page component as a thin runtime host that reads normalized state from the interview store
- [x] 6.2 Implement the controller hook that exposes page-level commands for start, stop, reset, and current session status
- [x] 6.3 Implement the socket subscription hook(s) that register and clean up interview-specific event listeners without leaking handlers across rerenders
- [x] 6.4 Prevent the page from starting a second active interview session while one session is already active
- [x] 6.5 Ensure page unmount invokes runtime teardown so tracks, worklets, audio context resources, socket listeners, and transient session state do not leak

## 7. Failure handling and recovery rules

- [ ] 7.1 Surface startup failures for missing socket connection, missing tab audio, and microphone permission or track errors through the interview session store
- [ ] 7.2 Implement hard-stop behavior for active-session loss of socket transport, interviewer tab audio, or user microphone input
- [ ] 7.3 Distinguish user-initiated stop from runtime failure in session terminal state so the page can reset correctly
- [ ] 7.4 Reject stale or delayed events after stop or fast restart so prior session data cannot mutate a newly started session

## 8. Verification and refinement

- [ ] 8.1 Verify the interview lab route and app-shell entry point load only within the authenticated application
- [ ] 8.2 Verify session startup ordering from media preparation through `stt:start`, `stt:started`, and first `stt:audio` emission
- [ ] 8.3 Verify binary audio frames match the backend contract for `PCM16`, `16kHz`, `2-channel`, and fixed `channel_map`
- [ ] 8.4 Verify transcript semantics so `stt:partial` and `stt:final` do not commit timeline entries and only `stt:utterance_closed` does
- [ ] 8.5 Verify AI answer aggregation, including token streaming and duplicate final-event deduplication
- [ ] 8.6 Verify hard-stop behavior for socket disconnect, tab-share end, and microphone loss during an active session
- [ ] 8.7 Run lint and typecheck for the touched frontend files and resolve any issues introduced by the change
