## ADDED Requirements

### Requirement: Stock Agent launcher appears only on Markets routes
The system SHALL render a Stock Agent floating launcher inside the authenticated application shell only when the current route belongs to the Markets area. Markets routes SHALL include `/stocks`, `/stocks/watchlists`, `/stocks/research`, `/backtests`, and their nested child routes.

The launcher SHALL NOT render on non-Market routes such as `/super-agent`, `/multi-agent`, `/voice-cloning`, `/tts`, `/skill-plugins`, or `/meeting-recorder`.

#### Scenario: Markets route shows launcher
- **WHEN** an authenticated user navigates to `/stocks`
- **THEN** the application shows the Stock Agent floating launcher anchored near the bottom-right of the viewport

#### Scenario: Nested Markets route shows launcher
- **WHEN** an authenticated user navigates to a nested route under `/stocks/research`
- **THEN** the application shows the Stock Agent floating launcher

#### Scenario: Non-Market route hides launcher
- **WHEN** an authenticated user navigates to `/super-agent`
- **THEN** the application does not render the Stock Agent floating launcher

### Requirement: Stock Agent launcher opens a floating mini-workspace
The Stock Agent launcher SHALL open a floating mini-workspace without navigating away from the current route and without resizing or pushing the routed page content. On desktop viewports, the open workspace SHALL be anchored to the bottom-right of the application viewport and SHALL be large enough to contain a conversation rail beside a chat surface.

The launcher SHALL preserve the active Stock Agent state when the panel is minimized or closed. Closing or minimizing the panel SHALL NOT clear the active conversation, message history, draft prompt, streaming state, or conversation rail state.

#### Scenario: Open panel without navigation
- **WHEN** the user activates the Stock Agent launcher on a Markets route
- **THEN** the current route remains unchanged
- **AND** a floating Stock Agent mini-workspace appears above the page content

#### Scenario: Minimize preserves state
- **WHEN** the user has an active Stock Agent conversation and minimizes the panel
- **THEN** the panel closes back to the launcher
- **AND** reopening the launcher shows the same active Stock Agent conversation and draft state

#### Scenario: Floating panel does not push page content
- **WHEN** the Stock Agent panel is open on a Markets route
- **THEN** the underlying route content keeps its original layout dimensions
- **AND** the panel overlays the page rather than adding a new page column

### Requirement: Desktop panel provides a fixed conversation rail and chat column
On desktop viewports, the Stock Agent panel SHALL render a two-column layout with a conversation rail on the left and the chat surface on the right. The rail SHALL remain visible while the panel is open. The chat column SHALL contain the chat header, message thread, activity line region, and composer.

The desktop panel SHALL constrain its height to the viewport and SHALL keep long conversation lists and long message threads scrolling inside their own regions.

#### Scenario: Desktop panel renders two columns
- **WHEN** the Stock Agent panel is open on a desktop viewport
- **THEN** the panel shows a left conversation rail and a right chat column at the same time

#### Scenario: Long content scrolls internally
- **WHEN** the Stock Agent rail has many conversations or the chat thread has many messages
- **THEN** the panel height stays constrained within the viewport
- **AND** the rail and thread scroll internally instead of extending the route height

### Requirement: Stock Agent rail supports simple conversation browsing
The Stock Agent rail SHALL provide a simple conversation list surface containing:
- a rail title
- a search input
- a new chat action
- conversation rows from the Stock Agent conversation list API
- loading, empty, and retry states

The rail SHALL NOT require status filter controls in v1.

#### Scenario: Rail lists conversations
- **WHEN** the Stock Agent conversations request succeeds with one or more conversations
- **THEN** the rail renders those conversations as selectable rows
- **AND** the active conversation row is visually distinguished from inactive rows

#### Scenario: Search updates conversation list
- **WHEN** the user types a search term into the Stock Agent rail search input
- **THEN** the rail requests Stock Agent conversations using that search term
- **AND** the list updates to match the returned results

#### Scenario: New chat starts fresh chat state
- **WHEN** the user activates the new chat action in the Stock Agent rail
- **THEN** the active Stock Agent conversation becomes a fresh chat state
- **AND** existing Stock Agent conversation history remains available in the rail

#### Scenario: Rail request failure offers retry
- **WHEN** the Stock Agent conversation list request fails
- **THEN** the rail shows a retry action
- **AND** the failure is surfaced through the existing toast feedback pattern

