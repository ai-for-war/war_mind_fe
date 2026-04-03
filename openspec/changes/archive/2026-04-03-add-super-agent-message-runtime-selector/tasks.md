## 1. Runtime catalog data and request primitives

- [x] 1.1 Add `super-agent` TypeScript types for the lead-agent runtime catalog response, provider/model entries, reasoning options, and runtime snapshot payloads
- [x] 1.2 Add query-key helpers and an API-layer function for `GET /api/v1/lead-agent/catalog` under `src/features/super-agent/`
- [x] 1.3 Add a TanStack Query hook for loading and refetching the lead-agent runtime catalog with loading, error, and retry support
- [x] 1.4 Extend the `Super-Agent` send-message request typing and API mapping to include `provider`, `model`, and optional `reasoning`
- [x] 1.5 Add request-normalization helpers that validate the active runtime selection against the latest catalog and omit `reasoning` when the selected model does not support it

## 2. Composer runtime state and fallback behavior

- [x] 2.1 Extend the `super-agent` workspace state to track the active composer runtime selection for fresh-chat and selected-conversation flows
- [x] 2.2 Initialize composer runtime state from the backend catalog defaults after the catalog query succeeds
- [x] 2.3 Implement state transitions so selecting a model also sets its owning provider and selecting a new model resets or rehydrates reasoning correctly
- [x] 2.4 Implement invalid-selection fallback logic for catalog refreshes, including model replacement, reasoning replacement, and a visible notice when the active selection changes
- [x] 2.5 Prevent prompt submission when the catalog is unavailable or the runtime selection cannot be normalized to a valid backend-supported tuple

## 3. Composer UI and grouped picker experience

- [x] 3.1 Update `ComposerPanel` to render a compact `Choose model` trigger inside the composer footer beside the existing submit controls
- [x] 3.2 Implement the grouped model picker so provider names render as menu block headers and models render as selectable items in catalog order
- [x] 3.3 Ensure the closed `Choose model` trigger displays both provider and model so the active runtime is unambiguous
- [x] 3.4 Add the conditional `Reasoning` control that appears only when the selected model has non-empty `reasoning_options`
- [x] 3.5 Implement responsive picker behavior so desktop uses a dialog/command-style surface and mobile uses a sheet-style surface without breaking composer usability
- [x] 3.6 Add composer-level loading, error, and retry states for runtime selection so the UI does not invent catalog values when the backend catalog is unavailable

## 4. Submission flow and per-turn runtime display

- [x] 4.1 Update `ChatWorkspace` submission flow to send the normalized runtime snapshot with every outbound message
- [x] 4.2 Extend optimistic user-message creation for both fresh-chat and existing-conversation flows so each submitted turn carries its runtime snapshot immediately
- [x] 4.3 Extend `useSendMessage` optimistic cache handling to preserve runtime metadata on optimistic user messages
- [x] 4.4 Extend `SuperAgentMessageRecord` handling and thread rendering so the chat thread displays the runtime used for each submitted turn
- [x] 4.5 Preserve stable per-turn runtime display when later messages in the same conversation use different models

## 5. Verification and refinement

- [x] 5.1 Verify fresh-chat and existing-conversation flows both expose runtime controls and allow per-message runtime switching
- [x] 5.2 Verify grouped model selection, conditional reasoning visibility, and reasoning clearing behavior across models with and without reasoning support
- [x] 5.3 Verify send-message requests include `provider`, `model`, and optional `reasoning` exactly when allowed by the catalog
- [x] 5.4 Verify optimistic turns and persisted thread turns display the correct runtime after single-model and mixed-model conversations
- [x] 5.5 Verify catalog refresh fallback behavior when the selected model or reasoning value becomes invalid
- [x] 5.6 Verify desktop and mobile composer layouts remain usable with the new runtime controls
- [x] 5.7 Run lint and typecheck for the touched `super-agent` files and resolve any issues introduced by the change
