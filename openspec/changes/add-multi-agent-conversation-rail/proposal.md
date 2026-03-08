## Why

The `Multi-Agent` page currently renders as a blank placeholder, so users have no way to browse previous conversations, recover context, or start a new orchestration flow from a stable navigation surface. A dedicated conversation rail is needed before the rest of the multi-agent chat workspace can feel usable, because conversation selection and history awareness anchor every other interaction on the page.

## What Changes

- Add a conversation rail to the left side of the `Multi-Agent` page for browsing and switching chat conversations
- Add search and lightweight filtering for conversation discovery, including at minimum active and archived states
- Add a clear `New chat` entry point so users can start a fresh orchestration flow without leaving the page
- Add loading, empty, error, selected, and active-run UI states for conversation list rendering
- Surface compact conversation metadata in the rail, such as title, recency, and a short preview when available
- Define responsive behavior for the rail so it can collapse or move into a drawer/sheet on smaller viewports

## Capabilities

### New Capabilities
- `multi-agent-conversation-rail`: Left-side conversation navigation for the multi-agent workspace, including search, filters, new-chat entry point, conversation selection, and list-state handling

### Modified Capabilities
- None

## Impact

- **Affected frontend area**: `src/features/multi-agent/` will need page-level layout and rail-specific components, hooks, and types
- **Data sources consumed**: existing chat conversation listing API and conversation metadata already exposed by the backend
- **UI states introduced**: loading, empty, error, selected, archived, and active conversation states in the multi-agent workspace
- **Responsive behavior**: the multi-agent page layout will need a defined rail behavior for tablet and mobile breakpoints
- **Backend dependency**: no blocking backend API change is required for the base rail, though richer preview and run-status fields may improve the experience in later iterations
