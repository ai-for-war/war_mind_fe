## Why

The frontend already has authenticated Socket.IO transport and a realtime interview lab, but it does not provide a production meeting recorder flow that can capture browser meeting audio plus local microphone input, stream mono meeting audio to the backend, and render incremental transcript and AI meeting notes in real time. This change is needed now to unlock the frontend for the backend meeting runtime that already exists and to give users a dedicated production entry point for recording live web meetings.

## What Changes

- Add a production meeting recorder frontend flow that starts an authenticated live meeting session over Socket.IO.
- Add browser-side media orchestration for meeting tab audio and local microphone input, mixed into `PCM16`, `16kHz`, `1-channel` audio frames for the backend meeting contract.
- Add meeting session state management for lifecycle, language selection, terminal errors, live transcript drafts, canonical closed utterances, and additive AI note chunks.
- Add frontend event reduction logic that treats `meeting:utterance_closed` as the authoritative transcript timeline and `meeting:note:created` as additive note updates that may continue after terminal meeting events.
- Add a dedicated meeting recorder page in the authenticated app shell with live transcript and AI notes panels.
- Add route and navigation entry-point updates required to expose the new production page.

## Capabilities

### New Capabilities
- `meeting-recorder-runtime`: Run a Chromium-based browser meeting recorder session that captures shared meeting tab audio plus microphone input, streams mono audio to the backend meeting runtime, and manages realtime transcript and AI note state.
- `meeting-recorder-page`: Provide a dedicated frontend page for starting, monitoring, and stopping the live meeting recorder flow with transcript and note visualization.

### Modified Capabilities
- `sidebar-navigation`: Expose the meeting recorder page in the authenticated application navigation.

## Impact

- Affected code: new `src/features/meeting-recorder/*` runtime, state, and page files, plus routing and navigation integration in the main application shell.
- APIs and systems: authenticated Socket.IO meeting events, browser media capture APIs, Web Audio mixing and PCM encoding, and the backend contract documented in `docs/meeting/frontend_integration_guide.md`.
- Constraints: phase-one support is limited to Chromium-based desktop browsers, requires access to both browser tab audio and microphone input, does not support session resume/history replay, and treats `meeting:error` as a terminal frontend state.
