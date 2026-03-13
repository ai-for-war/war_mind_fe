## MODIFIED Requirements

### Requirement: Navigation menu with two items
The `SidebarContent` SHALL render a `NavMain` component containing grouped navigation sections defined by a configuration array.

The grouped navigation SHALL include:
- an `Agents` section containing:
  - `Multi-Agent` with route `/multi-agent`
- a `Confidential report` section containing:
  - `Voice Cloning` with route `/voice-cloning`
  - `Text to Image` with route `/text-to-image`
  - `Text to Speech` with route `/tts`
  - `STT Lab` with route `/stt-lab`

Each navigation entry SHALL display an icon and a label. The active route SHALL be reflected through the existing active-state handling of the sidebar menu buttons.

#### Scenario: All grouped navigation entries are displayed
- **WHEN** the authenticated sidebar content is rendered
- **THEN** the sidebar shows the `Agents` and `Confidential report` groups
- **AND** the available navigation entries include `Multi-Agent`, `Voice Cloning`, `Text to Image`, `Text to Speech`, and `STT Lab`

#### Scenario: STT Lab navigation active state
- **WHEN** the user is on the `/stt-lab` route
- **THEN** the `STT Lab` navigation entry is visually highlighted as active and unrelated entries are not
