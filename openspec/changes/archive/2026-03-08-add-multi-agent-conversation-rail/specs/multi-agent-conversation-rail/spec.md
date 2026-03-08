## ADDED Requirements

### Requirement: Conversation rail is rendered on the Multi-Agent page

The system SHALL render a dedicated conversation rail on the left side of the `Multi-Agent` page. The rail SHALL provide a stable navigation surface for browsing existing conversations and starting a new chat session without leaving the workspace.

The conversation rail SHALL include:
- a section title for conversations
- a search input
- lightweight filter controls
- a primary `New chat` action
- a scrollable conversation list region

#### Scenario: Multi-Agent page loads successfully
- **WHEN** an authenticated user opens the `Multi-Agent` page on desktop
- **THEN** the page displays a left-side conversation rail with a title, search input, filter controls, `New chat` action, and conversation list region

#### Scenario: No conversation is selected yet
- **WHEN** the `Multi-Agent` page opens without an active conversation selection
- **THEN** the conversation rail remains visible and usable so the user can select an existing conversation or start a new chat

### Requirement: Conversation rail lists available conversations with compact metadata

The system SHALL render one selectable item per conversation returned by the conversation listing data source. Each conversation item SHALL display compact metadata sufficient for recognition and switching.

Each conversation item SHALL display:
- the conversation title
- a relative or compact timestamp derived from recency
- a single-line preview when preview content is available

The conversation item MAY display additional compact state indicators, such as archived or active-run status, when that state is available to the frontend.

#### Scenario: Conversations are returned from the API
- **WHEN** the conversation listing request succeeds with multiple conversations
- **THEN** the rail displays one item per conversation showing title and recency
- **AND** each item shows a single-line preview when preview content is available locally or from the server

#### Scenario: Preview content is unavailable
- **WHEN** a conversation does not have preview content available
- **THEN** the rail still renders the conversation item with title and recency without breaking layout

### Requirement: Conversation rail supports search and lightweight filtering

The system SHALL allow the user to narrow the visible conversation list using a search input and lightweight status filters. The base filters SHALL support at least `Active` and `Archived`.

Search behavior SHALL:
- update the visible results from the conversation list data source using the entered query
- preserve the selected conversation if it still matches the active result set
- show an explicit empty-result state when no conversations match

Filter behavior SHALL:
- apply status-based narrowing to the visible conversation list
- allow switching between supported status views without leaving the page

#### Scenario: Search returns matching conversations
- **WHEN** the user enters a search query that matches existing conversation titles
- **THEN** the rail updates to show only the matching conversations

#### Scenario: Search returns no matches
- **WHEN** the user enters a search query that matches no conversations
- **THEN** the rail shows a no-results state in the list region
- **AND** the search input remains available for refinement or clearing

#### Scenario: Archived filter is applied
- **WHEN** the user activates the `Archived` filter
- **THEN** the rail shows only archived conversations from the listing data source

### Requirement: Conversation rail supports conversation selection and new chat creation entry

The system SHALL allow the user to select a conversation from the rail and SHALL provide a clear entry point for starting a new chat session.

When a conversation is selected:
- the selected item SHALL be visually distinguished from unselected items
- the selected conversation identifier SHALL become the active conversation context for the page

The `New chat` action SHALL:
- be visible without scrolling past the conversation list
- reset the page into a fresh conversation-starting state
- not require the user to navigate away from the `Multi-Agent` page

#### Scenario: User selects a conversation
- **WHEN** the user clicks a conversation item in the rail
- **THEN** that item becomes visually selected
- **AND** the page updates its active conversation context to the clicked conversation

#### Scenario: User starts a new chat
- **WHEN** the user activates the `New chat` action
- **THEN** the page enters a fresh conversation state with no previously selected conversation content shown as active

### Requirement: Conversation rail communicates list loading and failure states

The system SHALL communicate data-fetching states for the conversation list so users can distinguish between loading, empty, and failed outcomes.

The conversation rail SHALL support at least:
- loading state
- empty state when no conversations exist
- error state when the conversation list cannot be retrieved

#### Scenario: Conversation list is loading
- **WHEN** the conversation listing request is in progress
- **THEN** the rail shows a loading state in the conversation list region

#### Scenario: User has no conversations
- **WHEN** the conversation listing request succeeds with zero conversations
- **THEN** the rail shows an empty state with a clear affordance to start a new chat

#### Scenario: Conversation list request fails
- **WHEN** the conversation listing request fails
- **THEN** the rail shows an error state in the conversation list region
- **AND** the `New chat` action remains available if the page shell is otherwise usable

### Requirement: Conversation rail adapts responsively on smaller viewports

The system SHALL preserve access to the conversation rail on smaller viewports without permanently consuming the main chat area. On tablet and mobile layouts, the rail SHALL support collapsing into a secondary surface such as a drawer or sheet.

Responsive behavior SHALL ensure:
- the user can still open the conversation list while staying on the `Multi-Agent` page
- the selected conversation remains accessible after the rail is dismissed
- search, filters, and `New chat` remain available within the responsive rail surface

#### Scenario: Tablet viewport
- **WHEN** the `Multi-Agent` page is displayed on a tablet-sized viewport
- **THEN** the conversation rail can collapse into a secondary surface while preserving conversation browsing and selection actions

#### Scenario: Mobile viewport
- **WHEN** the `Multi-Agent` page is displayed on a mobile viewport
- **THEN** the user can open the conversation rail in a drawer or sheet and still access search, filters, conversation selection, and `New chat`
