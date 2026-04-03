## 1. Shared metadata parsing and presentation foundations

- [x] 1.1 Add a shared assistant-message metadata normalizer that safely extracts `model`, `skill_id`, optional `skill_version`, optional `loaded_skills`, and `tool_calls` from `metadata`
- [x] 1.2 Add shared helper logic that determines whether an assistant message has displayable metadata and therefore should show the metadata-inspector action
- [x] 1.3 Extract or wrap the existing tool label/icon/argument-summary helpers so both `Super-Agent` and `Multi-Agent` can render tool-call summaries with the same presentation rules
- [x] 1.4 Create a shared metadata inspector component that renders `Model`, `Skill`, and `Tools` sections, hides empty sections, and uses chain-of-thought-style rows for historical tool calls

## 2. Super-Agent thread and workspace integration

- [x] 2.1 Update `src/features/super-agent/components/chat-thread.tsx` so assistant messages with displayable metadata show a metadata-inspector action and user messages do not
- [x] 2.2 Extend `src/features/super-agent/components/chat-workspace.tsx` with local selected-assistant-message metadata state and clear that selection whenever the active conversation changes
- [x] 2.3 Render the shared metadata inspector as an inline right-side panel for larger viewports in the `Super-Agent` workspace
- [x] 2.4 Add a smaller-viewport `Sheet` fallback for the same `Super-Agent` metadata inspector content and open/close behavior

## 3. Multi-Agent thread and workspace integration

- [x] 3.1 Update `src/features/multi-agent/components/chat-thread.tsx` so assistant messages with displayable metadata show a metadata-inspector action and user messages do not
- [x] 3.2 Extend `src/features/multi-agent/components/chat-workspace.tsx` with local selected-assistant-message metadata state and clear that selection whenever the active conversation changes
- [x] 3.3 Render the shared metadata inspector as an inline right-side panel for larger viewports in the `Multi-Agent` workspace
- [x] 3.4 Add a smaller-viewport `Sheet` fallback for the same `Multi-Agent` metadata inspector content and open/close behavior

## 4. Metadata content wiring and UI polish

- [ ] 4.1 Wire model rendering so the inspector shows the selected assistant response model without exposing unrelated backend metadata fields
- [ ] 4.2 Wire skill rendering so the inspector shows `skill_id`, optional `skill_version`, and optional `loaded_skills` without placeholder noise when data is absent
- [ ] 4.3 Wire tool-call rendering so historical tool calls appear as mapped execution-style steps with summarized arguments and no raw JSON dumps
- [ ] 4.4 Ensure the inspector header and section layout stay compact and omit timestamps, placeholder debug rows, and empty-state filler sections

## 5. Verification

- [ ] 5.1 Verify assistant messages only show the metadata action when at least one of `Model`, `Skill`, or `Tools` is available
- [ ] 5.2 Verify opening metadata for one assistant message updates the inspector target correctly and switching conversations clears stale metadata selection
- [ ] 5.3 Verify desktop workspaces show an inline right-side inspector while smaller viewports use a right-side sheet without losing the same content
- [ ] 5.4 Verify tool-call rows render with mapped labels and compact summaries that match the existing conversation execution style
- [ ] 5.5 Run typecheck or equivalent verification for the touched shared AI, `super-agent`, and `multi-agent` files and resolve any introduced issues
