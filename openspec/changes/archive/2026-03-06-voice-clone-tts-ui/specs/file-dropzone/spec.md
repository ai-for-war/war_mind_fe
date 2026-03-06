## ADDED Requirements

### Requirement: FileDropzone component
The system SHALL provide a `FileDropzone` component at `src/components/common/file-dropzone.tsx` that wraps `react-dropzone` to provide a drag-and-drop file upload area. The component SHALL accept `onFileSelect` callback, `accept` (MIME type filter), `maxSize` (bytes), and `disabled` props.

The drop zone SHALL display:
- A dashed border container with upload icon (Lucide `Upload`) and instruction text
- Visual feedback when a file is being dragged over (border color change, background highlight)
- File information (name, size, type) after a file is selected
- A remove/clear button to deselect the file

#### Scenario: Render empty dropzone
- **WHEN** `FileDropzone` is rendered without a selected file
- **THEN** a dashed border area with upload icon and "Drag & drop or click to upload" text is displayed

#### Scenario: Drag file over dropzone
- **WHEN** a file is dragged over the dropzone area
- **THEN** the border color changes to primary (amber) and background shows a subtle highlight to indicate drop is possible

#### Scenario: Drop valid file
- **WHEN** a valid file (matching accept filter and within maxSize) is dropped onto the dropzone
- **THEN** `onFileSelect` callback is called with the File object, and the dropzone displays the file name, size (human-readable), and file type

#### Scenario: Drop invalid file type
- **WHEN** a file with an unaccepted MIME type is dropped
- **THEN** `onFileSelect` is NOT called and the dropzone shows an error message indicating the accepted file types

#### Scenario: Drop oversized file
- **WHEN** a file exceeding `maxSize` is dropped
- **THEN** `onFileSelect` is NOT called and the dropzone shows an error message indicating the maximum file size

#### Scenario: Click to browse
- **WHEN** the user clicks on the dropzone area
- **THEN** the native file browser dialog opens with the configured `accept` filter

### Requirement: FileDropzone file info display
After a file is selected, the dropzone SHALL transform to show file information: file name, formatted file size (KB/MB), and a clear button (Lucide `X` icon) to remove the selection.

#### Scenario: Display selected file info
- **WHEN** a file named "voice-sample.mp3" (2.5MB) is selected
- **THEN** the dropzone shows "voice-sample.mp3", "2.5 MB", and a clear button

#### Scenario: Clear selected file
- **WHEN** the user clicks the clear button
- **THEN** the selected file is removed, `onFileSelect` is called with `null`, and the dropzone returns to the empty upload state

### Requirement: FileDropzone disabled state
When `disabled` is `true`, the dropzone SHALL be visually dimmed (reduced opacity), the cursor SHALL be `not-allowed`, and drop/click interactions SHALL be ignored.

#### Scenario: Disabled dropzone
- **WHEN** `FileDropzone` is rendered with `disabled={true}`
- **THEN** the dropzone has reduced opacity, cursor-not-allowed, and does not respond to drag or click events

### Requirement: FileDropzone audio-specific defaults
The component SHALL accept a `preset` prop. When `preset="audio"`, the component SHALL default `accept` to `{ "audio/*": [".mp3", ".wav", ".m4a", ".flac", ".ogg"] }` and `maxSize` to `20971520` (20MB), and display "Supported: MP3, WAV, M4A, FLAC, OGG (max 20MB)" as helper text.

#### Scenario: Audio preset
- **WHEN** `FileDropzone` is rendered with `preset="audio"`
- **THEN** the dropzone accepts audio files only, limits to 20MB, and displays supported format helper text
