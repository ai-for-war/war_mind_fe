## ADDED Requirements

### Requirement: Center chat workspace is rendered on the Multi-Agent page

The system SHALL render a dedicated center chat workspace on the `Multi-Agent` page beside the conversation rail. The workspace SHALL act as the primary interaction surface for reading the active conversation and composing the next prompt.

The center chat workspace SHALL include:
- a main thread region
- a composer region
- a visible state for when no conversation is currently active

#### Scenario: Multi-Agent page loads without an active conversation
- **WHEN** an authenticated user opens the `Multi-Agent` page and no conversation is selected
- **THEN** the page displays the center chat workspace in a fresh conversation state
- **AND** the workspace shows a clear prompt for selecting a conversation or starting a new chat

#### Scenario: Multi-Agent page loads with an active conversation
- **WHEN** an authenticated user opens the `Multi-Agent` page and an active conversation context is available
- **THEN** the page displays the center chat workspace for that active conversation
- **AND** the thread and composer regions are visible within the center pane

### Requirement: Center workspace renders the active conversation thread

The system SHALL render the message history for the active conversation in the center workspace. The thread SHALL reflect the currently selected conversation context from the page and SHALL distinguish user messages from assistant messages.

The rendered thread SHALL support at least:
- loading state while message history is being retrieved
- empty conversation state when a selected conversation has no messages
- ready state when message history is available

#### Scenario: Active conversation history is loading
- **WHEN** the user selects a conversation and the message history request is still in progress
- **THEN** the center workspace shows a loading state in the thread region
- **AND** the thread does not misleadingly show stale messages from a different conversation as current content

#### Scenario: Active conversation has messages
- **WHEN** the message history request succeeds with one or more messages
- **THEN** the center workspace renders those messages in chronological conversation order
- **AND** the thread visually distinguishes user and assistant messages

#### Scenario: Active conversation has no messages
- **WHEN** the message history request succeeds and the selected conversation contains no messages
- **THEN** the center workspace shows an empty conversation state in the thread region
- **AND** the composer remains available so the user can send the first prompt

### Requirement: Center workspace supports fresh-chat and selected-conversation state handoff

The system SHALL keep the center workspace synchronized with the page's active conversation state. Conversation selection from the rail and activation of `New chat` SHALL immediately update what the center workspace presents.

The state handoff SHALL ensure:
- selecting a conversation switches the thread to that conversation's content
- starting a new chat resets the center workspace to a fresh conversation state
- the center workspace does not continue to present a previously selected conversation as active after `New chat`

#### Scenario: User selects a conversation from the rail
- **WHEN** the user selects a conversation in the conversation rail
- **THEN** the center workspace updates to that conversation as the active thread context
- **AND** the composer is scoped to sending the next prompt in that conversation

#### Scenario: User starts a new chat from the rail
- **WHEN** the user activates `New chat` from the conversation rail
- **THEN** the center workspace resets to a fresh conversation state
- **AND** no previously selected conversation is shown as the active thread

### Requirement: Center workspace provides a composer for prompt submission

The system SHALL provide a composer in the center workspace for entering and submitting prompts. The composer SHALL remain available in both fresh-chat and existing-conversation states unless the page is in a non-interactive failure condition.

The composer SHALL:
- allow multiline prompt entry
- prevent submission of an empty prompt
- support submission into either a fresh chat state or the active conversation
- communicate submission progress while a prompt is being sent

#### Scenario: User submits a prompt from a fresh chat state
- **WHEN** the user enters a valid prompt and submits from the fresh conversation state
- **THEN** the system starts a new chat run without leaving the `Multi-Agent` page
- **AND** the center workspace transitions out of the empty fresh-chat state

#### Scenario: User submits a prompt in an existing conversation
- **WHEN** the user enters a valid prompt and submits while an active conversation is selected
- **THEN** the prompt is sent in the context of the active conversation
- **AND** the center workspace reflects that the conversation is processing a new response

#### Scenario: User attempts to submit an empty prompt
- **WHEN** the composer input is empty or whitespace-only and the user attempts to submit
- **THEN** the system does not submit the prompt
- **AND** the composer remains available for valid input

### Requirement: Center workspace communicates streaming and failure states for assistant responses

The system SHALL communicate in-progress assistant response handling inside the center workspace after a prompt is submitted. The workspace SHALL support visible response lifecycle states so the user can understand whether the system is processing, streaming, completed, or failed.

The response lifecycle SHALL support at least:
- request submitted / processing state
- streaming assistant response state
- completed assistant response state
- failed response state with a clear error indication

