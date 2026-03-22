## Why

The frontend currently has shared Socket.IO infrastructure but does not have an interview runtime that can capture dual audio sources, stream speaker-mapped audio to the backend, and reduce realtime STT and AI answer events into stable client state. This change is needed now to unlock the first usable frontend for the realtime interview assistant flow already defined by the backend integration contract.

## What Changes

- Add a new interview lab frontend flow that starts an authenticated realtime interview session over Socket.IO.
- Add browser-side media orchestration for two input sources: Google Meet tab audio for `interviewer` and microphone audio for `user`.
- Add browser-side audio transformation that produces `PCM16`, `16kHz`, `2-channel` interleaved audio frames mapped to the backend `channel_map` contract.
- Add interview session state management for lifecycle, source readiness, transcript preview, stable closed utterances, and streamed AI answers.
- Add frontend event reduction logic that treats `stt:utterance_closed` as the authoritative turn boundary and deduplicates final AI answer events.
- Add hard-stop handling when socket connectivity or either required audio source is lost during an active session.

## Capabilities

### New Capabilities
- `interview-lab-runtime`: Run a Chromium-only browser interview session that captures interviewer and user audio separately, streams speaker-mapped audio to the backend, and manages realtime transcript and AI answer state.
- `interview-lab-page`: Provide a dedicated frontend entry point for starting, running, and observing the interview lab session lifecycle.

### Modified Capabilities
- None.

## Impact

- Affected code: new `src/features/interview-lab/*` runtime, state, and page integration files.
- APIs and systems: authenticated Socket.IO interview events, browser media capture APIs, Web Audio processing, and the backend interview assistant event contract in `docs/interview/frontend_integration_guide.md`.
- Constraints: phase-one support is limited to Chromium-based browsers and requires access to both microphone input and Google Meet tab audio.
