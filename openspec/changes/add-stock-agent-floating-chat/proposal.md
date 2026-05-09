## Why

Users working inside the Markets area need quick access to a stock-specialized agent without leaving their current market workflow. The existing Super-Agent workspace proves the chat and conversation model, but the stock agent should be available as a floating mini-workspace in market routes and use the stock-agent backend contract.

## What Changes

- Add a Stock Agent floating launcher that appears only on Markets routes.
- Open the launcher into a large floating mini-workspace anchored to the bottom-right of the authenticated shell.
- Provide a two-column desktop panel with a compact conversation rail and a chat surface.
- Support normal conversation list, search, new chat, message history, optimistic send, streaming assistant output, and error feedback using the stock-agent endpoints.
- Add a compact one-line activity status where the newest action replaces the previous action with smooth animation and a badge counts actions seen in the current run.
- Reuse existing shared AI primitives and shadcn/ui components where appropriate instead of introducing a separate chat UI system.
- Preserve existing page context boundaries: the Stock Agent does not automatically inspect the current market page, selected symbol, watchlist, report, or backtest.

## Capabilities

### New Capabilities

- `stock-agent-floating-chat`: Defines the Stock Agent floating launcher, panel layout, conversation rail, chat behavior, stock-agent endpoint usage, activity line, route visibility, and mobile fallback behavior.

### Modified Capabilities

- None.

## Impact

- Affected code: `src/app/layouts/main-layout.tsx`, a new `src/features/stock-agent/` feature slice, shared AI component composition, stock-agent API hooks, socket lifecycle handling, and organization-change reset wiring.
- Affected APIs: frontend calls shift from Super-Agent's `/lead-agent/...` namespace to equivalent `/stock-agent/...` endpoints for this feature.
- Dependencies: no new package dependency expected; use existing `motion`, `zustand`, TanStack Query, Socket.IO, `sonner`, shared AI primitives, and installed shadcn/ui primitives.
- UX impact: Markets routes gain a persistent floating Stock Agent entry point that stays out of the page layout and does not inject page-specific context.
