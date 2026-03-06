# tts-ui Specification

## Purpose
TBD - created by archiving change voice-clone-tts-ui. Update Purpose after archive.
## Requirements
### Requirement: TTS generate Zod schema
The system SHALL provide a Zod validation schema at `src/features/tts/schemas/tts-generate.schema.ts` for the TTS generate form. The schema SHALL validate:
- `text`: required string, min 1 character, max 5000 characters
- `voice_id`: required string, min 1 character
- `speed`: optional number, min 0.5, max 2.0, default 1.0
- `volume`: optional number, min 0.1, max 1.0, default 1.0
- `pitch`: optional number, min -12, max 12, default 0
- `emotion`: optional string, one of `"happy"`, `"sad"`, `"angry"`, `"fearful"`, `"disgusted"`, `"surprised"`, or `undefined`

The schema SHALL export a `TtsGenerateFormValues` type inferred from the schema.

#### Scenario: Valid form with required fields only
- **WHEN** the form is submitted with `text` "Hello world" and `voice_id` "voice_001"
- **THEN** validation passes with defaults applied for optional fields

#### Scenario: Valid form with all fields
- **WHEN** the form is submitted with all fields including speed 1.5, volume 0.8, pitch 2, emotion "happy"
- **THEN** validation passes with all values preserved

#### Scenario: Text too long
- **WHEN** `text` exceeds 5000 characters
- **THEN** validation fails with a max length error

#### Scenario: Speed out of range
- **WHEN** `speed` is set to 3.0
- **THEN** validation fails with a range error

### Requirement: VoiceSelector component
The system SHALL provide a `VoiceSelector` component at `src/features/tts/components/voice-selector.tsx` that renders a shadcn `Select` with grouped options. The component SHALL use `useVoices` hook from `@/features/voice-cloning` to fetch available voices.

The select SHALL display two groups:
- "System Voices" group: each option shows `voice_name`
- "My Cloned Voices" group: each option shows `name` with "(Cloned)" suffix

The component SHALL accept `value`, `onValueChange`, and `disabled` props to integrate with react-hook-form.

#### Scenario: Render with voices loaded
- **WHEN** `VoiceSelector` is rendered and `useVoices` returns data
- **THEN** a Select dropdown shows two groups with system and cloned voices

#### Scenario: Loading state
- **WHEN** `useVoices` is loading
- **THEN** the Select is disabled and shows "Loading voices..." as placeholder

#### Scenario: No cloned voices
- **WHEN** `useVoices` returns data with empty `cloned_voices`
- **THEN** only the "System Voices" group is displayed

#### Scenario: Select a voice
- **WHEN** the user selects a voice from the dropdown
- **THEN** `onValueChange` is called with the selected `voice_id`

### Requirement: TtsComposeForm component
The system SHALL provide a `TtsComposeForm` component at `src/features/tts/components/tts-compose-form.tsx` that contains the TTS generation form. The form SHALL include:
- `VoiceSelector` for voice selection
- shadcn `Textarea` for text input with character count (current/max)
- Collapsible "Advanced Options" section containing:
  - Speed slider (0.5 - 2.0, step 0.1)
  - Volume slider (0.1 - 1.0, step 0.1)
  - Pitch slider (-12 - 12, step 1)
  - Emotion select (optional, with "None" option)
- "Generate Audio" primary button
- Form validation using react-hook-form + `ttsGenerateSchema`

The form SHALL use `useGenerateAudio` mutation hook for submission.

#### Scenario: Submit generate form
- **WHEN** the user fills in text and selects a voice, then clicks "Generate Audio"
- **THEN** `useGenerateAudio` mutation is triggered with the form values

#### Scenario: Generate loading state
- **WHEN** the mutation is pending
- **THEN** the "Generate Audio" button shows a spinner and is disabled, form inputs are disabled

#### Scenario: Generate success
- **WHEN** the mutation succeeds with `GenerateAudioResponse`
- **THEN** the `onGenerateSuccess` callback is called with the response (containing `signed_url` for the result player)

#### Scenario: Generate failure
- **WHEN** the mutation fails
- **THEN** an error message is displayed below the form

#### Scenario: Character count
- **WHEN** the user types in the textarea
- **THEN** a live character count updates showing "123 / 5000"

#### Scenario: Advanced options collapsed by default
- **WHEN** the form first renders
- **THEN** the advanced options section (speed, volume, pitch, emotion) is collapsed

