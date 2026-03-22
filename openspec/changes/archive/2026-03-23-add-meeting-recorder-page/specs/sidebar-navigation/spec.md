## MODIFIED Requirements

### Requirement: Navigation menu with two items
The `SidebarContent` SHALL render a `NavMain` component containing application navigation items defined by a configuration array. The navigation configuration SHALL continue to expose the existing authenticated application destinations and SHALL include a dedicated "Meeting Recorder" item that navigates to the meeting recorder page. Each item SHALL display an icon and a label. The "Meeting Recorder" item SHALL use a recording-appropriate Lucide icon.

#### Scenario: Meeting recorder item is displayed
- **WHEN** the sidebar content is rendered
- **THEN** the navigation menu includes a "Meeting Recorder" item alongside the existing authenticated application navigation items

#### Scenario: Meeting recorder item becomes active
- **WHEN** the user is on the meeting recorder page route
- **THEN** the "Meeting Recorder" navigation item is visually highlighted as active and nonmatching items are not
