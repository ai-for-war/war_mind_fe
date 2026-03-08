## 1. Feature setup

- [x] 1.1 Create the `multi-agent` conversation rail module structure under `src/features/multi-agent/` for components, hooks, api, stores, and types
- [x] 1.2 Add or update feature-level types and query keys for conversation list fetching, filter state, and active conversation selection

## 2. Conversation data and state

- [x] 2.1 Implement the conversation list API client against the existing backend endpoint with support for `search`, `status`, `skip`, and `limit`
- [x] 2.2 Implement a React Query hook for fetching conversations with loading, empty, and error state support
- [x] 2.3 Implement feature UI state for `activeConversationId`, search draft, selected filter, and responsive sheet open state

## 3. Conversation rail UI

- [x] 3.1 Implement the feature-scoped conversation rail container as a left-side `aside` on the `Multi-Agent` page
- [x] 3.2 Implement the search field, lightweight filter controls, and `New chat` action using reusable `shadcn/ui` primitives
- [x] 3.3 Implement the conversation list and conversation row components with selected, default, loading, empty, and error visual states
- [x] 3.4 Render compact conversation metadata in each row, including title and recency, with optional preview support when data is available

## 4. Interaction and responsive behavior

- [ ] 4.1 Wire conversation selection so clicking a row updates the active conversation context for the page
- [ ] 4.2 Wire the `New chat` action so the page enters a fresh conversation-starting state without route navigation
- [ ] 4.3 Add debounced search behavior and server-backed status filtering for at least `Active` and `Archived`
- [ ] 4.4 Implement responsive rail behavior using a persistent desktop rail and a `Sheet` or drawer presentation on smaller viewports

## 5. Verification

- [ ] 5.1 Verify the `Multi-Agent` page shows a usable conversation rail before any main thread implementation exists
- [ ] 5.2 Verify search, filters, and `New chat` behave correctly across loading, empty, and error states
- [ ] 5.3 Verify conversation selection remains visually clear and updates the active page context correctly
- [ ] 5.4 Verify the rail remains accessible and functional on desktop, tablet, and mobile layouts
