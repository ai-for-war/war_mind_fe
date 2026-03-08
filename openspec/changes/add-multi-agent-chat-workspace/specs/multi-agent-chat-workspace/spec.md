## ADDED Requirements

### Requirement: Dedicated multi-agent workspace route

The system SHALL provide a dedicated multi-agent workspace at route `/multi-agent` for authenticated users. The workspace SHALL present a chat-first layout composed of:
- a conversation rail for browsing and selecting conversations
- a main chat workspace for message history and prompt composition
- an execution insights region for realtime orchestration feedback

On large screens, the workspace SHALL render as a three-pane layout. On narrower screens, secondary panes SHALL collapse into responsive drawers, sheets, or equivalent secondary surfaces while preserving the chat workspace as the primary visible region.

#### Scenario: Desktop layout
- **WHEN** an authenticated user opens `/multi-agent` on a desktop viewport
- **THEN** the page renders the conversation rail, chat workspace, and execution insights region at the same time

#### Scenario: Mobile layout
- **WHEN** an authenticated user opens `/multi-agent` on a mobile viewport
- **THEN** the chat workspace remains the primary visible region and the secondary panes are accessible through responsive collapsed surfaces

### Requirement: Conversation rail supports discovery and navigation

The system SHALL provide a conversation rail backed by `GET /chat/conversations`. The rail SHALL:
- request the authenticated user's conversations using the existing backend list contract
- support loading, empty, and error states
- allow selecting a conversation as the active workspace context
- preserve a visible selected state for the active conversation
- support user-facing search and status filtering using available backend query parameters

Each conversation item SHALL display enough context for navigation, including:
- title
- recency indicator
- current selection state
- lightweight status or activity affordance when locally known

#### Scenario: Conversation list loads successfully
- **WHEN** the conversation list query succeeds
- **THEN** the rail displays the returned conversations and allows the user to select one

#### Scenario: No conversations exist
- **WHEN** the conversation list query succeeds with zero items
- **THEN** the rail displays an empty state with a clear call to start a new conversation

#### Scenario: Conversation list request fails
- **WHEN** the conversation list query fails
- **THEN** the rail displays an error state with a retry affordance

#### Scenario: User selects a conversation
- **WHEN** the user selects a conversation from the rail
- **THEN** that conversation becomes the active workspace context and the chat workspace loads its message history

### Requirement: Active conversation thread displays message history

The system SHALL provide a main thread for the active conversation backed by `GET /chat/conversations/{conversation_id}/messages`. The thread SHALL:
- load message history for the selected conversation
- render user and assistant messages in chronological order
- support loading, empty, and error states for message history
- preserve a stable message layout while additional realtime updates are appended

The thread SHALL provide an empty conversation experience when the active conversation has no messages, including guidance or suggested next actions for the user.

#### Scenario: Message history loads successfully
- **WHEN** the user selects a conversation whose message history request succeeds
- **THEN** the thread displays that conversation's messages in chronological order

#### Scenario: Active conversation has no messages
- **WHEN** the selected conversation returns an empty message list
- **THEN** the thread displays an empty-state experience instead of blank space

#### Scenario: Message history request fails
- **WHEN** the selected conversation message query fails
- **THEN** the thread displays an error state with a retry affordance

### Requirement: Prompt composer submits chat messages

The system SHALL provide a prompt composer in the main chat workspace. The composer SHALL:
- use a multiline text input for chat prompts
- prevent submission of empty or whitespace-only prompts
- submit messages through `POST /chat/messages`
- support keyboard submission while preserving multiline entry
- clear the submitted prompt after a successful submission
- remain visually available as the primary action area of the workspace

The system SHALL create an optimistic local user message after successful submission initiation so the thread reflects the user's action immediately.

#### Scenario: Valid prompt submission
- **WHEN** the user enters a non-empty prompt and submits it
- **THEN** the frontend sends the prompt through `POST /chat/messages` and appends an optimistic local user message to the active thread

#### Scenario: Empty prompt submission
- **WHEN** the user attempts to submit an empty or whitespace-only prompt
- **THEN** the frontend does not send a request and keeps the composer in a validation-safe state

#### Scenario: Multiline prompt entry
- **WHEN** the user adds a newline inside the composer
- **THEN** the composer preserves multiline text entry without triggering an unintended submission

### Requirement: Assistant responses stream into the active thread

The system SHALL integrate the active thread with the existing chat socket events so assistant responses appear as a streamed conversation. The frontend SHALL:
- create a temporary assistant response placeholder when a run starts
- append streamed token content as `chat:message:token` events arrive
- finalize or reconcile the temporary assistant response when `chat:message:completed` arrives
- display an inline failure state for the active assistant response when `chat:message:failed` arrives

The streaming experience SHALL keep the active thread readable and avoid shifting the user's already-rendered messages unnecessarily.

#### Scenario: Stream starts
- **WHEN** the active conversation receives `chat:message:started`
- **THEN** the thread displays a temporary assistant response placeholder for that run

#### Scenario: Stream tokens arrive
- **WHEN** the active conversation receives one or more `chat:message:token` events
- **THEN** the temporary assistant response updates incrementally with the streamed token content

#### Scenario: Stream completes
- **WHEN** the active conversation receives `chat:message:completed`
- **THEN** the temporary assistant response is reconciled into a completed assistant message state

#### Scenario: Stream fails
- **WHEN** the active conversation receives `chat:message:failed`
- **THEN** the temporary assistant response displays a failed state instead of silently disappearing

### Requirement: Workspace state feedback remains user-visible

The workspace SHALL surface user-visible state feedback for common operational conditions, including:
- empty conversation state
- loading state
- request failure state
- socket offline or reconnecting state
- currently active streaming state

These states SHALL be presented in a way that preserves the user's current context and avoids forcing a full page refresh to understand what is happening.

#### Scenario: Socket is disconnected
- **WHEN** the shared socket transport is disconnected or reconnecting
- **THEN** the workspace displays a visible connection-state indicator without removing the existing conversation context

#### Scenario: Active run is in progress
- **WHEN** the user has an in-progress assistant response in the active conversation
- **THEN** the workspace displays a visible in-progress state in the chat workspace until the run completes or fails
