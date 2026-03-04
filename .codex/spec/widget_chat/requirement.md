# Widget Chat với AI (Popover) — Requirements & Solution

## 0) Bối cảnh

- Frontend repo: `ai_frontend_kiro`
- Backend đã có sẵn API + Socket.IO tại:
  - REST: `ai_service_kiro/app/api/v1/ai/chat.py`
  - Socket events constants: `ai_service_kiro/app/common/event_socket.py`
  - Socket auth + room join: `ai_service_kiro/app/socket_gateway/server.py`
- Luồng giao tiếp:
  - Client gửi message bằng **REST API**
  - Backend trả về response theo kiểu **streaming thông qua Socket.IO** (emit theo `conversation_id`)

## 1) Mục tiêu / Non-goals

### 1.1 Goals

1. Widget chat xuất hiện ở **mọi trang sau login** (authenticated area).
2. UI dạng **Popover (Option 1)**: nút nổi góc phải dưới mở popover panel.
3. Có **list conversations** + **chọn lại** conversation bất kỳ.
4. Có hiển thị **tool events** (tool start/end) trong quá trình AI xử lý.
5. Hỗ trợ **streaming đồng thời nhiều conversation**: conversation A đang stream, chuyển sang B gửi tiếp thì B vẫn stream; tool events cũng tách theo từng conversation.
6. Không cần mobile UX (desktop-only).
7. Không cần unread badge.

### 1.2 Non-goals (phạm vi không làm trong MVP)

- Không implement fallback polling / realtime recovery khi socket mất event (chấp nhận không realtime).
- Không implement unread counter/badge.
- Không implement pagination UI phức tạp cho messages (backend endpoint messages hiện trả toàn bộ).
- Không implement “archive conversation” UI/flow (backend có status nhưng UI có thể để sau).

## 2) Thuật ngữ

- **Conversation**: phiên chat, có `conversation_id`.
- **Message**: tin nhắn user/assistant trong conversation.
- **Draft (Assistant Draft Message)**: message assistant tạm thời đang streaming (chưa commit vào DB).
- **Tool Call**: một lần agent gọi tool (vd web search), định danh bằng `tool_call_id`.

## 3) Yêu cầu chức năng (Functional Requirements)

### 3.1 Hiển thị widget toàn cục

- Widget luôn hiển thị trong layout chính sau login (ví dụ mount trong `MainLayout`).
- Widget có floating trigger button ở góc phải dưới:
  - Có tooltip “Chat with AI”
  - Khi click mở popover panel.

### 3.2 Popover panel layout (desktop)

- Popover panel có layout 2 cột:
  - **Left**: danh sách conversations
  - **Right**: thread messages + tool details + composer
- Panel có kích thước desktop cố định (ví dụ: `w-[980px] h-[720px]`), có scroll nội bộ cho list/messages.

### 3.3 Conversation list

Trong left panel:
- Hiển thị danh sách conversations từ API `GET /chat/conversations`.
- Cho phép:
  - Select conversation (set active conversation).
  - Create “New chat”:
    - Nếu tạo mới: active conversation sẽ được set khi `POST /chat/messages` trả `conversation_id`.
- Mỗi conversation item hiển thị:
  - `title`
  - `last_message_at` (hoặc fallback nếu null)
  - indicator **Streaming…** nếu conversation đó đang streaming (không phải unread).

### 3.4 Message thread

Trong right panel:
- Hiển thị messages của active conversation bằng `GET /chat/conversations/{conversation_id}/messages`.
- Render UI theo bộ `ai/*` (shadcn-io):
  - Message bubble cho user/assistant
  - Khi assistant streaming: render thêm một “assistant draft bubble”.

### 3.5 Composer (send message)

- User nhập message và gửi bằng REST `POST /chat/messages`.
- UX rules:
  - Nếu active conversation đang streaming: **disable send** trong conversation đó (để tránh 2 luồng stream trong cùng conversation).
  - Vẫn cho phép user chuyển sang conversation khác và gửi tiếp (conversation khác sẽ stream độc lập).
- Khi gửi:
  - Optimistic append user message vào UI (cache messages của conversation).
  - Call API, nhận `{ conversation_id, user_message_id }`:
    - Nếu là conversation mới: cập nhật active conversation theo id trả về, và refresh conversations list.

