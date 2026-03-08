## 1. Feature Setup

- [ ] 1.1 Create the `src/features/multi-agent/` module structure with `api/`, `components/`, `hooks/`, `stores/`, `types/`, and `index.ts`
- [ ] 1.2 Add chat query keys, frontend types, and event payload mappings for conversations, messages, streaming assistant state, execution activity items, and derived run stages
- [ ] 1.3 Decide which existing `src/components/ai/` parts can be safely reused and normalize or wrap any import-path-incompatible pieces needed by this feature

## 2. Data Layer And Workspace State

- [ ] 2.1 Implement API helpers and React Query hooks for `GET /chat/conversations`, `GET /chat/conversations/{conversation_id}/messages`, and `POST /chat/messages`
- [ ] 2.2 Implement a multi-agent UI store for active conversation id, composer draft, temporary streaming assistant message, execution timeline, and panel UI state
- [ ] 2.3 Implement active-conversation selection logic that coordinates conversation rail selection, message history loading, and local workspace resets when the selected conversation changes

## 3. Layout And Conversation Navigation

- [ ] 3.1 Replace the placeholder `/multi-agent` page with the desktop three-pane workspace shell and responsive collapse behavior for tablet/mobile
- [ ] 3.2 Implement the workspace header with conversation context, new chat affordance, and visible socket connection status
- [ ] 3.3 Implement the conversation rail with search input, status filters, loading state, empty state, error state, and selected conversation styling
- [ ] 3.4 Implement conversation list items with title, recency, and lightweight local activity/status affordances for the active or streaming conversation

## 4. Chat Workspace

- [ ] 4.1 Implement the active conversation thread with loading, empty, error, and chronological message rendering states
- [ ] 4.2 Implement the prompt composer with multiline input, submit validation, keyboard behavior, optimistic local user messages, and disabled/in-progress states
- [ ] 4.3 Implement sticky thread scrolling behavior, scroll-to-bottom affordance, and stable rendering for long assistant responses
- [ ] 4.4 Implement workspace-level empty, offline, reconnecting, and request-failure feedback that keeps the current conversation context visible

## 5. Streaming And Execution Insights

- [ ] 5.1 Implement socket-driven streaming assistant message handling for `chat:message:started`, `chat:message:token`, `chat:message:completed`, and `chat:message:failed`
- [ ] 5.2 Implement reconciliation logic that merges temporary assistant stream state back into server-backed message history after completion or reconnect
- [ ] 5.3 Implement the execution insights region with `Run Summary`, `Live Activity`, and `System Insight` sections
- [ ] 5.4 Implement derived run-stage logic (`idle`, `initiating`, `tool-using`, `synthesizing`, `completed`, `failed`) from the current socket event contract
- [ ] 5.5 Implement the live activity timeline using `chat:message:started`, `chat:message:tool_start`, `chat:message:tool_end`, `chat:message:completed`, and `chat:message:failed`
- [ ] 5.6 Implement graceful degradation rules so execution insights remain coherent when backend payloads lack `request_id`, `assistant_message_id`, `agent_id`, `stage`, or rich completion metadata

## 6. Verification And Polish

- [ ] 6.1 Verify conversation list, active thread loading, and send-message flow against the current backend REST contract
- [ ] 6.2 Verify streamed assistant responses and execution insights update correctly for the active conversation without leaking events from other conversations or organizations
- [ ] 6.3 Verify responsive behavior for desktop, tablet, and mobile layouts, including collapsed rails/sheets and preserved chat usability
- [ ] 6.4 Verify empty, loading, error, offline, reconnecting, and failed-run states are all user-visible and recoverable without a full page refresh
