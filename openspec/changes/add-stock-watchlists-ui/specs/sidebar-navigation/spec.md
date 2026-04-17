## MODIFIED Requirements

### Requirement: Navigation menu with two items
The `SidebarContent` SHALL render a `NavMain` component whose navigation structure is defined by a configuration array of labeled groups. The sidebar SHALL render these groups and destinations:
- `Agents`: "Multi-Agent" (path: `/multi-agent`) with the `Bot` icon
- `Markets`: "Stock Catalog" (path: `/stocks`) with a market-appropriate Lucide icon and "Watchlists" (path: `/stocks/watchlists`) with a market-research-appropriate Lucide icon
- `Plugins`: "Skill" (path: `/skill-plugins`) with a plugin-appropriate Lucide icon
- `Generative AI`: "Interview Lab" (path: `/interview-lab`) with the `Lightbulb` icon and "Meeting Recorder" (path: `/meeting-recorder`) with a recording-appropriate Lucide icon
- `Confidential report`: "Voice Cloning" (path: `/voice-cloning`) with the `Mic` icon, "Text to Image" (path: `/text-to-image`) with an image-generation-appropriate Lucide icon, and "Text to Speech" (path: `/tts`) with the `AudioLines` icon

Each navigation item SHALL display an icon and a label, and clicking a group heading SHALL navigate to the first destination in that group.

#### Scenario: All navigation groups and items are displayed
- **WHEN** the sidebar content is rendered
- **THEN** the sidebar shows the `Agents`, `Markets`, `Plugins`, `Generative AI`, and `Confidential report` groups
- **AND** the navigation items "Multi-Agent", "Stock Catalog", "Watchlists", "Skill", "Interview Lab", "Meeting Recorder", "Voice Cloning", "Text to Image", and "Text to Speech" are visible with appropriate icons

#### Scenario: Group heading navigates to its primary destination
- **WHEN** the user clicks a navigation group heading
- **THEN** the app navigates to the first configured destination in that group

### Requirement: Active state reflects current route
The navigation menu SHALL highlight the item whose `url` matches the current route path. The active item SHALL be visually distinguished from inactive items using shadcn `SidebarMenuButton`'s `isActive` prop. This active-state behavior SHALL apply to grouped navigation destinations including `/multi-agent`, `/stocks`, `/stocks/watchlists`, `/skill-plugins`, `/voice-cloning`, `/interview-lab`, `/meeting-recorder`, `/text-to-image`, and `/tts`.

#### Scenario: Current route item is highlighted
- **WHEN** the user is on the `/voice-cloning` route
- **THEN** the "Voice Cloning" menu item is visually highlighted as active and "Multi-Agent" is not

#### Scenario: Active state updates on navigation
- **WHEN** the user clicks "Multi-Agent" in the sidebar
- **THEN** the browser navigates to `/multi-agent` and the "Multi-Agent" item becomes active while "Voice Cloning" becomes inactive

#### Scenario: Stock catalog route is active
- **WHEN** the user is on the `/stocks` route
- **THEN** the "Stock Catalog" navigation item is visually highlighted as active and nonmatching items are not

#### Scenario: Watchlists route is active
- **WHEN** the user is on the `/stocks/watchlists` route
- **THEN** the "Watchlists" navigation item is visually highlighted as active and nonmatching items are not

#### Scenario: Skill route is active
- **WHEN** the user is on the `/skill-plugins` route
- **THEN** the "Skill" navigation item is visually highlighted as active and nonmatching items are not

#### Scenario: Meeting recorder route is active
- **WHEN** the user is on the `/meeting-recorder` route
- **THEN** the "Meeting Recorder" navigation item is visually highlighted as active and nonmatching items are not

#### Scenario: Text-to-image route is active
- **WHEN** the user is on the `/text-to-image` route
- **THEN** the "Text to Image" navigation item is visually highlighted as active and nonmatching items are not
