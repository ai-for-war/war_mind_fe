## 1. Stock Agent Data Layer

- [x] 1.1 Create `src/features/stock-agent/` exports, query keys, and TypeScript types for conversations, messages, runtime catalog, run status, streaming assistant state, and one-line activity state
- [x] 1.2 Add Stock Agent conversation and message API modules using `/stock-agent/conversations`, `/stock-agent/conversations/{conversation_id}/messages`, `/stock-agent/catalog`, and `/stock-agent/messages`
- [x] 1.3 Add TanStack Query hooks for conversation list, message history, runtime catalog, and message submission with Stock Agent query keys separated from Super-Agent
- [x] 1.4 Add Stock Agent rail and chat workspace Zustand stores for active conversation, search draft, panel open state, drafts, runtime selection, run status, streaming assistant state, thread errors, and activity line state
- [x] 1.5 Reuse or copy the Super-Agent runtime selection helpers into Stock Agent scope without adding speculative request field aliases

## 2. Socket Lifecycle And Runtime Behavior

- [x] 2.1 Implement a Stock Agent lifecycle subscription hook for started, token, tool start, tool end, completed, and failed chat events
- [x] 2.2 Wire lifecycle events to Stock Agent run status, streaming assistant text, activity-line label/count, thread errors, and Stock Agent query invalidation
- [x] 2.3 Ensure failed runs stop streaming, mark the latest activity as failed, preserve retryable user state, and surface request failures through `sonner`
- [x] 2.4 Ensure completed runs clear streaming assistant state and refresh Stock Agent message history plus conversation list

## 3. Floating Panel UI

- [ ] 3.1 Implement `StockAgentFloatingLauncher` with route visibility gating for Markets route prefixes and a bottom-right launcher button
- [ ] 3.2 Implement the desktop floating panel shell with fixed bottom-right positioning, bounded viewport height, two-column layout, and no page-content reflow
- [ ] 3.3 Implement a simple Stock Agent conversation rail with search, new chat, conversation rows, active-row styling, loading skeletons, empty state, retry state, and internal scrolling
- [ ] 3.4 Implement the Stock Agent chat surface using shared `Conversation`, `Message`, `MessageResponse`, `ConversationScrollButton`, and `Suggestion` primitives
- [ ] 3.5 Implement a compact Stock Agent composer using shared `PromptInput` primitives, runtime controls, subagent toggle, validation feedback, and submit state
- [ ] 3.6 Implement the mobile single-column overlay with accessible conversation-list access and internally scrolling thread content

## 4. One-Line Activity UX

- [ ] 4.1 Create `StockAgentActivityLine` that renders the latest action label, a step-count `Badge`, active/completed/failed states, and compact status iconography
- [ ] 4.2 Animate activity label replacement with `motion/react` opacity and transform transitions without repeated height animation
- [ ] 4.3 Update activity state on tool start/tool end/completed/failed lifecycle events so new actions replace previous actions and the badge count increments
- [ ] 4.4 Verify the activity line never expands into a multi-step timeline in the floating panel

## 5. Shell Integration

- [ ] 5.1 Mount the Stock Agent floating launcher from `MainLayout` after routed content so it is shell-level and page-independent
- [ ] 5.2 Reset Stock Agent rail and workspace stores when the active organization changes in `MainLayout`
- [ ] 5.3 Ensure minimizing or closing the panel preserves Stock Agent active conversation, draft, rail search, runtime selection, streaming state, and activity state
- [ ] 5.4 Ensure Stock Agent request payloads never include current page context such as selected symbol, watchlist id, report id, backtest id, route state, or table state

## 6. Verification

- [ ] 6.1 Run typecheck/build verification and resolve any Stock Agent, shared AI, or shell integration errors
- [ ] 6.2 Verify Markets routes show the launcher and non-Market routes hide it
- [ ] 6.3 Verify conversation search, new chat, conversation selection, message history loading, empty states, retry states, and internal scrolling
- [ ] 6.4 Verify fresh chat submission, existing conversation submission, runtime payload fields, optimistic user message behavior, failed submit draft preservation, and `sonner` errors
- [ ] 6.5 Verify streaming tokens, completed refresh behavior, failed lifecycle behavior, and the one-line activity replacement/count animation
- [ ] 6.6 Verify desktop and mobile layouts visually, including that the floating panel does not push route content and mobile uses a single-column overlay
