## 1. Setup

- [x] 1.1 Add `socket.io-client` to `package.json`
- [x] 1.2 Create the shared socket module structure under `src/features/socket/`

## 2. Transport Foundation

- [x] 2.1 Implement a singleton Socket.IO client configured with `autoConnect: false` and API-origin-based connection setup
- [x] 2.2 Implement token-aware connection/auth initialization using the existing storage module
- [x] 2.3 Implement a transport connection-state store with status, timestamps, and last error metadata

## 3. React Integration

- [x] 3.1 Implement `SocketProvider` that mounts only in the authenticated app shell and connects after auth hydration
- [x] 3.2 Implement `useSocket()` for low-level shared client access
- [x] 3.3 Implement `useSocketSubscription()` with explicit listener registration and cleanup
- [x] 3.4 Add optional organization-scoped filtering to the subscription hook using the active organization store

## 4. App Wiring

- [x] 4.1 Integrate `SocketProvider` into the protected application tree without affecting public routes
- [x] 4.2 Ensure logout/unmount cleanly disconnects the shared socket and resets transport state

## 5. Verification

- [x] 5.1 Verify the app creates only one socket connection per authenticated browser tab
- [x] 5.2 Verify page reload with a valid token reconnects only after auth hydration completes
- [x] 5.3 Verify organization-scoped subscriptions ignore mismatched or missing `organization_id` payloads
- [x] 5.4 Verify listener cleanup prevents duplicate handlers across mount/unmount cycles
