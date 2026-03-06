## 1. Setup — Dependencies & shadcn Components

- [x] 1.1 Install npm packages: `wavesurfer.js`, `@wavesurfer/react`, `react-dropzone`
- [x] 1.2 Add shadcn/ui components via CLI: `select`, `textarea`, `slider`, `alert-dialog`, `badge`, `tabs`, `popover`, `command`

## 2. Shared Components

- [x] 2.1 Create `src/components/common/waveform-player.tsx` — WaveformPlayer component wrapping `@wavesurfer/react` with play/pause, seek, time display, theme colors (amber progress, neutral-700 wave), default and compact variants, loading skeleton, cleanup on unmount
- [x] 2.2 Create `src/components/common/file-dropzone.tsx` — FileDropzone component wrapping `react-dropzone` with drag & drop zone, file info display, clear button, disabled state, audio preset defaults
- [x] 2.3 Create `src/components/common/confirm-delete-dialog.tsx` — ConfirmDeleteDialog component wrapping shadcn AlertDialog with configurable title/description, loading state, default text

## 3. Voice Cloning — Schema & Components

- [ ] 3.1 Create `src/features/voice-cloning/schemas/clone-voice.schema.ts` — Zod schema for clone voice form (name, voiceId, file validation)
- [ ] 3.2 Create `src/features/voice-cloning/components/system-voice-card.tsx` — SystemVoiceCard displaying voice_name, description, "System" badge
- [ ] 3.3 Create `src/features/voice-cloning/components/voice-card.tsx` — VoiceCard for cloned voices with name, language, date, "Cloned" badge, play source audio (WaveformPlayer), delete button (ConfirmDeleteDialog)
- [ ] 3.4 Create `src/features/voice-cloning/components/clone-voice-sheet.tsx` — CloneVoiceSheet with Sheet panel, FileDropzone (audio preset), name + voiceId inputs, react-hook-form + zod validation, useCloneVoice mutation, success close + error display
- [ ] 3.5 Rewrite `src/features/voice-cloning/components/voice-cloning-page.tsx` — VoiceCloningPage with page header + Clone button, System Voices grid, Cloned Voices grid with count, skeleton loading, empty state, error state, responsive grid (3-col desktop, 2-col tablet, 1-col mobile)
- [ ] 3.6 Update `src/features/voice-cloning/index.ts` — re-export new components and schema

## 4. TTS — Schema & Components

- [ ] 4.1 Create `src/features/tts/schemas/tts-generate.schema.ts` — Zod schema for TTS generate form (text, voice_id, speed, volume, pitch, emotion validation)
- [ ] 4.2 Create `src/features/tts/components/voice-selector.tsx` — VoiceSelector with shadcn Select, grouped options (System Voices / My Cloned Voices), useVoices integration, loading state
- [ ] 4.3 Create `src/features/tts/components/tts-compose-form.tsx` — TtsComposeForm with VoiceSelector, Textarea + character count, collapsible Advanced Options (speed/volume/pitch sliders, emotion select), Generate button, react-hook-form + zod, useGenerateAudio mutation
- [ ] 4.4 Create `src/features/tts/components/tts-result-player.tsx` — TtsResultPlayer with inline WaveformPlayer for generated audio
- [ ] 4.5 Create `src/features/tts/components/audio-history-item.tsx` — AudioHistoryItem with truncated text, voice ID, duration, date, compact WaveformPlayer, delete button
- [ ] 4.6 Create `src/features/tts/components/audio-history-list.tsx` — AudioHistoryList with scrollable list, useAudioList hook, skeleton loading, empty state, load more button, error state
- [ ] 4.7 Rewrite `src/features/tts/components/tts-page.tsx` — TtsPage with 2-column layout (sticky compose left, scrollable history right), responsive single column on mobile, page header
- [ ] 4.8 Update `src/features/tts/index.ts` — re-export new components and schema

## 5. Sidebar Navigation

- [ ] 5.1 Update `src/widgets/sidebar/components/nav-main.tsx` — add "Text to Speech" nav item with `AudioLines` icon, path `/tts`

