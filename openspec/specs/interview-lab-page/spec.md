# interview-lab-page Specification

## Purpose
Define the authenticated interview lab page entry point and its page-level session lifecycle behavior.

## Requirements
### Requirement: Dedicated interview lab entry point
The system SHALL provide a dedicated interview lab page within the authenticated frontend application that binds the interview runtime to a single browser-tab session. The page SHALL initialize the interview controller for the current tab and SHALL not allow more than one active interview runtime session at a time within that page instance.

#### Scenario: Open interview lab page
- **WHEN** an authenticated user navigates to the interview lab page
- **THEN** the page initializes the interview session controller and exposes the current runtime state for that page instance

#### Scenario: Start blocked while already active
- **WHEN** the user attempts to start a new interview session while the page already has an active session
- **THEN** the page rejects the second start attempt and preserves the existing active session

### Requirement: Page-level session lifecycle commands
The interview lab page SHALL provide page-level commands that map to the interview runtime lifecycle. The page SHALL support:
- preparing and starting a new session
- stopping an active session
- resetting client state after a stopped, completed, or failed session
- starting a fresh session after reset with newly generated identifiers

The page SHALL generate a new `conversation_id` and a new `stream_id` for each fresh session start rather than reusing identifiers from a previous run.

#### Scenario: Start after previous session ended
- **WHEN** a prior interview session is stopped, completed, or failed and the user starts again
- **THEN** the page resets transient session state and launches a new session with a new `conversation_id` and a new `stream_id`

#### Scenario: User stops active session
- **WHEN** the user issues a stop command from the interview lab page while a session is active
- **THEN** the page invokes the runtime hard-stop path for the active session and transitions the page state out of the active session

### Requirement: Page state reflects authoritative runtime state
The interview lab page SHALL render its session data from the interview runtime store rather than reconstructing state from raw socket events inside the page component. The page SHALL consume:
- session lifecycle status
- source readiness status
- current open utterance previews by speaker
- committed closed utterances
- AI answer state keyed by `utterance_id`
- session-level error state

#### Scenario: Runtime updates transcript state
- **WHEN** the interview runtime store receives transcript and AI answer updates for the active session
- **THEN** the interview lab page reads and reflects the normalized store state for that same session

#### Scenario: Session failure reported by runtime
- **WHEN** the runtime transitions the session into a failed state
- **THEN** the page reflects the failed session status and the associated session-level error from the runtime store

### Requirement: Page unmount tears down active session resources
The interview lab page SHALL dispose of active interview resources when the page instance unmounts. If the page unmounts during an active session, it SHALL invoke the runtime teardown path so that browser media tracks, audio processing resources, socket subscriptions, and transient session state do not leak into later page mounts.

#### Scenario: Navigate away during active session
- **WHEN** the user leaves the interview lab page while an interview session is active
- **THEN** the page tears down the active interview runtime resources for that page instance

#### Scenario: Remount after teardown
- **WHEN** the user returns to the interview lab page after the prior page instance was unmounted
- **THEN** the new page instance initializes with a fresh controller lifecycle rather than reusing leaked resources from the previous mount
