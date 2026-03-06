## ADDED Requirements

### Requirement: TTS TypeScript types
The system SHALL define TypeScript interfaces at `src/features/tts/types/tts.types.ts` matching backend TTS schemas:
- `AudioFileRecord`: `{ id: string, organization_id: string, created_by: string, voice_id: string, source_text: string, audio_url: string, audio_public_id: string, duration_ms: number, size_bytes: number, format: string, created_at: string }`
- `GenerateAudioRequest`: `{ text: string, voice_id: string, speed?: number, volume?: number, pitch?: number, emotion?: string }`
- `GenerateAudioResponse`: `{ audio: AudioFileRecord, signed_url: string }`
- `AudioListResponse`: `{ items: AudioFileRecord[], total: number, skip: number, limit: number }`
- `AudioDetailResponse`: `{ audio: AudioFileRecord, signed_url: string }`

#### Scenario: Types match backend TTS contract
- **WHEN** backend returns a generate audio response with `audio` (AudioFileRecord) and `signed_url`
- **THEN** the response is assignable to `GenerateAudioResponse` without type errors

#### Scenario: Types match backend audio list contract
- **WHEN** backend returns a paginated audio list with `items`, `total`, `skip`, and `limit`
- **THEN** the response is assignable to `AudioListResponse` without type errors

### Requirement: Generate audio API function
The system SHALL provide a `generateAudio` function in `src/features/tts/api/tts-api.ts` that sends `POST /tts/generate` with a JSON `GenerateAudioRequest` body and returns a `Promise<GenerateAudioResponse>`. This is the synchronous TTS generation endpoint.

#### Scenario: Successful audio generation
- **WHEN** `generateAudio({ text: "Hello world", voice_id: "voice_001" })` is called
- **THEN** a POST request is sent to `/tts/generate` with JSON body and the resolved value is a `GenerateAudioResponse` containing audio metadata and a signed URL

#### Scenario: Generation with optional parameters
- **WHEN** `generateAudio({ text: "Hello", voice_id: "voice_001", speed: 1.5, volume: 0.8, pitch: 2, emotion: "happy" })` is called
- **THEN** all optional parameters are included in the JSON request body

#### Scenario: Invalid voice ID
- **WHEN** `generateAudio` is called with a `voice_id` that does not exist
- **THEN** the promise rejects with an Axios error from the backend

#### Scenario: Empty text
- **WHEN** `generateAudio` is called with empty `text`
- **THEN** the promise rejects with an Axios error (backend validation: min_length=1)

### Requirement: List audio API function
The system SHALL provide a `listAudio` function that sends `GET /tts/audio` with query parameters `skip` (default 0) and `limit` (default 20) and returns a `Promise<AudioListResponse>`.

#### Scenario: Successful audio listing
- **WHEN** `listAudio(0, 20)` is called
- **THEN** a GET request is sent to `/tts/audio?skip=0&limit=20` and the resolved value is an `AudioListResponse`

#### Scenario: Pagination
- **WHEN** `listAudio(20, 10)` is called
- **THEN** a GET request is sent to `/tts/audio?skip=20&limit=10`

### Requirement: Get audio detail API function
The system SHALL provide a `getAudio` function that sends `GET /tts/audio/{audio_id}` and returns a `Promise<AudioDetailResponse>` containing audio metadata and a signed URL.

#### Scenario: Successful audio detail fetch
- **WHEN** `getAudio("audio_123")` is called
- **THEN** a GET request is sent to `/tts/audio/audio_123` and the resolved value is an `AudioDetailResponse`

#### Scenario: Audio not found
- **WHEN** `getAudio("nonexistent")` is called
- **THEN** the promise rejects with an Axios error (404)

### Requirement: Delete audio API function
The system SHALL provide a `deleteAudio` function that sends `DELETE /tts/audio/{audio_id}` and returns a `Promise<void>`. The backend performs soft-delete with 3-tier access control.

#### Scenario: Successful audio deletion
- **WHEN** `deleteAudio("audio_123")` is called by the audio owner
- **THEN** a DELETE request is sent to `/tts/audio/audio_123` and the promise resolves with no content (204)

#### Scenario: Permission denied
- **WHEN** `deleteAudio` is called by a user without sufficient access
- **THEN** the promise rejects with an Axios error (403)

### Requirement: TTS API barrel export
The system SHALL provide a `ttsApi` object in `src/features/tts/api/tts-api.ts` that exports all TTS API functions: `generateAudio`, `listAudio`, `getAudio`, `deleteAudio`.

