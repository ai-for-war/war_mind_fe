## Context

Voice Cloning và TTS features đã có complete API layer (types, API functions, React Query hooks) được implement từ change `voice-clone-and-tts` trước đó. Cả 2 page hiện chỉ là placeholder (chỉ render `<h1>`). Project dùng Feature-First Architecture, React 19, Tailwind v4, shadcn/ui, dark mode first (neutral-950 background, amber primary). Existing form pattern: react-hook-form + zod (đã dùng ở Auth).

Existing specs cung cấp:
- `voice-cloning-api`: 4 API functions + 4 hooks + types
- `tts-api`: 4 API functions + 4 hooks + types + cross-feature `useVoices` import
- `audio-player`: `useAudioPlayer` hook spec (sẽ được thay thế bởi wavesurfer.js)

## Goals / Non-Goals

**Goals:**
- Implement full UI cho Voice Cloning page: voice library (system + cloned), clone voice flow (upload audio + form), voice management (preview source audio, delete)
- Implement full UI cho TTS page: compose form (voice select, text input, audio params), generate audio, inline result player, audio history list
- Tạo shared components: WaveformPlayer (wavesurfer.js), FileDropzone (react-dropzone), ConfirmDeleteDialog (shadcn AlertDialog)
- Thêm TTS vào sidebar navigation
- Responsive layout (desktop 2-column, mobile single column)

**Non-Goals:**
- Không implement TTS streaming (`POST /tts/stream` + Socket.IO) — sẽ làm change riêng
- Không implement voice preview (`POST /voices/{voice_id}/preview`)
- Không implement `useAudioPlayer` hook — wavesurfer.js thay thế hoàn toàn (bao gồm cả playback logic lẫn visualization)
- Không implement audio waveform caching hoặc offline playback
- Không implement bulk operations (multi-select delete)
- Không implement search/filter cho voice list hoặc audio history

## Decisions

### 1. Wavesurfer.js thay thế useAudioPlayer hook

**Choice**: Dùng `@wavesurfer/react` + `wavesurfer.js` cho tất cả audio playback, không implement `useAudioPlayer` hook.

**Rationale**: Wavesurfer.js đã bao gồm cả playback logic (play/pause/seek/stop, time tracking) lẫn waveform visualization. Hook `useWavesurfer` từ `@wavesurfer/react` trả về `isPlaying`, `currentTime`, `isReady` — trùng hoàn toàn với `useAudioPlayer` spec. Tránh duplicate logic và có thêm waveform visualization.

**Alternatives considered**:
- Implement `useAudioPlayer` + build custom player UI: Nhẹ hơn nhưng không có waveform, UX kém hấp dẫn hơn
- Dùng `react-h5-audio-player`: Có sẵn UI nhưng khó custom theo shadcn dark theme

**Trade-off**: Thêm ~60KB dependency (wavesurfer.js). Chấp nhận vì waveform visualization tạo UX premium cho audio-centric product.

### 2. react-dropzone cho file upload

**Choice**: Dùng `react-dropzone` (headless hook) + tự build UI theo shadcn style.

**Rationale**: `react-dropzone` là standard cho drag & drop file upload (10M+ downloads/tuần), chỉ cung cấp logic (không ép UI). Tự build upload zone UI với shadcn Card, Button, Lucide icons để nhất quán 100% với design system. Backend validate file (magic bytes, duration, size) nên frontend chỉ cần hiển thị thông tin file và errors.

**Alternatives considered**:
- `shadcn-dropzone` community component: Có sẵn UI nhưng là third-party, có thể outdated
- `uploadthing`: Backend storage solution, không cần — project đã có backend upload endpoint

### 3. Voice Cloning Page layout: Single page grid

**Choice**: Single page với 2 sections vertically stacked — System Voices grid + Cloned Voices grid. Clone voice trigger mở Sheet (slide-in panel).

**Rationale**: Voice list thường không quá lớn (system voices cố định, cloned voices ít). Single page grid đủ overview. Sheet cho clone flow giữ user ở context (không navigate away), tương tự pattern đã dùng trong project (shadcn Sheet có sẵn).

**Alternatives considered**:
- Master-detail layout (list + detail panel): Over-engineering cho list nhỏ
- Separate clone page: Unnecessary navigation

### 4. TTS Page layout: 2-column responsive

**Choice**: Desktop: Compose panel (left, sticky) + Audio History (right, scrollable). Mobile: Stack vertically (compose on top, history below).

**Rationale**: Compose panel là primary action — cần luôn visible. History panel là secondary reference. 2-column tận dụng desktop space, responsive stack cho mobile. Compose panel sticky để user có thể scroll history mà vẫn thấy form.

**Alternatives considered**:
- Tabs (Compose / History): Ẩn context, user phải switch
- Full-width single column: Waste horizontal space trên desktop

### 5. Voice Selector dùng shadcn Select với grouped options

**Choice**: Dùng shadcn `Select` component với `SelectGroup` để group "System Voices" và "My Cloned Voices".

**Rationale**: Voice list có 2 categories rõ ràng. Grouped select cho phép user phân biệt nhanh. Đơn giản hơn Combobox (không cần search khi list nhỏ). Nếu sau này voice list lớn, có thể upgrade lên Combobox.

**Alternatives considered**:
- Combobox (Command + Popover): Powerful nhưng overkill khi list nhỏ
- Radio group: Chiếm quá nhiều space

### 6. Zod schemas cho form validation

**Choice**: Tạo Zod schemas riêng cho clone voice form và TTS generate form.

**Rationale**: Tuân thủ pattern đã establish ở Auth (loginSchema). Frontend validate required fields, text length. File validation (format, size) để backend xử lý (backend validate magic bytes).

### 7. Waveform colors theo theme

**Choice**: Waveform dùng amber primary color (`hsl(var(--primary))`) cho played portion, neutral-700 cho unplayed portion.

**Rationale**: Nhất quán với app theme. Amber waveform trên neutral-950 background tạo contrast đẹp và brand identity.

## Risks / Trade-offs

**[Wavesurfer.js bundle size ~60KB]** → Chấp nhận cho UX premium. Có thể lazy-load component nếu cần optimize.

**[Signed URL expiry 2 giờ]** → Nếu user mở page lâu, waveform player có thể fail khi play. Mitigate: khi play fails, show error toast gợi ý refresh.

**[Cross-feature import: TTS imports useVoices từ voice-cloning]** → Đã established từ change trước. UI layer tiếp tục pattern này qua VoiceSelector component.

**[No pagination UI cho voice list]** → Voice list endpoint không có pagination (returns all). Chấp nhận cho MVP. Nếu voice count tăng, thêm virtualization sau.

**[Audio history pagination UX]** → Backend dùng skip/limit (offset-based). Nếu data thay đổi giữa pages, có thể duplicate/miss items. Chấp nhận cho MVP.

**[shadcn components chưa install]** → Cần add ~8 shadcn components qua CLI trước khi implement. Không risk — CLI process ổn định.
