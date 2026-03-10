# voice-cloning-api Specification

## Purpose
TBD - created by archiving change voice-clone-and-tts. Update Purpose after archive.
## Requirements
### Requirement: Voice TypeScript types
The system SHALL define TypeScript interfaces at `src/features/voice-cloning/types/voice.types.ts` matching backend voice schemas:
- `VoiceRecord`: `{ id: string, voice_id: string, name: string, voice_type: string, organization_id: string, created_by: string, source_audio_url: string, source_audio_public_id: string, language: string | null, created_at: string }`
- `SystemVoiceRecord`: `{ voice_id: string, voice_name: string, description: string[], created_time: string | null }`
- `VoiceListResponse`: `{ system_voices: SystemVoiceRecord[], cloned_voices: VoiceRecord[], total_cloned: number }`
- `VoiceDetailResponse`: `{ voice: VoiceRecord, source_audio_signed_url: string | null }`
- `CloneVoiceResponse`: `{ voice: VoiceRecord, preview_url: string | null }`

#### Scenario: Types match backend voice contract
- **WHEN** backend returns a voice list response with `system_voices`, `cloned_voices`, and `total_cloned`
- **THEN** the response is assignable to `VoiceListResponse` without type errors

#### Scenario: Types match backend clone response
- **WHEN** backend returns a clone response with `voice` (VoiceRecord) and optional `preview_url`
- **THEN** the response is assignable to `CloneVoiceResponse` without type errors

### Requirement: Clone voice API function
The system SHALL provide a `cloneVoice` function in `src/features/voice-cloning/api/voices-api.ts` that sends `POST /voices/clone` as `multipart/form-data` with three fields: `file` (File), `name` (string), and `voice_id` (string). The function SHALL return a `Promise<CloneVoiceResponse>`.

The function SHALL construct a `FormData` instance and pass it as the request body. Axios SHALL auto-detect FormData and set the `Content-Type: multipart/form-data` header with boundary — the function MUST NOT manually set `Content-Type`.

#### Scenario: Successful voice clone
- **WHEN** `cloneVoice(audioFile, "my-voice", "my_voice_id_001")` is called with a valid audio file
- **THEN** a POST multipart request is sent to `/voices/clone` with FormData containing `file`, `name`, and `voice_id` fields, and the resolved value is a `CloneVoiceResponse`

#### Scenario: Backend rejects invalid file format
- **WHEN** `cloneVoice` is called with a non-audio file (e.g., .txt)
- **THEN** the promise rejects with an Axios error containing the backend validation error

#### Scenario: Backend rejects oversized file
- **WHEN** `cloneVoice` is called with a file exceeding 20MB
- **THEN** the promise rejects with an Axios error containing the backend validation error

### Requirement: List voices API function
The system SHALL provide a `listVoices` function that sends `GET /voices` and returns a `Promise<VoiceListResponse>` containing both system voices and cloned voices for the current organization.

#### Scenario: Successful voice listing
- **WHEN** `listVoices()` is called
- **THEN** a GET request is sent to `/voices` and the resolved value is a `VoiceListResponse` with `system_voices`, `cloned_voices`, and `total_cloned`

### Requirement: Get voice detail API function
The system SHALL provide a `getVoice` function that sends `GET /voices/{voice_id}` and returns a `Promise<VoiceDetailResponse>` containing voice metadata and an optional signed URL for the source audio.

#### Scenario: Successful voice detail fetch
- **WHEN** `getVoice("my_voice_id_001")` is called
- **THEN** a GET request is sent to `/voices/my_voice_id_001` and the resolved value is a `VoiceDetailResponse`

#### Scenario: Voice not found
- **WHEN** `getVoice("nonexistent")` is called
- **THEN** the promise rejects with an Axios error (404)

### Requirement: Delete voice API function
The system SHALL provide a `deleteVoice` function that sends `DELETE /voices/{voice_id}` and returns a `Promise<void>`. The backend performs soft-delete with 3-tier access control (owner/org admin/super admin).

