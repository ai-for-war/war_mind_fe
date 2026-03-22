## ADDED Requirements

### Requirement: Dedicated meeting recorder page entry point
The system SHALL provide a dedicated authenticated meeting recorder page that binds the meeting recorder runtime to a single browser-tab page instance. The page SHALL initialize one meeting session controller for that page instance and SHALL not allow more than one active meeting recorder session at a time within the same page instance.

#### Scenario: Open meeting recorder page
- **WHEN** an authenticated user navigates to the meeting recorder page
- **THEN** the page initializes the meeting session controller and exposes the current runtime state for that page instance

#### Scenario: Start blocked while already active
- **WHEN** the user attempts to start a new meeting recorder session while the page already has an active session
- **THEN** the page rejects the second start attempt and preserves the existing active session

### Requirement: Page-level lifecycle controls and language selection
The meeting recorder page SHALL provide page-level commands for preparing and starting a session, gracefully stopping an active session, and resetting client state after a completed, interrupted, or failed session. The page SHALL expose a transcription language selector populated by the same supported language list used by the interview lab feature and SHALL start each session using the currently selected language.

The page SHALL not require a meeting title before startup.

#### Scenario: Start with selected language
- **WHEN** the user selects a transcription language on the meeting recorder page and starts a new session
- **THEN** the page starts the meeting recorder runtime with that selected language

#### Scenario: Stop uses graceful finalize path
- **WHEN** the user issues a stop command from the meeting recorder page while a session is active
- **THEN** the page invokes the runtime's graceful finalize path for the active session

#### Scenario: Reset after terminal session
- **WHEN** a prior meeting session is completed, interrupted, or failed and the user resets the page state
- **THEN** the page clears transient meeting recorder state and allows a fresh session start

### Requirement: Page state reflects normalized transcript and notes
The meeting recorder page SHALL render its meeting data from the normalized meeting runtime store rather than reconstructing state from raw socket events inside the page component. The page SHALL render:
- session lifecycle status
- source readiness status
- realtime draft transcript state
- committed closed utterances in canonical sequence order
- additive AI note chunks with their `from_sequence` and `to_sequence` ranges
- an aggregate note view derived from the received note chunks
- session-level terminal error state

#### Scenario: Runtime updates committed transcript
- **WHEN** the meeting runtime store receives `meeting:utterance_closed` events for the active session
- **THEN** the meeting recorder page renders those committed transcript entries in canonical sequence order

#### Scenario: Runtime updates note chunks
- **WHEN** the meeting runtime store receives `meeting:note:created` events for the active meeting
- **THEN** the meeting recorder page renders additive note chunk cards that show the authoritative `from_sequence` and `to_sequence` range for each chunk

#### Scenario: Completed meeting waits for late note updates
- **WHEN** the runtime transitions the session to `completed` or `interrupted`
- **THEN** the page preserves the transcript and notes already shown and indicates that final AI note chunks may still arrive

### Requirement: Page unmount tears down resources without confirmation
The meeting recorder page SHALL dispose of active meeting recorder resources when the page instance unmounts. If the page unmounts during an active or finalizing session, it SHALL invoke the runtime teardown path without requiring an additional confirmation prompt. A later page mount SHALL start from fresh client state rather than attempting to restore the prior live meeting session.

#### Scenario: Navigate away during active session
- **WHEN** the user leaves the meeting recorder page while a meeting session is active or finalizing
- **THEN** the page tears down the active meeting recorder runtime resources without showing an exit confirmation prompt

#### Scenario: Remount after prior teardown
- **WHEN** the user returns to the meeting recorder page after a prior page instance was unmounted
- **THEN** the new page instance initializes with a fresh controller lifecycle and does not restore the previous live meeting session
