## Why

The backend now exposes authenticated live speech-to-text streaming over the shared Socket.IO channel, but `war_mind_fe` has no dedicated surface to exercise that contract end to end. A focused internal `STT Lab` page is needed now so the team can validate stream lifecycle, transcript behavior, and failure states in the real frontend shell before integrating speech input into broader product flows.

## What Changes

- Add a new internal `STT Lab` route and sidebar entry in the authenticated frontend shell
- Add a dedicated live speech-to-text testing workspace with three coordinated regions: session controls, transcript stage, and event/debug timeline
- Add realtime stream controls that align with the backend contract: `stt:start`, `stt:audio`, `stt:finalize`, and `stt:stop`
- Add transcript rendering that separates `partial` live text from committed `final` transcript segments and assembles committed output into a plain textarea
- Add internal testing diagnostics for socket readiness, microphone readiness, stream state, stream identifiers, and normalized `stt:error` handling
- Prefer reusable shadcn/ui building blocks for the page structure and state presentation instead of bespoke UI primitives

## Capabilities

### New Capabilities
- `live-speech-to-text-ui`: Dedicated frontend experience for starting a live speech stream, receiving partial and final transcripts over Socket.IO, inspecting stream state, and validating internal STT behavior in a standalone lab page

### Modified Capabilities
- `sidebar-navigation`: Add an `STT Lab` navigation item that routes authenticated users to the new standalone live speech-to-text testing page

## Impact

- **Affected frontend areas**: `src/app/router.tsx`, sidebar navigation widgets, and a new `src/features/live-speech-to-text/` feature slice for page UI, audio capture integration, socket subscriptions, state, and types
- **Primary UI surfaces**: an internal lab workspace with session controls on the left, transcript visualization in the center, and a debug/event timeline on the right
- **Data and transport integration**: the new UI will consume the existing shared authenticated Socket.IO client and the backend STT event contract without introducing a second realtime transport
- **Behavior constraints from backend**: phase 1 must stay within the current contract, including browser-only microphone streaming, `PCM16 mono 16kHz`, one active stream per socket, `partial` versus `final` transcript semantics, explicit `finalize` versus `stop`, and no transcript persistence
- **UI component strategy**: implementation should prioritize existing shadcn/ui primitives already present in the app and add missing shadcn components only where they materially improve the internal lab experience
- **Product scope**: this change creates an internal validation tool rather than an end-user dictation workflow or automatic prompt submission experience
