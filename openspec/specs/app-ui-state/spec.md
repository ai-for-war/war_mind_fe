## Purpose
Define shared application UI state managed in centralized stores.

## Requirements

### Requirement: App UI state store
The system SHALL provide a Zustand store at `src/stores/use-app-store.ts` that manages application-level UI state. Initially, the store SHALL track the sidebar open/collapsed state with a boolean `isSidebarOpen` (default: `true`).

#### Scenario: Store initializes with default state
- **WHEN** the application loads
- **THEN** the `useAppStore` provides `isSidebarOpen` as `true`

### Requirement: Toggle sidebar state
The store SHALL provide a `toggleSidebar` action that flips the `isSidebarOpen` boolean value and a `setSidebarOpen` action that sets it to a specific value.

#### Scenario: Toggle sidebar state
- **WHEN** `toggleSidebar` is called while `isSidebarOpen` is `true`
- **THEN** `isSidebarOpen` becomes `false`

#### Scenario: Set sidebar state explicitly
- **WHEN** `setSidebarOpen(false)` is called
- **THEN** `isSidebarOpen` becomes `false` regardless of previous value
