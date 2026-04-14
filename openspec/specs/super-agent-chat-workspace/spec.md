## Purpose
Define Super-Agent chat workspace behavior for per-message runtime selection and display.
## Requirements
### Requirement: Super-Agent composer exposes per-message runtime controls
The system SHALL expose runtime controls directly inside the `Super-Agent` composer so the user can choose the runtime for the next outbound message without leaving the chat workspace. The composer SHALL provide:
- a visible `Choose model` control
- a `Reasoning` control only when the selected model supports reasoning options
- a prompt input and submit action in the same composition region

The runtime controls SHALL remain available in both fresh-chat and existing-conversation states. The runtime controls SHALL apply to the next submitted message only and SHALL remain editable before every submission.

#### Scenario: Fresh chat shows runtime controls
- **WHEN** an authenticated user opens the `Super-Agent` page in a fresh chat state
- **THEN** the composer shows a visible `Choose model` control beside the prompt composition area
- **AND** the user can configure the next message runtime before sending the first prompt

#### Scenario: Existing conversation still allows runtime switching
- **WHEN** the user is viewing an existing `Super-Agent` conversation
- **THEN** the composer still exposes runtime controls for the next outbound message
- **AND** the user can switch to a different model before sending the next prompt

### Requirement: Super-Agent message submission uses the selected runtime snapshot
The system SHALL submit each outbound `Super-Agent` message with the runtime selection that is active in the composer at the moment of submission. The runtime snapshot SHALL include:
- `provider`
- `model`
- optional `reasoning`

The system SHALL not lock a conversation to the runtime used by earlier turns. Different messages within the same conversation MAY be sent with different valid runtime selections as long as each selection comes from the current catalog.

#### Scenario: Submit message with selected model and reasoning
- **WHEN** the user selects a model that supports reasoning, keeps a valid reasoning value selected, and submits a non-empty prompt
- **THEN** the outbound message request includes the selected `provider`, `model`, and `reasoning`
- **AND** the request uses the runtime values that were active in the composer immediately before submission

#### Scenario: Submit message with a model that has no reasoning options
- **WHEN** the user selects a model whose catalog entry exposes an empty `reasoning_options` list and submits a non-empty prompt
- **THEN** the outbound message request includes the selected `provider` and `model`
- **AND** the request does not send a `reasoning` value

#### Scenario: Switch runtime between two messages in one conversation
- **WHEN** the user sends one message with runtime selection `A`, changes the composer runtime selection, and sends another message in the same conversation
- **THEN** the second outbound message uses runtime selection `B`
- **AND** the system does not overwrite the recorded runtime of the earlier message

### Requirement: Super-Agent thread communicates runtime used for each submitted turn
The system SHALL present the runtime used for submitted turns in the visible chat thread so the user can distinguish responses generated under different runtime selections. Runtime visibility SHALL be associated with the submitted turn and SHALL remain stable when later messages use a different runtime.

#### Scenario: Thread shows runtime for a submitted turn
- **WHEN** a user message is successfully submitted with a valid runtime selection
- **THEN** the chat thread displays the runtime used for that turn near the submitted message or its paired response
- **AND** the runtime display includes enough information for the user to identify the selected model

#### Scenario: Consecutive turns use different runtimes
- **WHEN** two submitted turns in the same conversation use different runtime selections
- **THEN** the thread preserves each turn's own runtime display
- **AND** the UI does not imply that both turns used the same model

### Requirement: Super-Agent assistant turns show inline tool activity during response generation
The system SHALL render an inline activity block inside the visible assistant turn whenever the `Super-Agent` runtime emits tool execution events for that turn. The activity block SHALL appear above the streamed assistant response text and SHALL update in step order as tool events arrive. Each tool invocation SHALL render as its own activity step and SHALL use only one of these states:
- `active`
- `complete`
- `failed`

The system SHALL NOT introduce a `pending` activity state for this trace.

#### Scenario: Streaming assistant turn shows an inline activity block
- **WHEN** an assistant turn has started and the frontend receives at least one `chat:message:tool_start` event for the active conversation
- **THEN** the visible streaming assistant message shows an inline activity block above the assistant response text
- **AND** the activity block includes one `active` step for the started tool invocation

#### Scenario: Multiple tool invocations render as separate steps
- **WHEN** the frontend receives multiple tool lifecycle events for the same assistant turn
- **THEN** the activity block renders one distinct step per `tool_call_id`
- **AND** the UI does not merge separate tool invocations into a grouped summary row

#### Scenario: Assistant tokens continue below the activity block
- **WHEN** the frontend receives assistant token events while the activity block is visible
- **THEN** the streamed assistant text continues rendering below the activity block
- **AND** the activity block remains visible while tool execution feedback is being updated

