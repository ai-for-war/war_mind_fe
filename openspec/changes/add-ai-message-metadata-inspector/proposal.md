## Why

Assistant messages in both chat workspaces already carry useful runtime metadata such as the model, loaded skill, and tool calls, but that information is not visible in the UI. This change is needed now so users can inspect how an AI response was produced without cluttering the main thread or exposing raw backend payloads.

## What Changes

- Add a metadata action on assistant messages in both `Super-Agent` and `Multi-Agent` chat threads
- Open a right-side metadata inspector when the user selects that action, with a mobile fallback that can still present the same content in a compact side sheet
- Show only the high-value assistant metadata in the inspector: `model`, `skill`, and `tools`
- Present tool calls in a compact execution-style format using the existing chain-of-thought visual language instead of raw JSON
- Hide empty metadata sections so the inspector stays lightweight and focused on the selected assistant response
- Keep the metadata panel synchronized with the currently selected assistant message and clear it when conversation context changes

## Capabilities

### New Capabilities

### Modified Capabilities
- `super-agent-chat-workspace`: Extend assistant message interaction and thread detail behavior so users can open a right-side metadata inspector that shows model, skill, and tool-call summaries for a selected assistant response
- `multi-agent-chat-workspace`: Extend assistant message interaction and thread detail behavior so users can open a right-side metadata inspector that shows model, skill, and tool-call summaries for a selected assistant response

## Impact

- **Affected frontend areas**: `src/features/super-agent/`, `src/features/multi-agent/`, and shared AI presentation components used by both chat threads
- **UI behavior changes**: assistant messages gain a new metadata action and the workspace gains a secondary detail surface for the selected AI response
- **Shared presentation work**: the existing chain-of-thought and tool-label formatting patterns should be reused for metadata tool-call display rather than introducing a second tool timeline style
- **State changes**: each workspace will need local selection state for the active assistant message metadata inspector
- **No backend contract change required**: the inspector reads existing `metadata` fields already returned with conversation messages
- **No raw payload viewer in scope**: the change intentionally avoids timestamps, raw JSON argument dumps, or low-level debugging output in the inspector
