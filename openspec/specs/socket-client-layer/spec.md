# socket-client-layer Specification

## Purpose
TBD - created by archiving change add-socket-client-layer. Update Purpose after archive.
## Requirements
### Requirement: Shared authenticated Socket.IO client

The system SHALL provide a single shared Socket.IO client module for the authenticated frontend application. The client SHALL:
- use `socket.io-client`
- derive its default connection origin from `new URL(env.API_URL).origin`
- use JWT credentials from the existing storage module during the Socket.IO auth handshake
- be configured with `autoConnect: false`
- be reused across the application instead of creating a new client per component

#### Scenario: Importing the socket module does not immediately connect
- **WHEN** any frontend module imports the shared socket client
- **THEN** no network connection is opened until the application explicitly calls `connect()`

#### Scenario: Latest token is used during connect
- **WHEN** the user logs in and the shared client connects afterward
- **THEN** the Socket.IO auth payload includes the latest access token from storage

#### Scenario: Shared instance is reused
- **WHEN** multiple authenticated descendants access the shared client
- **THEN** they reference the same Socket.IO client instance for that browser tab

### Requirement: Auth-scoped socket provider lifecycle

The system SHALL provide a React `SocketProvider` that manages the shared Socket.IO client lifecycle for authenticated descendants only. The provider SHALL:
- mount inside the protected application shell
- wait for auth hydration to complete before connecting
- avoid connecting on public routes such as `/login`
- disconnect the shared client when the provider unmounts or when the user is no longer authenticated

#### Scenario: Reload with valid token
- **WHEN** the page reloads with a valid token in storage and protected routes are hydrating
- **THEN** the provider waits for hydration to complete before connecting the shared socket client

#### Scenario: Public login route
- **WHEN** the user is on `/login`
- **THEN** the shared socket client is not connected

#### Scenario: Logout
- **WHEN** the user logs out from an authenticated route
- **THEN** the shared socket client disconnects and its transport state is reset

### Requirement: Socket connection status is observable

The system SHALL provide a transport-level connection state utility for the shared Socket.IO client. The state SHALL expose the current status and enough metadata for future UI/debug tooling, including:
- connection status
- last connection error, if any
- timestamps for the latest successful connection and latest disconnection

The connection status SHALL support at least:
- `idle`
- `connecting`
- `connected`
- `reconnecting`
- `disconnected`
- `error`

#### Scenario: Successful connection
- **WHEN** the shared socket client emits a `connect` event
- **THEN** the connection state becomes `connected` and records the latest connected timestamp

#### Scenario: Temporary disconnect
- **WHEN** the shared socket client disconnects after previously connecting
- **THEN** the connection state becomes `disconnected` and records the latest disconnected timestamp

#### Scenario: Connection error
- **WHEN** the shared socket client emits a connection error
- **THEN** the connection state becomes `error` and stores the latest error details

### Requirement: Reusable subscription hook with cleanup

The system SHALL provide a reusable React subscription hook for the shared Socket.IO client. The hook SHALL:
- register a named event listener against the shared client
- remove only its own listener during cleanup
- avoid creating a new socket connection
- support updated handlers across component rerenders without leaking previous listeners

#### Scenario: Register listener on mount
- **WHEN** a component uses the subscription hook for event `"foo"`
- **THEN** the hook registers a listener for `"foo"` on the shared socket client

#### Scenario: Cleanup on unmount
- **WHEN** that component unmounts
- **THEN** the hook removes only the listener it registered for `"foo"`

#### Scenario: Handler changes between renders
- **WHEN** the component rerenders with a new handler reference
- **THEN** the previous listener is cleaned up and the new handler becomes active without duplicating listeners

### Requirement: Optional active-organization event filtering

The reusable subscription hook SHALL support an option for organization-scoped delivery. When that option is enabled, the hook SHALL compare `payload.organization_id` with the currently active organization from the organization store and deliver the event only when they match.

For organization-scoped subscriptions:
- payloads with a different `organization_id` SHALL be ignored
- payloads without `organization_id` SHALL be ignored

For non-organization-scoped subscriptions:
- the payload SHALL be delivered without organization filtering

#### Scenario: Matching organization event
- **WHEN** an organization-scoped subscription receives an event whose `payload.organization_id` matches the active organization id
- **THEN** the handler is called

#### Scenario: Different organization event
- **WHEN** an organization-scoped subscription receives an event whose `payload.organization_id` differs from the active organization id
- **THEN** the handler is not called

#### Scenario: Missing organization id on scoped event
- **WHEN** an organization-scoped subscription receives an event without `payload.organization_id`
- **THEN** the handler is not called

#### Scenario: Unscoped subscription
- **WHEN** a non-organization-scoped subscription receives an event
- **THEN** the handler is called without organization filtering

