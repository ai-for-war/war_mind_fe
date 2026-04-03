## ADDED Requirements

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