### Requirement: Stock Agent chat uses stock-agent endpoints
The Stock Agent feature SHALL use the stock-agent backend namespace for its API requests. The system SHALL call:
- `GET /stock-agent/conversations` for conversation lists
- `GET /stock-agent/conversations/{conversation_id}/messages` for message history
- `GET /stock-agent/catalog` for runtime catalog data
- `POST /stock-agent/messages` for message submission

The Stock Agent feature SHALL keep its query keys and cached data separate from Super-Agent and Multi-Agent.

#### Scenario: Rail uses stock-agent conversation API
- **WHEN** the Stock Agent rail loads conversations
- **THEN** the frontend requests `/stock-agent/conversations`
- **AND** it does not request `/lead-agent/conversations` for Stock Agent data

#### Scenario: Thread uses stock-agent messages API
- **WHEN** the user selects a Stock Agent conversation
- **THEN** the frontend requests `/stock-agent/conversations/{conversation_id}/messages`
- **AND** the returned messages render in the Stock Agent thread

#### Scenario: Submit uses stock-agent messages API
- **WHEN** the user submits a non-empty Stock Agent prompt
- **THEN** the frontend sends the request to `/stock-agent/messages`
- **AND** it does not send the Stock Agent prompt to `/lead-agent/messages`

### Requirement: Stock Agent composer supports Super-Agent-equivalent runtime payloads
The Stock Agent composer SHALL support the same outbound runtime payload semantics as Super-Agent. When the user submits a non-empty prompt with a valid runtime selection, the request SHALL include:
- `content`
- `conversation_id` when continuing an existing conversation, or `null` when starting a fresh chat
- `provider`
- `model`
- optional `reasoning`
- `subagent_enabled`

The composer SHALL validate that a prompt is non-empty before submission and SHALL preserve the prompt draft if submission fails.

#### Scenario: Submit existing conversation message
- **WHEN** the user submits a non-empty Stock Agent prompt while an existing conversation is active
- **THEN** the request includes that conversation id
- **AND** the request includes the active runtime selection values

#### Scenario: Submit fresh chat message
- **WHEN** the user submits a non-empty Stock Agent prompt with no active conversation selected
- **THEN** the request sends `conversation_id` as `null`
- **AND** the returned conversation id becomes the active Stock Agent conversation

#### Scenario: Empty prompt does not submit
- **WHEN** the Stock Agent composer contains only whitespace and the user submits
- **THEN** the frontend does not call `/stock-agent/messages`
- **AND** the composer shows prompt validation feedback

#### Scenario: Failed submit preserves draft
- **WHEN** the Stock Agent message submission fails
- **THEN** the user receives toast feedback through `sonner`
- **AND** the prompt draft remains available for retry

### Requirement: Stock Agent thread renders fresh, loading, error, and message states
The Stock Agent chat surface SHALL render appropriate thread states for:
- fresh chat with no active conversation
- message history loading
- message history error with retry
- empty selected conversation
- selected conversation with messages
- streaming assistant response

The thread SHALL visually distinguish user messages from assistant messages and SHALL render assistant markdown content through the shared AI message renderer.

#### Scenario: Fresh chat shows suggestions
- **WHEN** the Stock Agent panel is open with no active conversation and no submitted fresh-chat prompt
- **THEN** the chat surface shows a fresh-chat empty state with stock-oriented prompt suggestions

#### Scenario: Selected conversation loads history
- **WHEN** the user selects a Stock Agent conversation from the rail
- **THEN** the chat surface shows loading placeholders while message history is pending
- **AND** renders the returned messages after the request succeeds

#### Scenario: Message history error can retry
- **WHEN** the selected Stock Agent conversation message-history request fails
- **THEN** the chat surface shows a retry action
- **AND** activating retry requests that conversation's message history again

#### Scenario: Assistant message renders markdown
- **WHEN** a Stock Agent assistant message contains markdown content
- **THEN** the thread renders the content using the shared assistant message response renderer

### Requirement: Stock Agent supports streaming lifecycle updates
The Stock Agent chat SHALL subscribe to backend chat lifecycle events for active Stock Agent conversations and SHALL update run status, streaming assistant content, activity line state, and query invalidation from those events.

The system SHALL handle started, token, tool start, tool end, completed, and failed lifecycle events for Stock Agent runs. Completed runs SHALL invalidate the active Stock Agent conversation messages and Stock Agent conversation list. Failed runs SHALL stop streaming and preserve an actionable error state.

