## MODIFIED Requirements

### Requirement: Navigation menu with two items
The `SidebarContent` SHALL render a `NavMain` component containing exactly four navigation items defined by a configuration array: "Multi-Agent" (path: `/multi-agent`), "Voice Cloning" (path: `/voice-cloning`), "Text to Speech" (path: `/tts`), and "Text to Image" (path: `/text-to-image`). Each item SHALL display an icon and a label. The "Text to Speech" item SHALL use the `AudioLines` icon from Lucide. The "Text to Image" item SHALL use an image-generation-appropriate Lucide icon.

#### Scenario: All navigation items are displayed
- **WHEN** the sidebar content is rendered
- **THEN** four menu items are visible: "Multi-Agent", "Voice Cloning", "Text to Speech", and "Text to Image", each with an appropriate icon

#### Scenario: TTS navigation active state
- **WHEN** the user is on the `/tts` route
- **THEN** the "Text to Speech" menu item is visually highlighted as active and other items are not

#### Scenario: Text-to-image navigation active state
- **WHEN** the user is on the `/text-to-image` route
- **THEN** the "Text to Image" menu item is visually highlighted as active and other items are not