#### Scenario: Assistant response begins processing
- **WHEN** the user successfully submits a prompt and the assistant response has started but is not yet complete
- **THEN** the center workspace shows that the conversation is processing a response
- **AND** the thread remains visually stable while the response is in progress

#### Scenario: Assistant response streams into the thread
- **WHEN** assistant response content arrives progressively for the active conversation
- **THEN** the center workspace updates the visible assistant response within the thread as content arrives
- **AND** the streaming response appears associated with the active conversation rather than a different conversation

#### Scenario: Assistant response fails
- **WHEN** the assistant response fails for the active conversation
- **THEN** the center workspace shows a failed response state in or near the thread region
- **AND** the user can understand that the latest run did not complete successfully

### Requirement: Center workspace remains primary on smaller viewports

The system SHALL preserve the center workspace as the primary content area on smaller viewports while the conversation rail becomes secondary. The thread and composer SHALL remain usable when the rail is collapsed into a sheet or drawer.

Responsive behavior SHALL ensure:
- the active thread remains visible after the rail is dismissed
- the composer remains reachable without requiring the rail to stay open
- the center workspace continues to support fresh-chat and active-conversation states on smaller screens

#### Scenario: Tablet viewport with collapsed rail
- **WHEN** the `Multi-Agent` page is displayed on a tablet-sized viewport and the rail is collapsed
- **THEN** the center workspace remains usable as the primary page region
- **AND** the user can continue reading the active thread and using the composer

#### Scenario: Mobile viewport after conversation selection
- **WHEN** the user selects a conversation on a mobile viewport and the rail is dismissed
- **THEN** the center workspace shows the selected conversation as the primary visible content
- **AND** the user can continue the conversation without reopening the rail

### Requirement: Multi-Agent assistant messages expose a metadata inspector action
The system SHALL expose a visible metadata-inspector action on `Multi-Agent` assistant messages when the selected assistant response contains displayable metadata for at least one of these concerns:
- `model`
- `skill`
- `tools`

The system SHALL NOT expose this metadata-inspector action on user messages. The metadata-inspector action SHALL target the selected assistant response rather than the entire conversation.

#### Scenario: Assistant response with metadata shows an inspector action
- **WHEN** the `Multi-Agent` thread renders an assistant message whose metadata contains a model, skill information, or one or more tool calls
- **THEN** that assistant message shows a metadata-inspector action in its message actions
- **AND** the same conversation thread does not show that action on user messages

#### Scenario: Assistant response without displayable metadata does not show an inspector action
- **WHEN** the `Multi-Agent` thread renders an assistant message whose metadata does not contain a model, skill information, or tool calls
- **THEN** the thread does not show a metadata-inspector action for that assistant message

### Requirement: Multi-Agent workspace presents a right-side metadata inspector for the selected assistant message
The system SHALL present assistant-message metadata in a dedicated secondary inspector surface when the user activates the metadata-inspector action from a `Multi-Agent` assistant message. On larger viewports, the inspector SHALL appear as a right-side panel within the workspace. On smaller viewports, the system SHALL present the same metadata content in a right-side sheet.

The inspector SHALL show only these metadata sections for the selected assistant response:
- `Model`
- `Skill`
- `Tools`

The system SHALL hide any empty section instead of rendering placeholder debugging fields. The inspector SHALL NOT display the message timestamp, raw JSON argument payloads, or low-level backend metadata fields outside those sections.

Tool-call presentation inside the inspector SHALL use the same compact execution-style visual language as the existing conversation activity UI, including:
- user-facing tool labels
- compact argument summaries
- execution-style step rows rather than raw payload dumps

#### Scenario: User opens metadata inspector for an assistant response
- **WHEN** the user activates the metadata-inspector action on a `Multi-Agent` assistant message that contains displayable metadata
- **THEN** the workspace opens a right-side metadata inspector for that selected assistant response
- **AND** the inspector shows only the available `Model`, `Skill`, and `Tools` sections for that message

#### Scenario: Tool calls are shown as compact activity-style steps
- **WHEN** the selected `Multi-Agent` assistant response contains one or more historical tool calls in its metadata
- **THEN** the metadata inspector renders those tool calls as compact execution-style step rows with mapped labels and summarized arguments
- **AND** the inspector does not show raw JSON argument dumps for those tool calls

#### Scenario: Conversation change clears the selected metadata target
- **WHEN** the active `Multi-Agent` conversation changes after a metadata inspector has been opened
- **THEN** the workspace clears the previously selected assistant-message metadata target
- **AND** the inspector does not continue showing metadata from the previously active conversation as if it belonged to the new one
