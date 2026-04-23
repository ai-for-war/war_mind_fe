## Purpose
Define sidebar navigation behavior and structure for authenticated application pages.
## Requirements
### Requirement: Sidebar component structure
The system SHALL provide an `AppSidebar` widget at `src/widgets/sidebar/` that renders a shadcn `Sidebar` component with `variant="sidebar"` and `collapsible="icon"`. The sidebar SHALL contain three sections: `SidebarHeader` (logo/app name), `SidebarContent` (navigation menu), and `SidebarFooter` (organization switcher). The `SidebarFooter` SHALL render the `OrgSwitcher` component.

#### Scenario: Sidebar renders with three sections
- **WHEN** the sidebar is displayed
- **THEN** it renders a header section with the app logo/name, a content section with navigation items, and a footer section containing the organization switcher

#### Scenario: Footer displays active organization
- **WHEN** the sidebar is displayed and the user has an active organization
- **THEN** the footer section shows the `OrgSwitcher` component displaying the active organization name, avatar, and role

### Requirement: Sidebar header displays app identity
The `SidebarHeader` SHALL display the application logo and the application name "WAR MIND". When the sidebar is collapsed to icon-only mode, only the logo icon SHALL be visible.

#### Scenario: Expanded sidebar shows logo and name
- **WHEN** the sidebar is in expanded state
- **THEN** the app logo and "WAR MIND" text are both visible in the header

#### Scenario: Collapsed sidebar shows only logo
- **WHEN** the sidebar is in collapsed (icon-only) state
- **THEN** only the app logo icon is visible in the header, and the "WAR MIND" text is hidden

### Requirement: Navigation menu with two items
The `SidebarContent` SHALL render a `NavMain` component whose navigation structure is defined by a configuration array of labeled groups. The sidebar SHALL render these groups and destinations:
- `Agents`: "Multi-Agent" (path: `/multi-agent`) with the `Bot` icon
- `Markets`: "Stock Catalog" (path: `/stocks`) with a market-appropriate Lucide icon, "Watchlists" (path: `/stocks/watchlists`) with a market-research-appropriate Lucide icon, and "Stock Research" (path: `/stocks/research`) with a research-appropriate Lucide icon
- `Plugins`: "Skill" (path: `/skill-plugins`) with a plugin-appropriate Lucide icon
- `Generative AI`: "Interview Lab" (path: `/interview-lab`) with the `Lightbulb` icon and "Meeting Recorder" (path: `/meeting-recorder`) with a recording-appropriate Lucide icon
- `Confidential report`: "Voice Cloning" (path: `/voice-cloning`) with the `Mic` icon, "Text to Image" (path: `/text-to-image`) with an image-generation-appropriate Lucide icon, and "Text to Speech" (path: `/tts`) with the `AudioLines` icon

Each navigation item SHALL display an icon and a label, and clicking a group heading SHALL navigate to the first destination in that group.

#### Scenario: All navigation groups and items are displayed
- **WHEN** the sidebar content is rendered
- **THEN** the sidebar shows the `Agents`, `Markets`, `Plugins`, `Generative AI`, and `Confidential report` groups
- **AND** the navigation items "Multi-Agent", "Stock Catalog", "Watchlists", "Stock Research", "Skill", "Interview Lab", "Meeting Recorder", "Voice Cloning", "Text to Image", and "Text to Speech" are visible with appropriate icons

#### Scenario: Group heading navigates to its primary destination
- **WHEN** the user clicks a navigation group heading
- **THEN** the app navigates to the first configured destination in that group

### Requirement: Active state reflects current route
The navigation menu SHALL highlight the item whose `url` matches the current route path. The active item SHALL be visually distinguished from inactive items using shadcn `SidebarMenuButton`'s `isActive` prop. This active-state behavior SHALL apply to grouped navigation destinations including `/multi-agent`, `/stocks`, `/stocks/watchlists`, `/stocks/research`, `/skill-plugins`, `/voice-cloning`, `/interview-lab`, `/meeting-recorder`, `/text-to-image`, and `/tts`.

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

#### Scenario: Stock research route is active
- **WHEN** the user is on the `/stocks/research` route
- **THEN** the "Stock Research" navigation item is visually highlighted as active and nonmatching items are not

#### Scenario: Skill route is active
- **WHEN** the user is on the `/skill-plugins` route
- **THEN** the "Skill" navigation item is visually highlighted as active and nonmatching items are not

#### Scenario: Meeting recorder route is active
- **WHEN** the user is on the `/meeting-recorder` route
- **THEN** the "Meeting Recorder" navigation item is visually highlighted as active and nonmatching items are not

#### Scenario: Text-to-image route is active
- **WHEN** the user is on the `/text-to-image` route
- **THEN** the "Text to Image" navigation item is visually highlighted as active and nonmatching items are not

### Requirement: Sidebar collapse to icon-only mode
The sidebar SHALL support collapsing to icon-only mode (width: `3rem`) using `collapsible="icon"`. When collapsed, only the icons of navigation items SHALL be visible, and hovering over an icon SHALL display a tooltip with the item's label.

#### Scenario: Collapsed sidebar shows icons with tooltips
- **WHEN** the sidebar is in collapsed state
- **THEN** only icons are visible for each navigation item
- **AND** hovering over an icon displays a tooltip with the item's label text

### Requirement: Keyboard shortcut to toggle sidebar
The sidebar SHALL support toggling between expanded and collapsed states via the keyboard shortcut `Ctrl+B` (or `Cmd+B` on macOS). This is provided by shadcn's `SidebarProvider` built-in behavior.

#### Scenario: Toggle sidebar with keyboard
- **WHEN** the user presses `Ctrl+B`
- **THEN** the sidebar toggles between expanded and collapsed states

### Requirement: Mobile responsive sidebar
On mobile viewports (width < 768px), the sidebar SHALL automatically render as a `Sheet` (slide-in drawer) instead of a fixed sidebar. The drawer SHALL be triggered by the `SidebarTrigger` button in the header.

#### Scenario: Mobile sidebar renders as drawer
- **WHEN** the viewport width is less than 768px
- **THEN** the sidebar is hidden by default and appears as a slide-in drawer when the `SidebarTrigger` is activated

### Requirement: Sidebar rail for toggle interaction
The sidebar SHALL render a `SidebarRail` component on its right edge that allows users to toggle the sidebar by clicking on the rail.

#### Scenario: Click rail to toggle sidebar
- **WHEN** the user clicks the sidebar rail
- **THEN** the sidebar toggles between expanded and collapsed states

