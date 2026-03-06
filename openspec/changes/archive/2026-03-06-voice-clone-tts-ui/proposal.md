## Why

Voice Cloning và TTS features đã có đầy đủ API layer (types, API functions, React Query hooks) nhưng cả 2 page (`VoiceCloningPage`, `TtsPage`) đều chỉ là placeholder trống. User chưa thể clone voice, quản lý voices, generate audio từ text, hay nghe lại audio đã tạo. Cần implement full UI để kết nối với backend endpoints đã sẵn sàng.

## What Changes

- Thêm shared `WaveformPlayer` component — wrap `@wavesurfer/react` + `wavesurfer.js` để hiển thị audio waveform với play/pause/seek, dùng chung cho cả Voice Cloning (preview source audio) và TTS (nghe audio đã generate)
- Thêm shared `FileDropzone` component — wrap `react-dropzone` với drag & drop UI, file validation display, style theo shadcn/dark theme, dùng cho voice clone upload
- Thêm shared `ConfirmDeleteDialog` component — wrap shadcn AlertDialog, confirm trước khi xóa voice hoặc audio
- Rewrite `VoiceCloningPage` — hiển thị System Voices grid + Cloned Voices grid, Clone Voice sheet (upload audio + form), voice cards với waveform preview và delete
- Rewrite `TtsPage` — 2-column layout: Compose panel (voice selector, textarea, sliders speed/volume/pitch, emotion select, generate button, inline waveform player) + Audio History panel (scrollable list với mini players, delete)
- Thêm TTS nav item vào sidebar navigation
- Install npm packages: `wavesurfer.js`, `@wavesurfer/react`, `react-dropzone`
- Add shadcn/ui components: `select`, `textarea`, `slider`, `alert-dialog`, `badge`, `tabs`, `popover`, `command`

## Capabilities

### New Capabilities

- `waveform-player`: Shared React component wrapping `@wavesurfer/react` cho audio waveform visualization với play/pause/seek/stop, time display, loading state. Hỗ trợ phát từ URL (signed URL) và customizable waveform colors theo theme.
- `file-dropzone`: Shared React component wrapping `react-dropzone` cho drag & drop file upload. Hiển thị drop zone, file info (name, size, type), validation errors, preview. Style theo shadcn/dark theme.
- `confirm-delete-dialog`: Shared React component wrapping shadcn AlertDialog cho confirm trước khi xóa resources. Configurable title, description, và destructive action.
- `voice-cloning-ui`: UI components cho Voice Cloning page — VoiceCard, SystemVoiceCard, CloneVoiceSheet (form + FileDropzone), VoiceCloningPage layout (system voices grid + cloned voices grid + empty states + loading skeletons). Kết nối với `useVoices`, `useCloneVoice`, `useDeleteVoice`, `useVoiceDetail` hooks đã có.
- `tts-ui`: UI components cho TTS page — VoiceSelector (grouped select dùng `useVoices` từ voice-cloning), TtsComposeForm (textarea + sliders + emotion + generate button), TtsResultPlayer (inline waveform player), AudioHistoryItem, AudioHistoryList, TtsPage layout (2-column compose + history). Kết nối với `useGenerateAudio`, `useAudioList`, `useDeleteAudio` hooks đã có.

### Modified Capabilities

- `sidebar-navigation`: Thêm nav item "Text to Speech" với icon Audio vào sidebar, link tới `/tts`.

## Impact

- **New npm packages**: `wavesurfer.js`, `@wavesurfer/react`, `react-dropzone` (3 packages)
- **New shadcn/ui components**: `select`, `textarea`, `slider`, `alert-dialog`, `badge`, `tabs`, `popover`, `command` (~8 components via CLI)
- **New shared components**: 3 files trong `src/components/common/` (waveform-player, file-dropzone, confirm-delete-dialog)
- **New feature components**: ~5 files trong `src/features/voice-cloning/components/`, ~6 files trong `src/features/tts/components/`
- **New schemas**: 2 files Zod validation (`clone-voice.schema.ts`, `tts-generate.schema.ts`)
- **Modified files**: `voice-cloning-page.tsx` (rewrite), `tts-page.tsx` (rewrite), sidebar `nav-main.tsx` (thêm TTS item)
- **Dependencies consumed**: Tất cả hooks và API functions đã implement từ change `voice-clone-and-tts` trước đó. Cross-feature dependency: TTS imports `useVoices` từ voice-cloning (đã established).
- **No backend changes** — chỉ frontend UI layer