#### Scenario: Successful voice deletion
- **WHEN** `deleteVoice("my_voice_id_001")` is called by the voice owner
- **THEN** a DELETE request is sent to `/voices/my_voice_id_001` and the promise resolves with no content (204)

#### Scenario: Permission denied
- **WHEN** `deleteVoice` is called by a user who is not the owner, org admin, or super admin
- **THEN** the promise rejects with an Axios error (403)

### Requirement: Voices API barrel export
The system SHALL provide an `voicesApi` object in `src/features/voice-cloning/api/voices-api.ts` that exports all voice API functions: `cloneVoice`, `listVoices`, `getVoice`, `deleteVoice`.

#### Scenario: Import voices API
- **WHEN** a consumer imports `voicesApi` from `@/features/voice-cloning/api/voices-api`
- **THEN** `cloneVoice`, `listVoices`, `getVoice`, and `deleteVoice` are all available as methods

### Requirement: useVoices query hook
The system SHALL provide a `useVoices` hook at `src/features/voice-cloning/hooks/use-voices.ts` that uses React Query `useQuery` to fetch and cache the voice list. The query key SHALL be `["voices"]`.

#### Scenario: Initial fetch
- **WHEN** a component mounts and calls `useVoices()`
- **THEN** the hook triggers `voicesApi.listVoices()` and returns `{ data, isLoading, error }` from React Query

#### Scenario: Cache hit
- **WHEN** multiple components call `useVoices()` within the cache stale time
- **THEN** React Query returns cached data without making additional API calls

### Requirement: useVoiceDetail query hook
The system SHALL provide a `useVoiceDetail` hook at `src/features/voice-cloning/hooks/use-voice-detail.ts` that uses React Query `useQuery` to fetch voice detail. The query key SHALL be `["voices", voiceId]`. The query SHALL be disabled when `voiceId` is undefined or empty.

#### Scenario: Fetch voice detail
- **WHEN** `useVoiceDetail("my_voice_id_001")` is called
- **THEN** the hook triggers `voicesApi.getVoice("my_voice_id_001")` and returns the voice detail response

#### Scenario: Disabled when no voiceId
- **WHEN** `useVoiceDetail(undefined)` is called
- **THEN** the query is disabled and no API call is made

### Requirement: useCloneVoice mutation hook
The system SHALL provide a `useCloneVoice` hook at `src/features/voice-cloning/hooks/use-clone-voice.ts` that uses React Query `useMutation` to clone a voice. On success, the mutation SHALL invalidate the `["voices"]` query key to refresh the voice list.

#### Scenario: Successful clone and cache invalidation
- **WHEN** the mutation succeeds after calling `cloneVoice(file, name, voiceId)`
- **THEN** the `["voices"]` query cache is invalidated, triggering a re-fetch of the voice list

#### Scenario: Clone failure
- **WHEN** the mutation fails (e.g., backend validation error)
- **THEN** the error is available via `mutation.error` and the voice list cache is NOT invalidated

### Requirement: useDeleteVoice mutation hook
The system SHALL provide a `useDeleteVoice` hook at `src/features/voice-cloning/hooks/use-delete-voice.ts` that uses React Query `useMutation` to delete a cloned voice. On success, the mutation SHALL invalidate the `["voices"]` query key.

#### Scenario: Successful deletion and cache invalidation
- **WHEN** the mutation succeeds after calling `deleteVoice(voiceId)`
- **THEN** the `["voices"]` query cache is invalidated, triggering a re-fetch of the voice list

### Requirement: Voice cloning feature barrel export
The system SHALL provide an `index.ts` barrel file at `src/features/voice-cloning/index.ts` that re-exports: `voicesApi`, all voice types, `useVoices`, `useVoiceDetail`, `useCloneVoice`, `useDeleteVoice`, and `VoiceCloningPage`.

#### Scenario: Import from voice-cloning barrel
- **WHEN** a consumer imports from `@/features/voice-cloning`
- **THEN** all voice API functions, types, hooks, and the page component are available