#### Scenario: Expand advanced options
- **WHEN** the user clicks "Advanced Options"
- **THEN** the slider controls and emotion select become visible

### Requirement: TtsResultPlayer component
The system SHALL provide a `TtsResultPlayer` component at `src/features/tts/components/tts-result-player.tsx` that displays the most recently generated audio using `WaveformPlayer`. The component SHALL accept a `signedUrl` prop and render inline below the compose form.

#### Scenario: Show result after generate
- **WHEN** `TtsResultPlayer` is rendered with a valid `signedUrl`
- **THEN** a `WaveformPlayer` is displayed with the generated audio loaded

#### Scenario: No result yet
- **WHEN** `signedUrl` is `undefined` or empty
- **THEN** the component renders nothing (hidden)

#### Scenario: New generation replaces previous
- **WHEN** a new audio is generated while a previous result is displayed
- **THEN** the WaveformPlayer reloads with the new `signedUrl`

### Requirement: AudioHistoryItem component
The system SHALL provide an `AudioHistoryItem` component at `src/features/tts/components/audio-history-item.tsx` that displays a single audio record in the history list. The item SHALL show:
- Source text (truncated to 2 lines with ellipsis)
- Voice ID
- Duration formatted as `mm:ss`
- Created date (relative or formatted)
- A compact WaveformPlayer for playback
- A delete button (Lucide `Trash2` icon)

#### Scenario: Render audio history item
- **WHEN** `AudioHistoryItem` is rendered with an `AudioFileRecord` and `signedUrl`
- **THEN** the item displays truncated text, voice ID, formatted duration, date, compact waveform player, and delete button

#### Scenario: Play audio from history
- **WHEN** the user clicks play on an AudioHistoryItem
- **THEN** the compact WaveformPlayer plays the audio from the signed URL

#### Scenario: Delete audio from history
- **WHEN** the user clicks the delete button
- **THEN** a ConfirmDeleteDialog opens asking to confirm deletion

#### Scenario: Confirm delete audio
- **WHEN** the user confirms deletion
- **THEN** `useDeleteAudio` mutation is triggered and on success the audio list refreshes

### Requirement: AudioHistoryList component
The system SHALL provide an `AudioHistoryList` component at `src/features/tts/components/audio-history-list.tsx` that displays a scrollable list of `AudioHistoryItem` components. The list SHALL use `useAudioList` hook with default pagination (skip=0, limit=20).

#### Scenario: Render audio history
- **WHEN** `AudioHistoryList` is rendered and `useAudioList` returns data
- **THEN** a scrollable list of AudioHistoryItems is displayed, ordered by most recent first

#### Scenario: Loading state
- **WHEN** `useAudioList` is loading
- **THEN** skeleton placeholders are displayed

#### Scenario: Empty state
- **WHEN** `useAudioList` returns empty items
- **THEN** a message "No audio generated yet" is displayed with a description encouraging the user to generate their first audio

#### Scenario: Load more
- **WHEN** the list has more items than the current page (total > skip + limit)
- **THEN** a "Load more" button is displayed at the bottom of the list

#### Scenario: Error state
- **WHEN** `useAudioList` returns an error
- **THEN** an error message with a "Retry" button is displayed

### Requirement: TtsPage layout
The system SHALL rewrite the `TtsPage` component at `src/features/tts/components/tts-page.tsx` to display the full TTS interface. The page layout SHALL be:
- Page header with title "Text to Speech"
- Desktop (>= 1024px): 2-column layout — left column (compose form + result player, sticky top), right column (audio history, scrollable)
- Mobile (< 1024px): single column — compose form + result player on top, audio history below

#### Scenario: Desktop layout
- **WHEN** the page is viewed on desktop (>= 1024px)
- **THEN** the compose panel is on the left (sticky), audio history is on the right (scrollable), both visible simultaneously

#### Scenario: Mobile layout
- **WHEN** the page is viewed on mobile (< 1024px)
- **THEN** the compose panel stacks on top and audio history stacks below in a single column

#### Scenario: Generate and see result
- **WHEN** the user generates audio via the compose form
- **THEN** the TtsResultPlayer appears below the form with the new audio, and the audio history list refreshes to include the new entry

#### Scenario: Page initial load
- **WHEN** an authenticated user navigates to `/tts`
- **THEN** the compose form is ready with voices loaded, and audio history shows previous entries (or empty state)

