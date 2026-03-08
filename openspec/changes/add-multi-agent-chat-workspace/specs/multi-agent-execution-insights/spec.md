## ADDED Requirements

### Requirement: Execution insights region is visible alongside chat

The system SHALL provide an execution insights region within the multi-agent workspace. The region SHALL surface realtime orchestration context for the active conversation without replacing the main chat thread as the primary interaction surface.

The execution insights region SHALL include:
- a run summary view
- a live activity view
- a system insight view

On smaller screens, the execution insights region SHALL remain accessible through a responsive collapsed surface instead of being removed.

#### Scenario: Desktop workspace
- **WHEN** the user views the workspace on a desktop viewport
- **THEN** the execution insights region is visible alongside the main chat thread

#### Scenario: Mobile workspace
- **WHEN** the user views the workspace on a mobile viewport
- **THEN** the execution insights region remains accessible through a responsive secondary surface

### Requirement: Run summary derives a stable user-facing run state

The system SHALL provide a run summary for the active conversation. The run summary SHALL derive a stable user-facing run state from the existing chat socket events and SHALL support at least:
- `idle`
- `initiating`
- `tool-using`
- `synthesizing`
- `completed`
- `failed`

The run summary SHALL display the current run state and SHALL support elapsed-time or equivalent progress context while a run is active.

#### Scenario: Run starts
- **WHEN** the active conversation receives `chat:message:started`
- **THEN** the run summary enters a non-idle in-progress state

#### Scenario: Tool activity occurs
- **WHEN** the active conversation receives `chat:message:tool_start`
- **THEN** the run summary reflects a tool-using state for that run

#### Scenario: Final answer is streaming
- **WHEN** the active conversation receives streamed tokens without an active failure state
- **THEN** the run summary reflects an in-progress synthesis state

#### Scenario: Run completes
- **WHEN** the active conversation receives `chat:message:completed`
- **THEN** the run summary displays a completed state for that run

#### Scenario: Run fails
- **WHEN** the active conversation receives `chat:message:failed`
- **THEN** the run summary displays a failed state for that run

### Requirement: Live activity timeline reflects tool and run events

The system SHALL provide a live activity timeline for the active conversation. The timeline SHALL consume the existing chat socket event stream and record user-visible activity items for relevant orchestration events, including:
- run started
- tool started
- tool completed
- run completed
- run failed

Each activity item SHALL include:
- a human-readable label
- a temporal ordering in the timeline
- a status that distinguishes in-progress, completed, or failed activity where applicable

#### Scenario: Tool starts
- **WHEN** the active conversation receives `chat:message:tool_start`
- **THEN** the timeline adds an activity item indicating the tool has started

#### Scenario: Tool completes
- **WHEN** the active conversation receives `chat:message:tool_end`
- **THEN** the timeline updates or appends an activity item indicating the tool has completed

#### Scenario: Run completes
- **WHEN** the active conversation receives `chat:message:completed`
- **THEN** the timeline records a completion activity item for that run

#### Scenario: Run fails
- **WHEN** the active conversation receives `chat:message:failed`
- **THEN** the timeline records a failed activity item for that run

### Requirement: System insight summarizes orchestration without exposing internal reasoning

The system SHALL provide a system insight view that summarizes the orchestration of the active conversation using user-facing language. The system insight view SHALL:
- summarize available orchestration signals from the current run
- avoid claiming explicit per-agent structure that is not present in the backend contract
- avoid exposing hidden internal reasoning or raw chain-of-thought
- remain useful even when only partial metadata is available

The system MAY derive summary statements from currently available signals such as:
- presence of tool activity
- completion or failure outcome
- message streaming lifecycle

#### Scenario: Tool-backed response
- **WHEN** the active conversation includes one or more tool events during a run
- **THEN** the system insight view summarizes that tools were used as part of the response

#### Scenario: No rich metadata is available
- **WHEN** the active conversation completes without structured agent or stage metadata
- **THEN** the system insight view still presents a minimal but user-facing summary based on the available events

### Requirement: Connection status is visible in the execution insights experience

The system SHALL expose socket transport health within the execution insights experience so users can distinguish backend inactivity from transport problems. The connection display SHALL support at least:
- connected
- reconnecting
- disconnected
- error

The connection display SHALL remain visible during active conversation use and SHALL not require the user to inspect browser developer tools to understand connection health.

#### Scenario: Healthy realtime connection
- **WHEN** the shared socket transport is connected
- **THEN** the execution insights experience displays a healthy connection state

#### Scenario: Reconnecting transport
- **WHEN** the shared socket transport is reconnecting after an interruption
- **THEN** the execution insights experience displays a reconnecting state rather than appearing idle

#### Scenario: Transport error
- **WHEN** the shared socket transport enters an error state
- **THEN** the execution insights experience displays an error state distinguishable from a completed run

### Requirement: Execution insights degrade gracefully with current backend limitations

The system SHALL support the current backend contract even when the following structured fields are absent:
- stable `request_id`
- pre-created `assistant_message_id`
- explicit public `agent_id`
- explicit public `stage`
- rich completion metadata

In those cases, the execution insights experience SHALL:
- derive run state from available socket events
- avoid rendering unsupported per-agent swimlanes or agent identity claims
- keep the visible output coherent for the active conversation

#### Scenario: No agent identifiers are present
- **WHEN** the active conversation receives socket events without any explicit `agent_id` or `agent_label`
- **THEN** the execution insights experience presents generic orchestration summaries instead of fabricated agent cards

#### Scenario: No request correlation identifier is present
- **WHEN** a run starts without a stable backend-provided request identifier
- **THEN** the execution insights experience continues to function for the active conversation using the available conversation-scoped event context