#### Scenario: Import TTS API
- **WHEN** a consumer imports `ttsApi` from `@/features/tts/api/tts-api`
- **THEN** `generateAudio`, `listAudio`, `getAudio`, and `deleteAudio` are all available as methods

### Requirement: useGenerateAudio mutation hook
The system SHALL provide a `useGenerateAudio` hook at `src/features/tts/hooks/use-generate-audio.ts` that uses React Query `useMutation` to generate audio synchronously. On success, the mutation SHALL invalidate the `["tts", "audio"]` query key to refresh the audio list.

#### Scenario: Successful generation and cache invalidation
- **WHEN** the mutation succeeds after calling `generateAudio(request)`
- **THEN** the `["tts", "audio"]` query cache is invalidated and the mutation returns the `GenerateAudioResponse` with `audio` metadata and `signed_url`

#### Scenario: Generation failure
- **WHEN** the mutation fails
- **THEN** the error is available via `mutation.error` and the audio list cache is NOT invalidated

### Requirement: useAudioList query hook
The system SHALL provide a `useAudioList` hook at `src/features/tts/hooks/use-audio-list.ts` that uses React Query `useQuery` to fetch and cache the paginated audio list. The hook SHALL accept `skip` and `limit` parameters. The query key SHALL be `["tts", "audio", { skip, limit }]`.

#### Scenario: Initial fetch with defaults
- **WHEN** `useAudioList()` is called without arguments
- **THEN** the hook triggers `ttsApi.listAudio(0, 20)` with default pagination

#### Scenario: Fetch with custom pagination
- **WHEN** `useAudioList(20, 10)` is called
- **THEN** the hook triggers `ttsApi.listAudio(20, 10)` and the query key includes the pagination params

### Requirement: useAudioDetail query hook
The system SHALL provide a `useAudioDetail` hook at `src/features/tts/hooks/use-audio-detail.ts` that uses React Query `useQuery` to fetch audio detail. The query key SHALL be `["tts", "audio", audioId]`. The query SHALL be disabled when `audioId` is undefined or empty.

#### Scenario: Fetch audio detail
- **WHEN** `useAudioDetail("audio_123")` is called
- **THEN** the hook triggers `ttsApi.getAudio("audio_123")` and returns the audio detail response

#### Scenario: Disabled when no audioId
- **WHEN** `useAudioDetail(undefined)` is called
- **THEN** the query is disabled and no API call is made

### Requirement: useDeleteAudio mutation hook
The system SHALL provide a `useDeleteAudio` hook at `src/features/tts/hooks/use-delete-audio.ts` that uses React Query `useMutation` to delete generated audio. On success, the mutation SHALL invalidate the `["tts", "audio"]` query key.

#### Scenario: Successful deletion and cache invalidation
- **WHEN** the mutation succeeds after calling `deleteAudio(audioId)`
- **THEN** the `["tts", "audio"]` query cache is invalidated, triggering a re-fetch of the audio list

### Requirement: TTS feature uses voices from voice-cloning
The TTS feature SHALL import and use the `useVoices` hook from `@/features/voice-cloning` to retrieve the list of available voices (system + cloned). This shares the React Query cache — if voices are already loaded by the voice-cloning feature, TTS SHALL use the cached data without an additional API call.

#### Scenario: TTS page loads voices from shared cache
- **WHEN** a user navigates to the TTS page after visiting the voice-cloning page
- **THEN** the voice list is served from React Query cache without a new network request

#### Scenario: TTS page loads voices independently
- **WHEN** a user navigates directly to the TTS page
- **THEN** the `useVoices` hook fetches the voice list via `GET /voices`

### Requirement: TTS page component
The system SHALL provide a `TtsPage` component at `src/features/tts/components/tts-page.tsx` as a placeholder page for the TTS feature.

#### Scenario: TTS page renders
- **WHEN** an authenticated user navigates to `/tts`
- **THEN** the TTS page component is rendered inside the `MainLayout`

### Requirement: TTS feature barrel export
The system SHALL provide an `index.ts` barrel file at `src/features/tts/index.ts` that re-exports: `ttsApi`, all TTS types, `useGenerateAudio`, `useAudioList`, `useAudioDetail`, `useDeleteAudio`, and `TtsPage`.

#### Scenario: Import from TTS barrel
- **WHEN** a consumer imports from `@/features/tts`
- **THEN** all TTS API functions, types, hooks, and the page component are available
