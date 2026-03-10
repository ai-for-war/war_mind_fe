## Context

`war_mind_fe` is a React 19 + Vite + TypeScript SPA that already has a clear authenticated app shell, Zustand stores for auth and organization state, and a `useHydrateAuth()` flow that restores user and organization data after page reload. The backend exposes Socket.IO over the same application stack and authenticates clients with `auth: { token }`, then routes business events through user-scoped rooms.

The team has explicitly chosen Option B: do not introduce a heavy frontend "gateway" abstraction yet. Instead, build a thin shared client layer around raw `socket.io-client` so future realtime features can reuse one authenticated connection without scattering low-level transport concerns across the codebase.

Constraints:
- Socket connection should exist only in authenticated screens
- Connection should not start before auth hydration completes
- Event delivery for organization-scoped features must be filtered to the active organization only
- The current change is infrastructure-only; no feature-specific business handlers are part of this design

## Goals / Non-Goals

**Goals:**
- Provide a single shared Socket.IO client per authenticated browser tab
- Delay connection until auth state is ready, then reuse the latest token for handshake
- Provide a lightweight React integration layer (`Provider` + hooks) instead of a feature-heavy gateway/service
- Centralize connection state and listener cleanup so future features do not repeat these concerns
- Support opt-in organization-aware event filtering in the subscription layer

**Non-Goals:**
- No feature-specific event handling for chat, TTS, sheet sync, or notifications
- No generic business event registry or event-to-cache orchestration layer
- No client-side abstraction for emitting arbitrary business commands over the socket
- No backend contract changes, room model changes, or connection-state-recovery changes
- No separate cross-tab coordination layer beyond one connection per browser tab

## Decisions

### 1. Use a shared singleton Socket.IO client with a thin React layer

**Choice**: Create one shared `socket.io-client` instance in a dedicated module, then expose it through a `SocketProvider`, `useSocket()`, and `useSocketSubscription()` hooks.

**Rationale**: This follows the most common frontend Socket.IO pattern used in React apps: a singleton transport plus a small provider/hook layer. It keeps the codebase simple while still preventing duplicate connections and listener leaks.

**Alternatives considered**:
- Full gateway/service abstraction: more control, but too heavy for the current scope
- Pure raw imports everywhere: simpler initially, but duplicates lifecycle and cleanup logic quickly
- Per-feature connection instances: rejected because it risks duplicate connections and inconsistent auth behavior

### 2. Mount the provider inside the authenticated app shell

**Choice**: Mount `SocketProvider` only for authenticated descendants, after `useHydrateAuth()` has completed.

**Rationale**: The socket server requires a JWT token during the connection handshake. Connecting earlier would either fail or force ad hoc retry logic. Mounting inside the protected shell also guarantees no connection on the login page.

**Alternatives considered**:
- Mount in `src/main.tsx`: too early for auth-scoped transport
- Mount inside individual pages: couples event reception to page mount timing and increases duplicate listener risk

### 3. Keep transport state separate from business state

**Choice**: Introduce a small dedicated connection-state store for transport lifecycle only, with states such as `idle`, `connecting`, `connected`, `reconnecting`, `disconnected`, and `error`.

**Rationale**: Connection status is cross-cutting infrastructure state, not feature data. Keeping it separate avoids mixing transport concerns into auth, app UI, or future feature stores.

### 4. Use `autoConnect: false` and read the latest token at connect time

**Choice**: Configure the singleton socket with `autoConnect: false` and supply credentials from `storage.getToken()` during connection/auth setup.

**Rationale**: This ensures the client does not attempt to connect before the app is ready and avoids stale credentials after login, reload, or token refresh.

**Alternatives considered**:
- Connect immediately on module import: too early and error-prone for authenticated flows
- Recreate the socket instance on every token change: unnecessary churn and harder listener management

### 5. Do organization filtering in the subscription layer, not in the transport layer

**Choice**: Keep the socket transport generic, but let `useSocketSubscription()` accept an option such as `organizationScoped: true`. When enabled, the hook will compare `payload.organization_id` with the current active organization and drop mismatched events.

**Rationale**: This preserves the lightweight Option B architecture while still enforcing the team rule that org-scoped UI should only react to events from the active organization. It also avoids turning the transport itself into a business-aware gateway.

**Alternatives considered**:
- No shared filtering: forces every feature to duplicate the same guard logic
- Hard-code filtering globally for all events: too rigid because not every event is necessarily organization-scoped

### 6. Derive the default socket base URL from `API_URL`

**Choice**: Derive the default socket origin from `new URL(env.API_URL).origin` and rely on the server's default Socket.IO path unless a local constant override is later needed.

**Rationale**: This avoids introducing extra environment variables before they are necessary, while still keeping the derivation logic centralized in one place.

**Alternatives considered**:
- Add `VITE_SOCKET_URL` and `VITE_SOCKET_PATH` immediately: flexible, but premature for the current scope
- Hard-code localhost-only URLs: not acceptable for deployable infrastructure

## Risks / Trade-offs

- **[Thin layer may feel too light later]** -> If feature count and event complexity grow, the provider/hooks foundation can evolve into a richer service without replacing the transport contract
- **[Organization filtering depends on payload metadata]** -> The subscription option will treat missing `organization_id` as not deliverable for org-scoped handlers, making mistakes visible early instead of leaking cross-org events
- **[React Strict Mode can double-run effects in development]** -> Provider and hooks must use idempotent connection/listener logic and explicit cleanup
- **[One shared connection means a central failure point]** -> Expose status and errors through the connection store so failures are observable and debuggable

## Migration Plan

1. Add `socket.io-client` and create the shared socket module
2. Add provider, connection-state store, and subscription hooks
3. Mount the provider in the authenticated app shell
4. Let future realtime features adopt the hooks incrementally without changing the transport foundation

Rollback is straightforward: unmount the provider, remove the shared socket module and dependency, and realtime features can remain unimplemented without affecting the existing REST-based application flow.

## Open Questions

- None for this infrastructure slice; feature-specific event maps and cache synchronization decisions are intentionally deferred to later changes
