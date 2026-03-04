# Widget Chat với AI — Implementation Plan (Step-by-step)

[x] 1) Đồng bộ contract Socket payload với backend
- [x] 1.1) Sửa `src/types/socket.types.ts` để khớp payload backend (conversation_id/tool_call_id/arguments/result)
- [x] 1.2) Đảm bảo `src/lib/socket-client.ts` vẫn connect với `auth: { token }` và `VITE_SOCKET_URL`

[x] 2) Tạo feature module `chat` theo feature-first
- [x] 2.1) Tạo folder `src/features/chat/{api,components,hooks,stores,types}`
- [x] 2.2) Tạo `src/features/chat/index.ts` (barrel exports) theo rule import của `AGENTS.md`

[x] 3) Định nghĩa types cho REST response (frontend)
- [x] 3.1) Tạo `src/features/chat/types/chat.types.ts` (Conversation, Message, request/response types)
- [x] 3.2) Map đúng field backend: `id/title/status/message_count/last_message_at/created_at/updated_at`

[x] 4) Implement REST API layer cho chat
- [x] 4.1) Tạo `src/features/chat/api/chat.api.ts`
- [x] 4.2) Implement `sendChatMessage`, `getChatConversations`, `getChatMessages` dùng `apiClient`
- [x] 4.3) Normalize params `skip/limit/status/search` theo backend

[x] 5) Implement React Query hooks (server-truth)
- [x] 5.1) Tạo `src/features/chat/hooks/chat.keys.ts` (query keys)
- [x] 5.2) Tạo `useChatConversations` (useQuery)
- [x] 5.3) Tạo `useChatMessages(conversationId)` (useQuery)
- [x] 5.4) Tạo `useSendChatMessage` (useMutation) + optimistic update cho messages
- [x] 5.5) Sau completed: invalidate `messages(conversationId)` và `conversations()`

[x] 6) Implement Zustand store cho widget + streaming theo conversation_id (ephemeral)
- [x] 6.1) Tạo `src/features/chat/stores/use-chat-widget-store.ts`
- [x] 6.2) State tối thiểu:
  - `isWidgetOpen`
  - `activeConversationId`
  - `draftsByConversationId: Record<string, { text; isStreaming; error?; startedAt? }>`
  - `toolsByConversationId: Record<string, Record<string, { tool_name; arguments; result?; status }>>`
- [x] 6.3) Actions:
  - `openWidget/closeWidget/toggleWidget`
  - `setActiveConversation`
  - `setDraftStarted/appendDraftToken/setDraftCompleted/setDraftFailed/clearDraft`
  - `toolStart/toolEnd/clearToolsForConversation`

[x] 7) Implement Socket Bridge để bắt event 1 lần (global) và route theo conversation_id
- [x] 7.1) Tạo hook `src/features/chat/hooks/use-chat-socket-bridge.ts`
- [x] 7.2) Attach listeners từ `getSocket()`:
  - `chat:message:started`
  - `chat:message:token`
  - `chat:message:tool_start`
  - `chat:message:tool_end`
  - `chat:message:completed`
  - `chat:message:failed`
- [x] 7.3) Mỗi handler:
  - Update zustand theo `conversation_id` (support multi-conversation streaming)
  - On completed: sync React Query (update cache hoặc invalidate)
- [x] 7.4) Cleanup listeners khi unmount (off) để tránh duplicate handlers

[x] 8) Chuẩn bị UI primitives cần thiết cho widget
- [x] 8.1) Verify `Popover`/`Tooltip`/`Button`/`ScrollArea`/`Collapsible`/`Badge` đã có đủ
- [x] 8.2) Nếu thiếu `ScrollArea` hoặc component shadcn/ui cần cho list/messages: add đúng chuẩn project
- [x] 8.3) Verify bộ `shadcn-io ai/*` đã có trong repo (import path thống nhất)

[x] 9) Implement UI — Popover widget shell
- [x] 9.1) Tạo `src/features/chat/components/chat-widget-popover.tsx`
- [x] 9.2) Floating trigger button (bottom-right) + tooltip “Chat with AI”
- [x] 9.3) `PopoverContent` layout 2 cột desktop: left conversations, right thread
- [x] 9.4) Bind open state với store `isWidgetOpen`

[x] 10) Implement UI — Conversation list (left panel)
- [x] 10.1) Tạo `src/features/chat/components/conversation-list.tsx`
- [x] 10.2) Render list từ `useChatConversations`
- [x] 10.3) New chat button:
  - set `activeConversationId = null`
  - clear active draft/tools UI (chỉ UI; server conversation tạo khi send)
- [x] 10.4) Conversation item:
  - title + last_message_at
  - indicator “Streaming…” nếu `draftsByConversationId[id].isStreaming === true`
- [x] 10.5) On select: `setActiveConversationId(id)`

[x] 11) Implement UI — Chat thread (right panel)
- [x] 11.1) Tạo `src/features/chat/components/chat-thread.tsx`
- [x] 11.2) Load messages bằng `useChatMessages(activeConversationId)`
- [x] 11.3) Render message bubbles theo shadcn-io `ai/message` (user/assistant)
- [x] 11.4) Nếu conversation đang streaming:
  - render assistant draft bubble (content = `draft.text`)
  - render tool timeline bên dưới (theo `toolsByConversationId[conversationId]`)
- [x] 11.5) Nếu draft failed: hiển thị error inline

[x] 12) Implement UI — Tool timeline (tool_start/tool_end)
- [x] 12.1) Tạo `src/features/chat/components/chat-tool-timeline.tsx`
- [x] 12.2) Hiển thị theo `tool_call_id`:
  - tool name
  - status running/done
  - input arguments (pretty JSON)
  - output result (string/json)
- [x] 12.3) Dùng `ai/tool` hoặc `ai/task`/`ai/chain-of-thought` để đúng style ưu tiên

[x] 13) Implement UI — Composer (send message)
- [x] 13.1) Tạo `src/features/chat/components/chat-composer.tsx`
- [x] 13.2) Dùng shadcn-io `ai/prompt-input` (hoặc component ai tương đương đã có)
- [x] 13.3) Wire send bằng `useSendChatMessage`
- [x] 13.4) Disable send nếu active conversation đang streaming (per-conversation lock)
- [x] 13.5) Sau send:
  - Nếu server trả conversation_id mới: set activeConversationId theo id mới
  - Invalidate conversations list

[x] 14) Mount widget + socket bridge vào authenticated layout
- [x] 14.1) Update `src/app/layouts/main-layout.tsx` để mount:
  - `useChatSocketBridge()` (1 lần)
  - `<ChatWidgetPopover />` (visible mọi trang sau login)
- [x] 14.2) Đảm bảo không mount trong `/login`

[ ] 15) QA theo acceptance criteria
- [ ] 15.1) Manual test: open widget ở nhiều route
- [ ] 15.2) Test: list conversations load + select
- [ ] 15.3) Test: send message trong conversation A → streaming OK
- [ ] 15.4) Test: chuyển qua conversation B, send tiếp khi A còn stream → B stream song song, tool events tách đúng conversation_id
- [ ] 15.5) Test: socket disconnect → UI chỉ hiện status, không polling

[ ] 16) Polish / hardening
- [ ] 16.1) Prevent duplicate socket listeners (đảm bảo cleanup + idempotent attach)
- [ ] 16.2) Handle empty states: chưa có conversation, chưa chọn conversation, messages rỗng
- [ ] 16.3) Basic accessibility: aria-label/keyboard for trigger + buttons