#### Scenario: Started event creates streaming assistant state
- **WHEN** the frontend receives a start event for a Stock Agent conversation
- **THEN** the Stock Agent run status changes to streaming
- **AND** an empty streaming assistant response is prepared for that conversation

#### Scenario: Token event appends streamed text
- **WHEN** the frontend receives a token event for the active Stock Agent conversation
- **THEN** the token is appended to the visible streaming assistant response

#### Scenario: Completed event refreshes persisted data
- **WHEN** the frontend receives a completed event for a Stock Agent conversation
- **THEN** the Stock Agent run status changes to completed
- **AND** the Stock Agent message history and conversation list queries are invalidated

#### Scenario: Failed event surfaces failure
- **WHEN** the frontend receives a failed event for a Stock Agent conversation
- **THEN** the Stock Agent run status changes to failed
- **AND** the visible streaming response stops
- **AND** the user receives failure feedback

### Requirement: Stock Agent activity renders as a one-line replacing status
The Stock Agent SHALL render tool activity as a compact one-line status rather than a multi-step activity block. When tool activity events arrive for the active run, the system SHALL display only the latest activity label and SHALL replace the previous label when a newer activity arrives.

The activity line SHALL include a badge showing the count of activity actions observed for the current run. The activity line SHALL use smooth replacement animation for the action label and a subtle update animation for the count badge.

#### Scenario: First tool action shows activity line
- **WHEN** the frontend receives the first tool start event for the active Stock Agent run
- **THEN** the chat surface shows a one-line activity status
- **AND** the badge shows `1`

#### Scenario: New action replaces previous action
- **WHEN** the frontend receives another tool start event for the same active Stock Agent run
- **THEN** the activity line replaces the previous action label with the newest action label
- **AND** the badge count increments

#### Scenario: Completed run collapses activity line
- **WHEN** a Stock Agent run with visible activity completes
- **THEN** the activity line shows completion briefly or transitions to a completed subdued state
- **AND** it does not expand into a full tool timeline

#### Scenario: Failed run marks latest activity failed
- **WHEN** a Stock Agent run fails after at least one activity action
- **THEN** the activity line communicates that the run stopped at the current action count
- **AND** the failure does not render a multi-step activity block

### Requirement: Stock Agent does not inject current page context
The Stock Agent feature SHALL NOT automatically attach current page context to prompts. The system SHALL NOT send selected symbols, watchlists, report ids, backtest ids, route-specific state, or visible market table state unless the user explicitly types that information into the prompt or a future explicit feature adds such behavior.

#### Scenario: Submit from Stock Catalog without selected page context
- **WHEN** the user submits a Stock Agent prompt while viewing `/stocks`
- **THEN** the outbound request contains the typed prompt and runtime payload
- **AND** it does not include stock catalog table state or selected stock data from the page

#### Scenario: Submit from Watchlists without watchlist context
- **WHEN** the user submits a Stock Agent prompt while viewing `/stocks/watchlists`
- **THEN** the outbound request does not include the active watchlist id unless the user typed it into the prompt

### Requirement: Stock Agent state resets on organization change
The system SHALL reset in-memory Stock Agent rail state, chat workspace state, drafts, streaming assistant state, activity state, and active conversation selection when the active organization changes in `MainLayout`.

#### Scenario: Organization change clears Stock Agent state
- **WHEN** the active organization changes after the user has opened a Stock Agent conversation
- **THEN** the Stock Agent active conversation selection is cleared
- **AND** Stock Agent draft, streaming, run status, and activity state are reset

### Requirement: Mobile Stock Agent uses a single-column overlay
On mobile viewports, the Stock Agent launcher SHALL open a single-column overlay suitable for the viewport instead of the desktop two-column panel. The mobile surface SHALL keep the chat view primary and SHALL provide access to the conversation list through a secondary mobile surface such as a sheet, drawer, or tab.

The mobile overlay SHALL keep the header and composer usable while the message thread scrolls internally.

#### Scenario: Mobile opens single-column chat
- **WHEN** the user opens Stock Agent on a mobile viewport
- **THEN** the Stock Agent opens in a single-column overlay
- **AND** the chat surface is the primary visible view

#### Scenario: Mobile conversation list remains accessible
- **WHEN** the Stock Agent mobile overlay is open
- **THEN** the user can open the Stock Agent conversation list without leaving the current route

#### Scenario: Mobile thread scrolls internally
- **WHEN** the mobile Stock Agent thread contains many messages
- **THEN** the header and composer remain usable
- **AND** the message thread scrolls inside the overlay
