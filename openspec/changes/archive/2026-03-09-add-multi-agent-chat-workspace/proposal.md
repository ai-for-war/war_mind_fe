## Why

The `Multi-Agent` page now has a functioning conversation rail, but the main workspace is still a placeholder, so selecting a conversation does not yet lead into a usable chat experience. A dedicated center workspace is needed now to turn the page into a real multi-agent surface where users can read message history, understand streaming responses, and compose the next prompt without leaving the route.

## What Changes

- Add a center chat workspace to the `Multi-Agent` page that occupies the middle layout region beside the conversation rail
- Add a message thread surface for rendering the active conversation state, including empty, loading, ready, streaming, and failed states
- Add a composer panel for entering prompts and starting a new run from either an existing conversation or a fresh chat state
- Define the page-level state handoff between the conversation rail and the center workspace so selection and `New chat` actions update the visible main pane immediately
- Reuse existing `shadcn/ui` primitives and local AI-style chat components where their semantics match the thread and composer experience
- Establish responsive behavior for the center workspace so it remains usable when the rail collapses into a sheet on smaller viewports

## Capabilities

### New Capabilities
- `multi-agent-chat-workspace`: Center-pane chat workspace for the multi-agent page, including thread rendering, composer behavior, and active conversation state handling

### Modified Capabilities
- None

## Impact

- **Affected frontend area**: `src/features/multi-agent/` will need page-layout updates plus center-workspace components, hooks, and local UI state
- **UI integration**: the existing conversation rail must drive the active conversation context consumed by the center workspace without redefining the rail itself
- **Data sources consumed**: existing conversation message history REST endpoints and current chat send/stream contracts will be used as the base integration surface
- **Reusable component surface**: local AI-oriented components and `shadcn/ui` primitives will be evaluated for thread, composer, empty-state, and streaming-state composition
- **Responsive behavior**: the center workspace must remain primary on tablet and mobile while the rail becomes secondary
- **Backend dependency**: no blocking backend endpoint is required for the first workspace slice, though richer streaming metadata and stable request identifiers would improve follow-on UX for execution and orchestration details
