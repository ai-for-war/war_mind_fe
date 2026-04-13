## ADDED Requirements

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
