# waveform-player Specification

## Purpose
TBD - created by archiving change voice-clone-tts-ui. Update Purpose after archive.
## Requirements
### Requirement: WaveformPlayer component
The system SHALL provide a `WaveformPlayer` component at `src/components/common/waveform-player.tsx` that wraps `@wavesurfer/react` to render an audio waveform with playback controls. The component SHALL accept a `src` prop (URL string) as the audio source.

The component SHALL display:
- A waveform visualization of the audio
- A play/pause toggle button (Lucide `Play` / `Pause` icons)
- Current time and total duration in `mm:ss` format
- A loading skeleton while waveform is initializing

#### Scenario: Render waveform from URL
- **WHEN** `WaveformPlayer` is rendered with `src="https://example.com/audio.mp3"`
- **THEN** wavesurfer loads the audio, renders the waveform visualization, and displays `00:00 / mm:ss` with duration

#### Scenario: Loading state
- **WHEN** the audio source is loading and waveform is not ready
- **THEN** a skeleton placeholder is shown in place of the waveform

#### Scenario: No source provided
- **WHEN** `WaveformPlayer` is rendered with `src` as `undefined` or empty string
- **THEN** the component renders an empty state placeholder (no waveform, no controls)

### Requirement: WaveformPlayer playback controls
The `WaveformPlayer` SHALL support play, pause, and seek interactions. Clicking the play button SHALL start playback. Clicking the pause button SHALL pause playback. Clicking on the waveform SHALL seek to the clicked position.

#### Scenario: Play audio
- **WHEN** the user clicks the play button while audio is paused
- **THEN** audio playback begins from the current position and the button changes to a pause icon

#### Scenario: Pause audio
- **WHEN** the user clicks the pause button while audio is playing
- **THEN** audio playback pauses and the button changes to a play icon

#### Scenario: Seek by clicking waveform
- **WHEN** the user clicks on a position in the waveform
- **THEN** playback seeks to the corresponding time position

#### Scenario: Playback reaches end
- **WHEN** audio playback reaches the end of the track
- **THEN** the play button resets to play icon and `currentTime` equals `duration`

### Requirement: WaveformPlayer theme integration
The waveform SHALL use customizable colors that default to the application theme. The played (progress) portion SHALL use the primary color (amber). The unplayed portion SHALL use `neutral-700`. The cursor line SHALL use the primary color.

The component SHALL accept optional `waveColor`, `progressColor`, and `height` props to override defaults.

#### Scenario: Default theme colors
- **WHEN** `WaveformPlayer` is rendered without color props
- **THEN** the waveform uses amber for progress, neutral-700 for wave, and a height of 48px

#### Scenario: Custom colors
- **WHEN** `WaveformPlayer` is rendered with `waveColor="#334155"` and `progressColor="#3b82f6"`
- **THEN** the waveform uses the provided custom colors instead of defaults

### Requirement: WaveformPlayer cleanup
The `WaveformPlayer` SHALL destroy the wavesurfer instance and release audio resources when the component unmounts or when the `src` prop changes.

#### Scenario: Component unmounts while playing
- **WHEN** the component unmounts while audio is playing
- **THEN** playback stops and the wavesurfer instance is destroyed

#### Scenario: Source changes
- **WHEN** the `src` prop changes from `url1` to `url2`
- **THEN** the previous waveform is destroyed and a new waveform loads with `url2`

### Requirement: WaveformPlayer compact variant
The component SHALL accept a `variant` prop with values `"default"` or `"compact"`. The compact variant SHALL render a smaller waveform (height 32px) without the time display, suitable for use in list items.

#### Scenario: Default variant
- **WHEN** `WaveformPlayer` is rendered with `variant="default"` or without variant prop
- **THEN** the waveform renders at 48px height with time display

#### Scenario: Compact variant
- **WHEN** `WaveformPlayer` is rendered with `variant="compact"`
- **THEN** the waveform renders at 32px height without time display

