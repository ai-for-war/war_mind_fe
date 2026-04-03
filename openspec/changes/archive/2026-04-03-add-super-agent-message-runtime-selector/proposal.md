## Why

The frontend already exposes a working `Super-Agent` chat workspace, but it does not yet let members choose the runtime model configuration that the backend now publishes through the lead-agent catalog. This change is needed now so users can switch model per message inside the composer, stay aligned with the backend's runtime source of truth, and understand which runtime was used for each turn.

## What Changes

- Add runtime selection to the `Super-Agent` composer so each outbound message can be sent with the currently selected provider, model, and optional reasoning value
- Add a compact `Choose model` control inside the composer that opens a grouped model picker, using provider names as menu blocks and model entries as selectable items
- Add an inline `Reasoning` control that appears only when the selected model exposes non-empty `reasoning_options`
- Load the runtime catalog from `GET /api/v1/lead-agent/catalog`, prefill backend defaults, and prevent unsupported provider/model/reasoning combinations from being sent
- Show the runtime used for each submitted turn in the chat thread so users can tell when different messages were sent with different models
- Handle loading, empty, error, and catalog-refresh fallback states without breaking prompt composition or allowing stale invalid selections

## Capabilities

### New Capabilities
- `super-agent-chat-workspace`: Define the runtime-aware composer and thread behavior for `Super-Agent`, including per-message runtime switching, message submission semantics, and runtime visibility in the conversation UI
- `lead-agent-runtime-catalog`: Define how the frontend loads, applies, validates, and reacts to the backend-provided provider/model/reasoning catalog for lead-agent runtime selection

### Modified Capabilities

## Impact

- **Affected frontend areas**: `src/features/super-agent/` components, hooks, API layer, types, and workspace state used by the chat composer and thread
- **Likely new frontend pieces**: a catalog query hook, runtime selection state for fresh and active chat composition, and composer-local controls for model and reasoning selection
- **API integration**: frontend consumption of the existing `GET /api/v1/lead-agent/catalog` contract plus extension of the lead-agent message request mapping to include `provider`, `model`, and optional `reasoning`
- **UI behavior changes**: the composer footer gains runtime controls, the model picker is grouped by provider, and sent messages expose the runtime snapshot used for that turn
- **No backend catalog hardcoding**: provider, model, and reasoning options must remain fully driven by the backend catalog semantics documented in `docs/catalog/lead_agent_catalog_frontend_guide.md`
- **No new top-level page or route**: the change stays inside the existing `Super-Agent` workspace rather than adding a separate settings surface
