## Purpose
Define how the frontend loads and applies the lead-agent runtime catalog for Super-Agent runtime selection.
## Requirements
### Requirement: Frontend runtime selection is driven by the lead-agent catalog
The system SHALL load the runtime catalog from `GET /api/v1/lead-agent/catalog` before allowing the user to choose lead-agent runtime values in the `Super-Agent` composer. The catalog response SHALL act as the source of truth for:
- available providers
- available models under each provider
- supported reasoning options under each model
- backend defaults for provider, model, and reasoning

The frontend SHALL prefill the composer runtime selection using the backend defaults exposed by the catalog.

#### Scenario: Catalog load succeeds
- **WHEN** the runtime catalog request succeeds
- **THEN** the composer initializes its runtime selection from the backend-provided default provider, default model, and default reasoning when present
- **AND** the available runtime choices match the catalog response instead of hardcoded frontend values

#### Scenario: Catalog request fails
- **WHEN** the runtime catalog request fails
- **THEN** the composer does not invent provider, model, or reasoning values
- **AND** the UI shows a visible failure state that prevents unsupported runtime selection submission

### Requirement: Choose model picker is grouped by provider and selects one model
The system SHALL provide a single `Choose model` picker for runtime selection in the composer. The picker SHALL organize models using provider groupings from the catalog, where each provider is shown as a menu block header and each supported model is shown as a selectable item within that provider block.

The picker SHALL support exactly one active model selection at a time. Selecting a model SHALL also determine the active provider for the next submitted message.

#### Scenario: Picker renders provider-grouped model choices
- **WHEN** the user opens the `Choose model` control after the catalog has loaded
- **THEN** the picker displays provider names as grouped headers
- **AND** each header contains the models available under that provider in catalog order unless the UI applies an explicit search filter

#### Scenario: Selecting a model updates active runtime selection
- **WHEN** the user selects a model item from a provider group
- **THEN** the composer updates its active runtime selection to that model and its owning provider
- **AND** the selected model becomes the runtime used for the next valid prompt submission

### Requirement: Reasoning control is conditional on model support
The system SHALL show a `Reasoning` control only for models whose catalog entry exposes a non-empty `reasoning_options` list. When the selected model supports reasoning, the control SHALL offer only the reasoning values allowed by that model and SHALL prefill the model's `default_reasoning` when present.

When the selected model does not support reasoning, the reasoning control SHALL not be shown and no stale reasoning value SHALL remain active for submission.

#### Scenario: Model with reasoning options
- **WHEN** the user selects a model whose catalog entry has one or more `reasoning_options`
- **THEN** the composer shows a `Reasoning` control populated only with those allowed values
- **AND** the control uses the model's `default_reasoning` when the catalog provides one

#### Scenario: Model without reasoning options
- **WHEN** the user selects a model whose catalog entry has an empty `reasoning_options` list
- **THEN** the composer hides the `Reasoning` control
- **AND** the next outbound message does not reuse a reasoning value from a previously selected model

### Requirement: Frontend falls back safely when catalog selection becomes invalid
The system SHALL validate the active composer runtime selection against the latest loaded catalog. If the currently selected provider, model, or reasoning is no longer valid after a catalog refresh or replacement, the frontend SHALL replace the invalid selection with a valid backend-default selection before the next submission.

The UI SHALL communicate that the previous selection is no longer available.

#### Scenario: Previously selected model disappears from refreshed catalog
- **WHEN** the catalog is refreshed and the currently selected model is no longer present in its provider group
- **THEN** the composer replaces the invalid selection with a valid default model from the refreshed catalog
- **AND** the UI informs the user that the old model is no longer available

#### Scenario: Previously selected reasoning becomes invalid
- **WHEN** the selected model remains available but the previously selected reasoning value is not present in the refreshed model `reasoning_options`
- **THEN** the composer replaces the invalid reasoning value with the model's valid default reasoning when available
- **AND** the composer does not allow the stale invalid reasoning value to be submitted