### 3.6 Tool events display

- Khi backend emit tool events, UI hiển thị theo conversation:
  - `tool_start`: show tool item “running” + input arguments
  - `tool_end`: mark “done” + output result
- Tool timeline/sections đặt dưới assistant draft message hoặc trong collapsible “Details”.

### 3.7 Socket status / Error states

- UI hiển thị socket status (connected/disconnected/error) trong header của widget hoặc thread.
- Khi `chat:message:failed`:
  - Stop streaming draft của conversation đó
  - Hiển thị error message (inline trong thread).
- Không auto-retry/poll.

## 4) Yêu cầu phi chức năng (Non-functional)

### 4.1 Tương thích kiến trúc project

- Tuân thủ Feature-first architecture trong `ai_frontend_kiro/AGENTS.md`:
  - Tất cả code chat nằm trong `src/features/chat/...`
  - Public exports qua `src/features/chat/index.ts` (barrel)
- Styling dùng Tailwind classes, ưu tiên shadcn/ui + shadcn-io.

### 4.2 Performance / UX

- Conversation list và messages dùng TanStack Query để cache và tránh refetch không cần thiết.
- Streaming token phải append mượt, tránh re-render cả app.

### 4.3 Security

- Socket auth dùng JWT token hiện có từ `useAuthStore`.
- Không log token ra console.

## 5) Hợp đồng API (REST)

Base URL: `import.meta.env.VITE_API_URL` (vd `http://localhost:8000/api/v1`)

### 5.1 Send message

- `POST /chat/messages`
- Request:
  - `conversation_id?: string | null`
  - `content: string`
- Response:
  - `user_message_id: string`
  - `conversation_id: string`

### 5.2 List conversations

- `GET /chat/conversations?skip=&limit=&status=&search=`
- Response:
  - `items: { id, title, status, message_count, last_message_at, created_at, updated_at }[]`
  - `total, skip, limit`

### 5.3 Get messages for conversation

- `GET /chat/conversations/{conversation_id}/messages`
- Response:
  - `conversation_id: string`
  - `messages: { id, role, content, attachments, metadata, is_complete, created_at }[]`

## 6) Hợp đồng Socket.IO (Server → Client)

Socket URL: `import.meta.env.VITE_SOCKET_URL` (vd `http://localhost:8000`)

### 6.1 Auth & rooms

- Client connect với:
  - `auth: { token: <jwt> }`
- Server join room:
  - `user:{user_id}`

### 6.2 Event names & payloads (backend source of truth)

Event constants theo backend `ChatEvents`:
- `chat:message:started`
  - `{ conversation_id: string }`
- `chat:message:token`
  - `{ conversation_id: string, token: string }`
- `chat:message:tool_start`
  - `{ conversation_id: string, tool_name: string, tool_call_id: string, arguments: Record<string, unknown> }`
- `chat:message:tool_end`
  - `{ conversation_id: string, tool_call_id: string, result: string }`
- `chat:message:completed`
  - `{ conversation_id: string, message_id: string, content: string, metadata: unknown | null }`
- `chat:message:failed`
  - `{ conversation_id: string, error: string }`

### 6.3 Concurrency model (đa conversation streaming)

- Mọi event đều chứa `conversation_id` ⇒ UI/state phải partition theo `conversation_id`.
- Chấp nhận 2+ conversation cùng streaming song song.

**Giới hạn hiện tại (important):**
- Token/tool events không có `message_id` ⇒ không thể phân biệt 2 streaming song song *trong cùng conversation*.
- Giải pháp MVP phía frontend:
  - Disable send nếu conversation đang streaming (per-conversation lock).
  - Cho phép gửi ở conversation khác (multi-stream OK).

## 7) Solution đề xuất (toàn diện)

### 7.1 Data ownership & state

**React Query (server truth)**
- Cache:
  - Conversations list
  - Messages per conversation
- Mutations:
  - Send message
- Invalidation:
  - Sau `completed`: invalidate messages của conversation đó (hoặc update cache trực tiếp), invalidate conversations list (để updated_at/last_message).

