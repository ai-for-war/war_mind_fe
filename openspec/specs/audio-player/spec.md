# audio-player Specification

## Purpose
TBD - created by archiving change voice-clone-and-tts. Update Purpose after archive.
## Requirements
### Requirement: useAudioPlayer shared hook
The system SHALL provide a `useAudioPlayer` hook at `src/hooks/use-audio-player.ts` that manages an `HTMLAudioElement` for audio playback. The hook SHALL support playing audio from two sources: a URL string (for signed URLs from TTS generate and audio detail) and a Blob (for future use cases).

The hook SHALL return the following state and actions:
- State: `isPlaying: boolean`, `currentTime: number`, `duration: number`, `isLoading: boolean`
- Actions: `playFromUrl(url: string): void`, `playFromBlob(blob: Blob): void`, `pause(): void`, `resume(): void`, `stop(): void`, `seek(time: number): void`

#### Scenario: Play from URL
- **WHEN** `playFromUrl("https://example.com/audio.mp3")` is called
- **THEN** the hook sets the audio source to the URL, starts playback, and sets `isPlaying` to `true`

#### Scenario: Play from Blob
- **WHEN** `playFromBlob(audioBlob)` is called with an audio Blob
- **THEN** the hook creates an object URL from the Blob, sets it as the audio source, starts playback, and sets `isPlaying` to `true`

#### Scenario: Pause playback
- **WHEN** `pause()` is called while audio is playing
- **THEN** playback pauses, `isPlaying` is set to `false`, and `currentTime` retains the paused position

#### Scenario: Resume playback
- **WHEN** `resume()` is called while audio is paused
- **THEN** playback resumes from the paused position and `isPlaying` is set to `true`

#### Scenario: Stop playback
- **WHEN** `stop()` is called
- **THEN** playback stops, `currentTime` resets to `0`, and `isPlaying` is set to `false`

#### Scenario: Seek to position
- **WHEN** `seek(30)` is called
- **THEN** `currentTime` is set to `30` seconds (or to `duration` if `30` exceeds the track length)

#### Scenario: Track time updates
- **WHEN** audio is playing
- **THEN** `currentTime` updates continuously via the `timeupdate` event on the audio element

#### Scenario: Track duration
- **WHEN** audio metadata is loaded
- **THEN** `duration` is set to the total duration of the audio track via the `loadedmetadata` event

#### Scenario: Playback ends naturally
- **WHEN** audio reaches the end of the track
- **THEN** `isPlaying` is set to `false` and `currentTime` equals `duration`

#### Scenario: Loading state
- **WHEN** `playFromUrl` or `playFromBlob` is called and the audio is buffering
- **THEN** `isLoading` is `true` until the audio starts playing

### Requirement: Cleanup on unmount
The `useAudioPlayer` hook SHALL clean up resources when the component unmounts: pause the audio element, revoke any object URLs created from Blobs, and remove event listeners.

#### Scenario: Component unmounts while playing
- **WHEN** the component using `useAudioPlayer` unmounts while audio is playing
- **THEN** the audio is paused, any object URL is revoked via `URL.revokeObjectURL()`, and event listeners are removed

### Requirement: Replace current track
When a new `playFromUrl` or `playFromBlob` is called while audio is already playing, the hook SHALL stop the current playback, clean up previous resources (revoke old object URL if any), and start the new track.

#### Scenario: Switch tracks while playing
- **WHEN** `playFromUrl(url2)` is called while `url1` is currently playing
- **THEN** playback of `url1` stops, the source switches to `url2`, and playback begins

