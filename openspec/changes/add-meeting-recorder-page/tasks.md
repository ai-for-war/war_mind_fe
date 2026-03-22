## 1. Feature scaffolding and app entry points

- [x] 1.1 Create the `src/features/meeting-recorder/` feature slice with `components`, `hooks`, `stores`, `services`, `reducers`, `types`, `constants`, and `utils`
- [x] 1.2 Add feature barrel exports needed for the meeting recorder page to integrate cleanly with the existing app structure
- [x] 1.3 Add the authenticated route and page entry component for the meeting recorder feature
- [x] 1.4 Update sidebar navigation so the meeting recorder page is reachable from the authenticated app shell

## 2. Runtime types, constants, and store

- [x] 2.1 Add meeting session, transcript, note chunk, socket payload, and audio pipeline TypeScript types under `src/features/meeting-recorder/types/`
- [x] 2.2 Add feature constants for session statuses, source readiness, supported languages, and audio metadata defaults under `src/features/meeting-recorder/constants/`
- [x] 2.3 Reuse the interview language option list through a meeting-recorder-facing constant or selector without duplicating the supported language catalog
- [x] 2.4 Implement the Zustand meeting session store for lifecycle status, active identifiers, source readiness, draft utterances, committed utterances, note chunks, derived note state, and terminal errors
- [x] 2.5 Add utility helpers for generating `stream_id`, guarding inbound events by `organization_id` and active session identifiers, and maintaining ordered transcript and note timelines

## 3. Meeting event reduction logic

- [x] 3.1 Implement the meeting event reducer that normalizes `meeting:started`, `meeting:final`, `meeting:utterance_closed`, `meeting:note:created`, `meeting:completed`, `meeting:interrupted`, and `meeting:error` into store-safe actions
- [x] 3.2 Add reduction logic for `meeting:started` that binds the accepted `stream_id` to the authoritative `meeting_id` and accepted audio config
- [x] 3.3 Add reduction logic for `meeting:final` as realtime draft transcript updates keyed by `utterance_id` without committing canonical transcript entries
- [x] 3.4 Add reduction logic for `meeting:utterance_closed` as the authoritative transcript commit keyed by `sequence`
- [x] 3.5 Add reduction logic for `meeting:note:created` as additive ordered note chunk appends and aggregate note derivation
- [x] 3.6 Add terminal lifecycle reduction logic so `meeting:completed` and `meeting:interrupted` preserve session state for late note chunks while `meeting:error` transitions the session to failed

## 4. Socket adapter and session orchestration

- [x] 4.1 Implement the meeting socket adapter that wraps the shared Socket.IO client for `meeting:start`, `meeting:audio`, `meeting:finalize`, and `meeting:stop`
- [x] 4.2 Add inbound event filtering by active `organization_id`, `stream_id`, and `meeting_id` before reducer dispatch
- [x] 4.3 Implement the meeting session controller that coordinates organization prerequisites, media preparation, session start, active streaming, finalize, forced stop, reset, and teardown
- [x] 4.4 Enforce startup ordering so `meeting:audio` emission begins only after the backend confirms the session with `meeting:started`
- [x] 4.5 Split controller teardown so capture/upload resources stop on terminal meeting lifecycle events while late note subscriptions remain active for the same `meeting_id` until reset or full dispose
- [x] 4.6 Ensure user-initiated stop uses `meeting:finalize` and forced teardown paths use `meeting:stop` when the transport is still available

## 5. Browser media capture and mono audio transformation

- [ ] 5.1 Implement microphone capture management for the local audio source with permission, track, and active-state validation
- [ ] 5.2 Implement Chromium tab capture management for the shared meeting tab audio source with audio-track validation
- [ ] 5.3 Add track-ended and source-failure listeners that escalate active-session dependency loss into forced teardown
- [ ] 5.4 Implement the `AudioContext` and `AudioWorklet` transform pipeline that normalizes each input source to mono before mix
- [ ] 5.5 Implement source mixing, resampling to `16kHz`, and `PCM16` encoding so emitted binary frames match the backend meeting contract
- [ ] 5.6 Add fixed-duration frame chunk emission with monotonically increasing `sequence` values and correct metadata for each `meeting:audio` event

## 6. Page integration and runtime host hooks

- [ ] 6.1 Implement the meeting recorder page component as a thin runtime host that reads normalized state from the meeting store
- [ ] 6.2 Implement the controller hook that exposes page-level commands for start, stop, reset, language selection, and current session status
- [ ] 6.3 Implement runtime subscription hooks that register and clean up meeting-specific socket listeners without leaking handlers across rerenders
- [ ] 6.4 Render source readiness, selected language, lifecycle status, and terminal error state from the normalized runtime store
- [ ] 6.5 Render realtime draft transcript state and canonical committed transcript entries in sequence order
- [ ] 6.6 Render additive note chunk cards that show authoritative `from_sequence` and `to_sequence` ranges plus an aggregate notes view derived from received chunks
- [ ] 6.7 Show a soft “waiting for final AI notes” state after `meeting:completed` or `meeting:interrupted` while continuing to append later note chunks
- [ ] 6.8 Ensure page unmount disposes the active meeting runtime without showing an exit confirmation prompt

## 7. Failure handling and session safety rules

- [ ] 7.1 Surface startup failures for missing socket connection, missing organization context, missing tab audio, and microphone permission or track errors through the meeting session store
- [ ] 7.2 Implement forced teardown behavior for active-session loss of socket transport, shared tab audio, or microphone input
- [ ] 7.3 Reject stale or delayed transcript lifecycle events after stop or fast restart so prior session data cannot mutate a newly started session
- [ ] 7.4 Reject unrelated user-room events from other meeting sessions in the same organization by enforcing active `stream_id` and `meeting_id` guards
- [ ] 7.5 Preserve completed or interrupted session transcript and note state while still accepting late `meeting:note:created` events for the same `meeting_id`

## 8. Verification and refinement

- [ ] 8.1 Verify the meeting recorder route and sidebar entry load only within the authenticated application shell
- [ ] 8.2 Verify session startup ordering from media preparation through `meeting:start`, `meeting:started`, and first `meeting:audio` emission
- [ ] 8.3 Verify emitted binary audio frames match the backend contract for `PCM16`, `16kHz`, `1-channel`, and expected metadata fields
- [ ] 8.4 Verify transcript semantics so `meeting:final` updates draft state only and only `meeting:utterance_closed` commits canonical transcript entries
- [ ] 8.5 Verify note semantics so `meeting:note:created` appends ordered chunks, shows range badges, and updates aggregate notes without replacing previous chunks
- [ ] 8.6 Verify terminal lifecycle handling for graceful finalize, forced teardown, `meeting:error`, and late note chunk arrival after `meeting:completed` or `meeting:interrupted`
- [ ] 8.7 Run lint and typecheck for the touched frontend files and resolve any issues introduced by the change
