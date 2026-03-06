# voice-cloning-ui Specification

## Purpose
TBD - created by archiving change voice-clone-tts-ui. Update Purpose after archive.
## Requirements
### Requirement: Clone voice Zod schema
The system SHALL provide a Zod validation schema at `src/features/voice-cloning/schemas/clone-voice.schema.ts` for the clone voice form. The schema SHALL validate:
- `name`: required string, min 1 character, max 100 characters
- `voiceId`: required string, min 1 character, max 100 characters, pattern `^[a-zA-Z0-9_-]+$` (alphanumeric, hyphens, underscores only)
- `file`: required File instance

The schema SHALL export a `CloneVoiceFormValues` type inferred from the schema.

#### Scenario: Valid form data
- **WHEN** the form is submitted with name "General Duy", voiceId "general_duy_001", and a valid audio file
- **THEN** validation passes and the form values match `CloneVoiceFormValues` type

#### Scenario: Missing required fields
- **WHEN** the form is submitted with empty `name` or `voiceId`
- **THEN** validation fails with appropriate error messages

#### Scenario: Invalid voiceId format
- **WHEN** `voiceId` contains spaces or special characters like "my voice @1"
- **THEN** validation fails with a format error message

### Requirement: SystemVoiceCard component
The system SHALL provide a `SystemVoiceCard` component at `src/features/voice-cloning/components/system-voice-card.tsx` that displays a system voice. The card SHALL show:
- Voice name (`voice_name`)
- Description list (joined with commas or as chips)
- A "System" badge (shadcn Badge)
- No delete action (system voices cannot be deleted)

#### Scenario: Render system voice card
- **WHEN** `SystemVoiceCard` is rendered with a `SystemVoiceRecord`
- **THEN** the card displays the voice name, description items, and a "System" badge

#### Scenario: System voice with no description
- **WHEN** a `SystemVoiceRecord` has an empty `description` array
- **THEN** the card renders without description text but still shows name and badge

### Requirement: VoiceCard component for cloned voices
The system SHALL provide a `VoiceCard` component at `src/features/voice-cloning/components/voice-card.tsx` that displays a cloned voice. The card SHALL show:
- Voice name
- Language (if available, otherwise "Unknown")
- Created date (formatted)
- A "Cloned" badge
- A play button to preview source audio (using WaveformPlayer with `source_audio_signed_url` from voice detail)
- A delete button that opens ConfirmDeleteDialog

#### Scenario: Render cloned voice card
- **WHEN** `VoiceCard` is rendered with a `VoiceRecord`
- **THEN** the card displays the voice name, language, formatted created date, and "Cloned" badge

#### Scenario: Play source audio preview
- **WHEN** the user clicks the play button on a VoiceCard
- **THEN** the card expands to show a WaveformPlayer loaded with the voice's `source_audio_signed_url`

#### Scenario: Delete cloned voice
- **WHEN** the user clicks the delete button on a VoiceCard
- **THEN** a ConfirmDeleteDialog opens asking to confirm deletion

#### Scenario: Confirm delete voice
- **WHEN** the user confirms deletion in the dialog
- **THEN** `useDeleteVoice` mutation is triggered, the dialog shows loading state, and on success the voice list refreshes

### Requirement: CloneVoiceSheet component
The system SHALL provide a `CloneVoiceSheet` component at `src/features/voice-cloning/components/clone-voice-sheet.tsx` that renders a shadcn Sheet (slide-in panel from the right) containing a form to clone a new voice. The form SHALL include:
- `FileDropzone` with `preset="audio"` for audio file upload
- Input field for voice name (with label)
- Input field for voice ID (with label and format hint)
- Submit button "Clone Voice"
- Form validation using react-hook-form + `cloneVoiceSchema`

#### Scenario: Open clone voice sheet
- **WHEN** the user clicks the "Clone Voice" button on the Voice Cloning page
- **THEN** a Sheet slides in from the right with the clone voice form

#### Scenario: Submit clone voice form
- **WHEN** the user fills in all fields (file, name, voiceId) and clicks "Clone Voice"
- **THEN** `useCloneVoice` mutation is triggered with the form data, the submit button shows loading state

#### Scenario: Clone success
- **WHEN** the clone mutation succeeds
- **THEN** the Sheet closes, the form resets, and the voice list refreshes (cache invalidation)

#### Scenario: Clone failure
- **WHEN** the clone mutation fails (e.g., backend validation error)
- **THEN** the error message is displayed in the form and the Sheet stays open

#### Scenario: Close sheet without submitting
- **WHEN** the user closes the Sheet (click outside, press Escape, or click close button)
- **THEN** the Sheet closes and form state is preserved until next open

### Requirement: VoiceCloningPage layout
The system SHALL rewrite the `VoiceCloningPage` component at `src/features/voice-cloning/components/voice-cloning-page.tsx` to display the full voice library. The page SHALL contain:
- Page header with title "Voice Cloning" and a "Clone Voice" button (primary) that opens CloneVoiceSheet
- "System Voices" section with a grid of SystemVoiceCards
- "My Cloned Voices" section with a grid of VoiceCards and a count badge
- Loading state: skeleton cards while `useVoices` is fetching
- Empty state for cloned voices: message "No cloned voices yet" with CTA to clone first voice
- Error state: error message with retry button

#### Scenario: Page loads with voices
- **WHEN** an authenticated user navigates to `/voice-cloning` and `useVoices` returns data
- **THEN** the page displays system voices grid and cloned voices grid with actual voice data

#### Scenario: Page loading state
- **WHEN** `useVoices` is in loading state
- **THEN** skeleton cards are displayed in both sections

#### Scenario: No cloned voices
- **WHEN** `useVoices` returns data with `cloned_voices` as empty array
- **THEN** the cloned voices section shows "No cloned voices yet" with a button to open the clone sheet

#### Scenario: API error
- **WHEN** `useVoices` returns an error
- **THEN** an error message is displayed with a "Retry" button that refetches the voice list

#### Scenario: Voice grid responsive layout
- **WHEN** the page is viewed on desktop (>= 1024px)
- **THEN** voice cards display in a 3-column grid
- **WHEN** the page is viewed on tablet (>= 768px, < 1024px)
- **THEN** voice cards display in a 2-column grid
- **WHEN** the page is viewed on mobile (< 768px)
- **THEN** voice cards stack in a single column

