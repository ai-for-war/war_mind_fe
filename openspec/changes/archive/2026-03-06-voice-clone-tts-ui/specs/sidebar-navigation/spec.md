## MODIFIED Requirements

### Requirement: Navigation menu with two items
The `SidebarContent` SHALL render a `NavMain` component containing exactly three navigation items defined by a configuration array: "Multi-Agent" (path: `/multi-agent`), "Voice Cloning" (path: `/voice-cloning`), and "Text to Speech" (path: `/tts`). Each item SHALL display an icon and a label. The "Text to Speech" item SHALL use the `AudioLines` icon from Lucide.

#### Scenario: All navigation items are displayed
- **WHEN** the sidebar content is rendered
- **THEN** three menu items are visible: "Multi-Agent", "Voice Cloning", and "Text to Speech", each with an appropriate icon

#### Scenario: TTS navigation active state
- **WHEN** the user is on the `/tts` route
- **THEN** the "Text to Speech" menu item is visually highlighted as active and other items are not
