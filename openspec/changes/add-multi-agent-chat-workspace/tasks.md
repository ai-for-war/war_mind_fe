## 1. Data and state foundations

- [x] 1.1 Add multi-agent message history and send-message API helpers under `src/features/multi-agent/api/`
- [x] 1.2 Add React Query hooks for active conversation messages and prompt submission under `src/features/multi-agent/hooks/`
- [x] 1.3 Add feature types for message records, socket payloads, thread rows, and run statuses under `src/features/multi-agent/types/`
- [x] 1.4 Add a dedicated chat workspace store for composer drafts, ephemeral streaming assistant state, run status, and thread errors without overloading the existing rail store

## 2. Center workspace shell and static states

- [x] 2.1 Replace the center placeholder in `multi-agent-page.tsx` with a feature-scoped `ChatWorkspace` container that reads the active conversation from the rail store
- [x] 2.2 Implement the center workspace empty fresh-chat state with title, description, and suggestion chips for first prompt entry
- [x] 2.3 Implement the center workspace loading and error surfaces using `shadcn/ui` primitives such as `Skeleton` and `Alert`
- [x] 2.4 Ensure the center workspace remains the primary pane on tablet and mobile while preserving the existing rail sheet behavior

## 3. Thread rendering

- [x] 3.1 Implement a `ChatThread` component that renders the selected conversation history using the local AI-style `Conversation` and `Message` primitives
- [x] 3.2 Add chronological thread rendering for user and assistant messages with distinct visual treatment
- [x] 3.3 Add empty-conversation handling for selected conversations that contain no messages while keeping the composer available
- [x] 3.4 Add scroll-to-bottom behavior and prevent stale thread content from appearing when the active conversation changes

## 4. Composer and prompt submission flow

- [x] 4.1 Implement a `ComposerPanel` with multiline input, submit button, and validation that blocks empty or whitespace-only prompts
- [x] 4.2 Support prompt submission from both fresh-chat and existing-conversation states using the existing chat send endpoint
- [x] 4.3 Add optimistic user-message handling and visible submission progress in the center workspace
- [x] 4.4 Reset the center workspace correctly after `New chat` while keeping the composer immediately usable

## 5. Streaming lifecycle integration

- [ ] 5.1 Subscribe to chat Socket.IO lifecycle events with the existing `useSocketSubscription` hook and scope updates by conversation
- [ ] 5.2 Create and update an ephemeral assistant row for `started` and `token` events so streaming content appears in the active thread immediately
- [ ] 5.3 Handle `completed` and `failed` events by finalizing local run state, surfacing errors clearly, and reconciling thread content with server truth
- [ ] 5.4 Refetch or invalidate active conversation history after completion and reconnect paths to prevent local streaming drift

## 6. Polish and verification

- [ ] 6.1 Verify rail-to-workspace handoff for conversation selection, `New chat`, and mobile sheet dismissal behavior
- [ ] 6.2 Verify loading, empty, streaming, completed, and failed states across fresh-chat and existing-conversation flows
- [ ] 6.3 Review reused local AI components and `shadcn/ui` primitives for import alignment, accessibility, and consistent styling in the multi-agent feature
- [ ] 6.4 Update feature exports and perform final lint/test checks for the new center workspace slice