**Zustand (realtime ephemeral, multi-stream)**
- `isWidgetOpen`
- `activeConversationId`
- `draftsByConversationId`:
  - `{ text, isStreaming, error?, startedAt? }`
- `toolsByConversationId`:
  - map theo `tool_call_id` để update start/end

### 7.2 Socket bridge (global single mount)

Tạo 1 hook/component “Socket Bridge” được mount 1 lần (trong MainLayout cùng widget):
- Lấy socket instance từ `getSocket()`
- Register listeners:
  - started/token/tool_start/tool_end/completed/failed
- Mỗi listener:
  - Update zustand maps theo `conversation_id`
  - Với `completed`: sync React Query cache/invalidate.

### 7.3 UI component hierarchy (feature-first)

Đề xuất module `src/features/chat/`:
- `components/`
  - `ChatWidgetPopover`
  - `ConversationList`
  - `ConversationListItem`
  - `ChatThread`
  - `ChatComposer`
  - `ChatToolTimeline` (tool events UI)
- `api/`
  - `chat.api.ts` (3 endpoints)
- `hooks/`
  - `useChatConversations`
  - `useChatMessages(conversationId)`
  - `useSendChatMessage`
  - `useChatSocketBridge` (attach socket listeners)
- `stores/`
  - `useChatWidgetStore`
- `types/`
  - `chat.types.ts`
- `index.ts` (barrel)

### 7.4 UI mapping với shadcn-io ai/*

Ưu tiên dùng các nhóm component `ai/*`:
- Message UI: `ai/message` (bubble)
- Input UI: `ai/prompt-input` (composer)
- Tool UI: `ai/tool` hoặc `ai/task` / `ai/chain-of-thought` cho timeline

Ghi chú:
- Repo hiện chưa confirm đang vendor các file `components/ui/shadcn-io/ai/*`.
- Implementation cần đảm bảo các component này có mặt và import path phù hợp với alias hiện tại.

### 7.5 Dataflow chi tiết

**On open widget**
1. Fetch conversations list.
2. Nếu `activeConversationId` chưa có:
   - set mặc định = conversation mới nhất (nếu có), hoặc trạng thái “No conversation selected”.

**On select conversation**
1. Set `activeConversationId`.
2. Fetch messages của conversation đó.
3. Nếu conversation đó đang streaming (`draftsByConversationId[id].isStreaming`):
   - render draft + tool timeline hiện tại.

**On send message**
1. Nếu conversation đang streaming ⇒ block send (disable).
2. Optimistic append user message vào cache messages.
3. Call `POST /chat/messages` (conversation_id hoặc null).
4. Nếu response trả conversation_id mới:
   - set activeConversationId
   - invalidate conversations list
5. Backend emit streaming qua socket:
   - started/token/tool_start/tool_end/completed/failed update store/caches.

## 8) Tiêu chí nghiệm thu (Acceptance Criteria)

1. Widget hiển thị trên mọi route sau login.
2. Popover mở/đóng ổn định, layout 2 cột.
3. Conversations list hiển thị và chọn được conversation.
4. Send message gọi REST thành công, nhận `conversation_id`.
5. Streaming token hiển thị realtime trong đúng conversation, kể cả khi user chuyển qua conversation khác.
6. Tool events hiển thị theo đúng conversation và update start/end theo `tool_call_id`.
7. Có thể để A đang stream rồi chuyển qua B gửi tiếp và B stream song song (multi-conversation).
8. Không có unread badge.
9. Khi socket lỗi/mất kết nối: UI chỉ hiển thị status, không polling fallback.

## 9) Rủi ro / Điểm cần lưu ý

- Payload mismatch hiện tại giữa backend và `src/types/socket.types.ts` phải được sửa trước khi wiring listeners.
- Nếu backend cho phép user gửi message tiếp trong cùng conversation khi đang stream:
  - UI MVP sẽ chặn để tránh nhập nhằng stream (vì thiếu `message_id` ở token/tool).
- Nếu sau này backend bổ sung `message_id` vào started/token/tool events:
  - Có thể nâng cấp để hỗ trợ multi-stream trong cùng conversation (không bắt buộc ở MVP).
