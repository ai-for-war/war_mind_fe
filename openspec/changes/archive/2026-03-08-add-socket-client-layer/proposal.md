## Why

The backend already exposes authenticated Socket.IO events, but the frontend does not yet have a shared client-side realtime foundation. Allowing each feature to use `socket.io-client` directly would scatter auth, reconnect, cleanup, and organization-filtering logic across the app before any realtime feature is even built.

## What Changes

- Add a shared Socket.IO client singleton for the authenticated frontend shell
- Add a lightweight React provider and hooks layer for connection lifecycle and listener management
- Standardize token-based handshake, delayed connect after auth hydration, and disconnect on logout/unmount
- Add optional active-organization filtering for organization-scoped event subscriptions
- Expose connection status so future features can observe transport health without touching low-level Socket.IO APIs

## Capabilities

### New Capabilities
- `socket-client-layer`: Shared Socket.IO client infrastructure for authenticated pages, including a singleton client, provider lifecycle, connection state, and reusable subscription hooks

### Modified Capabilities
- None

## Impact

- **New files**: shared socket client, provider, hooks, and connection-state utilities under `src/features/socket/`
- **Dependencies**: add `socket.io-client`
- **Existing modules consumed**: `env.API_URL`, `storage`, `useHydrateAuth`, `useAuthStore`, `useOrganizationStore`
- **No backend changes**: reuse the existing Socket.IO JWT auth contract and user-room delivery model as-is
