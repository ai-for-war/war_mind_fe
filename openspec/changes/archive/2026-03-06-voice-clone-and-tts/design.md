## Context

Backend (ai_service_kiro) đã triển khai xong voice cloning và TTS endpoints dùng MiniMax AI. Frontend cần API service layer + React Query hooks để kết nối. Hiện tại frontend chưa có:
- File upload (multipart/form-data) — cần cho voice clone
- Audio playback logic — cần cho cả 2 features
- Socket.IO client — nhưng **không nằm trong scope** (chỉ dùng sync TTS)

Project tuân theo Feature-First Architecture. Path alias `@/` map tới `src/`. Dependencies: Axios, React Query, Zustand đã có sẵn.

Backend endpoints tham chiếu:
- **Voices**: `POST /voices/clone` (multipart), `GET /voices`, `GET /voices/{voice_id}`, `DELETE /voices/{voice_id}`
- **TTS**: `POST /tts/generate` (sync), `GET /tts/audio`, `GET /tts/audio/{audio_id}`, `DELETE /tts/audio/{audio_id}`

## Goals / Non-Goals

**Goals:**
- Tạo voice-cloning feature module (types, API, hooks) tương tác với 4 voice endpoints
- Tạo tts feature module (types, API, hooks) tương tác với 4 TTS endpoints (sync only)
- Tạo shared audio player hook dùng chung cho cả 2 features
- Thêm route `/tts` vào router

**Non-Goals:**
- Không implement TTS streaming (`POST /tts/stream` + Socket.IO events) — sẽ làm sau
- Không implement voice preview (`POST /voices/{voice_id}/preview`) — không cần
- Không implement UI components — chỉ logic layer (types, API, hooks)
- Không implement Socket.IO client
- Không validate file ở frontend (backend validate magic bytes, duration, size)

## Decisions

### 1. Tách 2 feature modules riêng biệt

**Choice**: `src/features/voice-cloning/` và `src/features/tts/` là 2 feature riêng

**Rationale**: Voice cloning (quản lý voices) và TTS (generate + quản lý audio) là 2 domain khác nhau. Tách riêng giữ mỗi feature focused, dễ maintain. TTS feature import `useVoices` hook từ voice-cloning khi cần danh sách voices.

**Alternatives considered**:
- Gộp chung 1 feature: Đơn giản hơn lúc đầu nhưng feature sẽ phình ra khi thêm streaming, preview, hoặc advanced TTS features sau

### 2. TTS import useVoices từ voice-cloning (share React Query cache)

**Choice**: TTS feature import trực tiếp `useVoices` hook từ `@/features/voice-cloning`

**Rationale**: React Query cache key giống nhau → không fetch lại voices nếu đã có cache. Tránh duplicate API calls và duplicate type definitions. Feature-to-feature import chấp nhận được vì là read-only dependency (TTS chỉ đọc list, không mutate voices).

**Alternatives considered**:
- TTS tự gọi `voicesApi.listVoices()`: Duplicate logic, không tận dụng cache
- Shared voices store (Zustand): Overkill — React Query đã cung cấp caching

### 3. FormData cho voice clone upload

**Choice**: Tạo FormData thủ công trong `voicesApi.cloneVoice()`

**Rationale**: Backend endpoint `POST /voices/clone` nhận multipart/form-data với 3 fields: `file` (UploadFile), `name` (string), `voice_id` (string). Axios tự set `Content-Type: multipart/form-data` khi body là FormData instance — không cần override header thủ công.

**Trade-off**: Đây là pattern mới trong project (lần đầu dùng multipart). Cần đảm bảo request interceptor không override `Content-Type` header khi body là FormData.

### 4. HTML Audio element cho playback (không dùng Web Audio API)

**Choice**: `useAudioPlayer` hook wrap native `HTMLAudioElement`

**Rationale**: Chỉ cần phát audio từ URL hoặc Blob, không cần xử lý audio chunks hay real-time streaming. `HTMLAudioElement` đủ cho use case sync: phát signed URL, pause, resume, seek. Web Audio API chỉ cần khi implement streaming playback sau.

**Alternatives considered**:
- Web Audio API (`AudioContext`): Powerful nhưng complex, chỉ cần khi xử lý audio chunks từ streaming
- Thư viện bên thứ 3 (`howler.js`, `use-sound`): Thêm dependency không cần thiết cho use case đơn giản

### 5. React Query cho tất cả API interactions

**Choice**: `useQuery` cho read operations, `useMutation` cho write operations

**Rationale**: Tuân thủ pattern đã có trong project (`useLogin` dùng `useMutation`). React Query cung cấp caching, invalidation, loading/error states, retry — không cần tự implement. Mutations invalidate related queries khi thành công (vd: clone voice → invalidate voices list).

**Query key conventions:**
- `["voices"]` — voice list
- `["voices", voiceId]` — voice detail
- `["tts", "audio"]` — audio list
- `["tts", "audio", audioId]` — audio detail

### 6. File structure

**Choice**: Đặt files theo Feature-First Architecture, mỗi feature có `api/`, `types/`, `hooks/`

```
src/
├── hooks/
│   └── use-audio-player.ts          # shared hook
├── features/
│   ├── voice-cloning/
│   │   ├── api/
│   │   │   └── voices-api.ts
│   │   ├── types/
│   │   │   └── voice.types.ts
│   │   ├── hooks/
│   │   │   ├── use-voices.ts
│   │   │   ├── use-voice-detail.ts
│   │   │   ├── use-clone-voice.ts
│   │   │   └── use-delete-voice.ts
│   │   ├── components/
│   │   │   └── voice-cloning-page.tsx  # existing
│   │   └── index.ts
│   └── tts/
│       ├── api/
│       │   └── tts-api.ts
│       ├── types/
│       │   └── tts.types.ts
│       ├── hooks/
│       │   ├── use-generate-audio.ts
│       │   ├── use-audio-list.ts
│       │   ├── use-audio-detail.ts
│       │   └── use-delete-audio.ts
│       ├── components/
│       │   └── tts-page.tsx
│       └── index.ts
```

**Rationale**: Tuân thủ project conventions. `useAudioPlayer` nằm ở `src/hooks/` vì là shared hook, không thuộc feature nào cụ thể.

## Risks / Trade-offs

**[First multipart upload — Content-Type header]** → Mitigate: Axios auto-detect FormData và set đúng `Content-Type: multipart/form-data` với boundary. Request interceptor hiện set `Content-Type: application/json` ở default headers nhưng Axios override khi body là FormData. Verify khi implement.

**[Signed URL expiry (2 giờ)]** → Signed URLs cho audio và voice source audio expire sau 7200s. Nếu user để tab mở lâu, audio sẽ không phát được. Mitigate: re-fetch detail endpoint trước khi phát nếu URL cũ, hoặc chấp nhận lỗi + retry.

**[Cross-feature import coupling]** → TTS depend vào voice-cloning barrel export. Nếu voice-cloning feature thay đổi API signature, TTS có thể bị break. Mitigate: voice-cloning export qua `index.ts` barrel, giữ public API stable.

**[Audio list pagination UX]** → Backend support `skip`/`limit` nhưng không có cursor-based pagination. Nếu data thay đổi giữa các page (thêm/xoá), có thể bị duplicate hoặc miss items. Chấp nhận cho MVP.

## Open Questions

_None — tất cả decisions đã được confirm trong brainstorm session._
