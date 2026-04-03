## ADDED Requirements

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
