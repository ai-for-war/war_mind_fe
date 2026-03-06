## Why

Backend đã triển khai xong 10 endpoints cho voice cloning (5 endpoints) và text-to-speech (4 endpoints sync + 1 streaming). Frontend cần API service layer, types, và React Query hooks để kết nối với các endpoints này — cho phép user clone voice từ audio file, quản lý voices, generate audio từ text, và quản lý audio đã tạo.

## What Changes

- Thêm feature `voice-cloning`: types, API functions, React Query hooks cho voice CRUD (clone, list, detail, delete)
- Thêm feature `tts`: types, API functions, React Query hooks cho TTS generate (sync) và audio management (list, detail, delete)
- Thêm shared `useAudioPlayer` hook — quản lý phát audio từ URL hoặc Blob (dùng chung cho cả 2 features)
- Thêm route `/tts` cho TTS page
- Cập nhật router — thêm TTS route và redirect mặc định

## Capabilities

### New Capabilities

- `voice-cloning-api`: Feature module gồm TypeScript types (VoiceRecord, SystemVoiceRecord, VoiceListResponse, VoiceDetailResponse, CloneVoiceResponse), API functions (cloneVoice multipart upload, listVoices, getVoice, deleteVoice), React Query hooks (useVoices, useVoiceDetail, useCloneVoice, useDeleteVoice). Tương tác với backend endpoints `POST /voices/clone`, `GET /voices`, `GET /voices/{voice_id}`, `DELETE /voices/{voice_id}`.
- `tts-api`: Feature module gồm TypeScript types (AudioFileRecord, GenerateAudioRequest, GenerateAudioResponse, AudioListResponse, AudioDetailResponse), API functions (generateAudio, listAudio, getAudio, deleteAudio), React Query hooks (useGenerateAudio, useAudioList, useAudioDetail, useDeleteAudio). Tương tác với backend endpoints `POST /tts/generate`, `GET /tts/audio`, `GET /tts/audio/{audio_id}`, `DELETE /tts/audio/{audio_id}`.
- `audio-player`: Shared React hook `useAudioPlayer` quản lý HTML Audio element — play/pause/stop, track currentTime/duration, hỗ trợ phát từ URL (signed URL) và Blob. Dùng chung cho voice-cloning và tts features.

### Modified Capabilities

- `auth-routing`: Thêm route `/tts` vào ProtectedRoute, cập nhật default redirect từ `/voice-cloning` sang phù hợp.

## Impact

- **New files**: ~15 files across `src/features/voice-cloning/` (types, api, hooks, index), `src/features/tts/` (types, api, hooks, components, index), `src/hooks/use-audio-player.ts`
- **Modified files**: `src/app/router.tsx` (thêm TTS route)
- **Dependencies consumed**: `apiClient` (existing), `@tanstack/react-query` (existing), `react-hook-form` + `zod` (existing, cho form validation)
- **No new packages needed** — tất cả dependencies đã có sẵn
- **Backend endpoints consumed**: 4 voice endpoints (`POST /voices/clone`, `GET /voices`, `GET /voices/{id}`, `DELETE /voices/{id}`), 4 TTS endpoints (`POST /tts/generate`, `GET /tts/audio`, `GET /tts/audio/{id}`, `DELETE /tts/audio/{id}`)
- **Cross-feature dependency**: TTS feature import `useVoices` hook từ voice-cloning feature để lấy danh sách voices (share React Query cache)
- **First multipart upload** trong project — `cloneVoice` dùng FormData thay vì JSON
