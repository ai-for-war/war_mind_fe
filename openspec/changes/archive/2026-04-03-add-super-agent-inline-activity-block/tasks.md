## 1. Activity Trace State

- [x] 1.1 Extend `src/features/super-agent/types/chat-workspace.types.ts` with inline activity trace and activity step models that support `active`, `complete`, and `failed`
- [x] 1.2 Add per-conversation activity trace state and actions to `src/features/super-agent/stores/use-super-agent-chat-workspace-store.ts`
- [x] 1.3 Update conversation workspace reset paths so activity traces are cleared on explicit reset and naturally disappear after reload

## 2. Socket Lifecycle Wiring

- [x] 2.1 Subscribe to `chat:message:tool_start` in `src/features/super-agent/hooks/use-chat-lifecycle-subscriptions.ts` and create or refresh an active activity step keyed by `tool_call_id`
- [x] 2.2 Subscribe to `chat:message:tool_end` in `src/features/super-agent/hooks/use-chat-lifecycle-subscriptions.ts` and mark the matching activity step as complete without removing it
- [x] 2.3 Update completion and failure handling in `src/features/super-agent/hooks/use-chat-lifecycle-subscriptions.ts` so completed traces stay visible for the current session and failed runs can preserve failed steps

## 3. Tool Presentation Mapping

- [x] 3.1 Create a super-agent tool presentation registry that maps backend `tool_name` values to display labels and icons, including `fetch_content -> Crawl`
- [x] 3.2 Add argument summary helpers that format tool start arguments into compact inline text with URL shortening and string truncation rules
- [x] 3.3 Cover fallback behavior for unknown tools so unmapped `tool_name` values still render with a stable label and argument summary

## 4. Inline Activity UI

- [x] 4.1 Create dedicated inline activity block and activity step components under `src/features/super-agent/components/` for compact assistant-bubble trace rendering
- [x] 4.2 Update `src/features/super-agent/components/chat-thread.tsx` to render the activity block above streamed assistant text inside the assistant message bubble
- [x] 4.3 Replace the generic `Thinking...` placeholder behavior with activity-aware streaming UI while keeping answer text rendering unchanged below the block

## 5. Verification

- [ ] 5.1 Verify a streaming assistant turn shows one distinct row per tool call and never renders a `pending` state
- [ ] 5.2 Verify completed assistant turns keep their inline activity block for the current session but do not rehydrate it after a full reload
- [ ] 5.3 Verify mapped labels and compact arguments render correctly for at least `search` and `fetch_content`, including `fetch_content` displaying as `Crawl`
