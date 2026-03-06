## 1. Voice Cloning Types

- [x] 1.1 Create `src/features/voice-cloning/types/voice.types.ts` — `VoiceRecord`, `SystemVoiceRecord`, `VoiceListResponse`, `VoiceDetailResponse`, `CloneVoiceResponse` interfaces matching backend schemas

## 2. Voice Cloning API

- [x] 2.1 Create `src/features/voice-cloning/api/voices-api.ts` — `listVoices()` → GET `/voices`, returns `VoiceListResponse`
- [x] 2.2 Add `getVoice(voiceId)` → GET `/voices/{voice_id}`, returns `VoiceDetailResponse`
- [x] 2.3 Add `cloneVoice(file, name, voiceId)` → POST `/voices/clone` as multipart/form-data with `FormData`, returns `CloneVoiceResponse`
- [x] 2.4 Add `deleteVoice(voiceId)` → DELETE `/voices/{voice_id}`, returns `void`
- [x] 2.5 Export `voicesApi` object with all 4 functions

## 3. Voice Cloning Hooks

- [x] 3.1 Create `src/features/voice-cloning/hooks/use-voices.ts` — `useQuery` with key `["voices"]`, calls `voicesApi.listVoices()`
- [x] 3.2 Create `src/features/voice-cloning/hooks/use-voice-detail.ts` — `useQuery` with key `["voices", voiceId]`, disabled when voiceId is undefined/empty
- [x] 3.3 Create `src/features/voice-cloning/hooks/use-clone-voice.ts` — `useMutation` calling `voicesApi.cloneVoice()`, invalidates `["voices"]` on success
- [x] 3.4 Create `src/features/voice-cloning/hooks/use-delete-voice.ts` — `useMutation` calling `voicesApi.deleteVoice()`, invalidates `["voices"]` on success

## 4. Voice Cloning Barrel Export

- [x] 4.1 Update `src/features/voice-cloning/index.ts` — re-export `voicesApi`, all voice types, all hooks (`useVoices`, `useVoiceDetail`, `useCloneVoice`, `useDeleteVoice`), and `VoiceCloningPage`

## 5. TTS Types

- [x] 5.1 Create `src/features/tts/types/tts.types.ts` — `AudioFileRecord`, `GenerateAudioRequest`, `GenerateAudioResponse`, `AudioListResponse`, `AudioDetailResponse` interfaces matching backend schemas

## 6. TTS API

- [x] 6.1 Create `src/features/tts/api/tts-api.ts` — `generateAudio(request)` → POST `/tts/generate`, returns `GenerateAudioResponse`
- [x] 6.2 Add `listAudio(skip, limit)` → GET `/tts/audio?skip=X&limit=Y`, returns `AudioListResponse`
- [x] 6.3 Add `getAudio(audioId)` → GET `/tts/audio/{audio_id}`, returns `AudioDetailResponse`
- [x] 6.4 Add `deleteAudio(audioId)` → DELETE `/tts/audio/{audio_id}`, returns `void`
- [x] 6.5 Export `ttsApi` object with all 4 functions

## 7. TTS Hooks

- [ ] 7.1 Create `src/features/tts/hooks/use-generate-audio.ts` — `useMutation` calling `ttsApi.generateAudio()`, invalidates `["tts", "audio"]` on success
- [ ] 7.2 Create `src/features/tts/hooks/use-audio-list.ts` — `useQuery` with key `["tts", "audio", { skip, limit }]`, accepts `skip` and `limit` params with defaults (0, 20)
- [ ] 7.3 Create `src/features/tts/hooks/use-audio-detail.ts` — `useQuery` with key `["tts", "audio", audioId]`, disabled when audioId is undefined/empty
- [ ] 7.4 Create `src/features/tts/hooks/use-delete-audio.ts` — `useMutation` calling `ttsApi.deleteAudio()`, invalidates `["tts", "audio"]` on success

## 8. TTS Page & Barrel Export

- [ ] 8.1 Create `src/features/tts/components/tts-page.tsx` — placeholder TTS page component
- [ ] 8.2 Create `src/features/tts/index.ts` — re-export `ttsApi`, all TTS types, all hooks, and `TtsPage`

## 9. Shared Audio Player Hook

- [ ] 9.1 Create `src/hooks/use-audio-player.ts` — manage `HTMLAudioElement` instance with `useRef`
- [ ] 9.2 Implement state: `isPlaying`, `currentTime`, `duration`, `isLoading`
- [ ] 9.3 Implement actions: `playFromUrl(url)`, `playFromBlob(blob)`, `pause()`, `resume()`, `stop()`, `seek(time)`
- [ ] 9.4 Implement event listeners: `timeupdate`, `loadedmetadata`, `ended`, `playing`, `waiting`
- [ ] 9.5 Implement cleanup on unmount: pause audio, revoke object URLs, remove event listeners
- [ ] 9.6 Implement track replacement: stop current, cleanup old resources, start new track

## 10. Router Update

- [ ] 10.1 Update `src/app/router.tsx` — add protected route `/tts` rendering `TtsPage` inside `MainLayout`