### Requirement: Super-Agent activity steps present mapped tool labels and compact arguments
The system SHALL present each inline activity step with:
- a status icon that reflects `active`, `complete`, or `failed`
- a user-facing tool label derived from the backend `tool_name`
- a compact argument summary derived from the tool start payload

The tool label mapping SHALL be owned by the frontend presentation layer so backend identifiers can be shown with user-facing wording. Known mappings SHALL render the mapped label instead of the raw `tool_name`, including rendering `fetch_content` as `Crawl`.

#### Scenario: Search step shows mapped label and arguments
- **WHEN** the frontend receives a `chat:message:tool_start` event with `tool_name` equal to `search` and arguments containing `query`, `region`, and `max_results`
- **THEN** the activity step shows the mapped label for `search`
- **AND** the step shows a compact inline summary containing those argument values

#### Scenario: Fetch content step shows Crawl label
- **WHEN** the frontend receives a `chat:message:tool_start` event with `tool_name` equal to `fetch_content`
- **THEN** the activity step shows the label `Crawl`
- **AND** the step shows a compact argument summary for values such as `url` and `max_length`

#### Scenario: Completed tool step updates status without expanding result output
- **WHEN** the frontend receives a `chat:message:tool_end` event for an existing activity step
- **THEN** the matching step changes from `active` to `complete`
- **AND** the activity block keeps showing the mapped label and compact argument summary for that step

### Requirement: Super-Agent activity traces remain visible for the current session after completion
The system SHALL preserve the inline activity block in the assistant turn after the corresponding assistant message finishes, as long as the user remains in the current in-memory frontend session. The system SHALL mark the trace as completed when the assistant turn completes, but it SHALL NOT remove the completed activity block from the visible thread during that session.

The system SHALL NOT rehydrate prior activity traces from persisted conversation history after a full page reload.

#### Scenario: Completed assistant turn keeps its inline activity block
- **WHEN** an assistant turn with visible activity steps receives `chat:message:completed`
- **THEN** the assistant turn remains visible with its completed inline activity block
- **AND** the system does not remove the completed activity steps from that turn during the current session

#### Scenario: Failed tool step remains visible in the completed trace
- **WHEN** an activity step receives a failed status during an assistant turn
- **THEN** that step remains visible in the activity block with the `failed` state
- **AND** the rest of the assistant turn can continue to show the execution trace for that session

#### Scenario: Reloaded page does not show old inline activity traces
- **WHEN** the user reloads the page and the chat thread is rebuilt from persisted conversation history
- **THEN** previously completed inline activity traces are not shown for historical assistant turns
- **AND** the thread continues to render the persisted assistant message content without rehydrating ephemeral activity state

### Requirement: Super-Agent assistant messages expose a metadata inspector action
The system SHALL expose a visible metadata-inspector action on `Super-Agent` assistant messages when the selected assistant response contains displayable metadata for at least one of these concerns:
- `model`
- `skill`
- `tools`

The system SHALL NOT expose this metadata-inspector action on user messages. The metadata-inspector action SHALL target the selected assistant response rather than the entire conversation.

#### Scenario: Assistant response with metadata shows an inspector action
- **WHEN** the `Super-Agent` thread renders an assistant message whose metadata contains a model, skill information, or one or more tool calls
- **THEN** that assistant message shows a metadata-inspector action in its message actions
- **AND** the same conversation thread does not show that action on user messages

#### Scenario: Assistant response without displayable metadata does not show an inspector action
- **WHEN** the `Super-Agent` thread renders an assistant message whose metadata does not contain a model, skill information, or tool calls
- **THEN** the thread does not show a metadata-inspector action for that assistant message

### Requirement: Super-Agent workspace presents a right-side metadata inspector for the selected assistant message
The system SHALL present assistant-message metadata in a dedicated secondary inspector surface when the user activates the metadata-inspector action from a `Super-Agent` assistant message. On larger viewports, the inspector SHALL appear as a right-side panel within the workspace. On smaller viewports, the system SHALL present the same metadata content in a right-side sheet.

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
- **WHEN** the user activates the metadata-inspector action on a `Super-Agent` assistant message that contains displayable metadata
- **THEN** the workspace opens a right-side metadata inspector for that selected assistant response
- **AND** the inspector shows only the available `Model`, `Skill`, and `Tools` sections for that message

#### Scenario: Tool calls are shown as compact activity-style steps
- **WHEN** the selected `Super-Agent` assistant response contains one or more historical tool calls in its metadata
- **THEN** the metadata inspector renders those tool calls as compact execution-style step rows with mapped labels and summarized arguments
- **AND** the inspector does not show raw JSON argument dumps for those tool calls

#### Scenario: Conversation change clears the selected metadata target
- **WHEN** the active `Super-Agent` conversation changes after a metadata inspector has been opened
- **THEN** the workspace clears the previously selected assistant-message metadata target
- **AND** the inspector does not continue showing metadata from the previously active conversation as if it belonged to the new one
