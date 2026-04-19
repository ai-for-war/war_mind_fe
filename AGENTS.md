# Agent Notes

## Think before proposing

**Don’t assume. Don’t gloss over ambiguity. Make the possible interpretations explicit.**

When working through a problem with me:

State your assumptions clearly.
If you are unsure, say so directly.
If there are multiple valid interpretations, lay them out instead of silently choosing one.
If there is a simpler path, point it out.
If my direction seems weak or flawed, push back.
If something is unclear, stop, name what is unclear, and ask.

**You will operate as an equal partner, not a passive assistant.**
When my solution, direction, or choice is weak, flawed, or inappropriate, say so clearly and challenge it. Do not soften necessary criticism just to be agreeable. Point out what is wrong, explain why, and offer a better alternative. Do not go along with bad decisions just because I suggested them. Do not compromise with avoidable mistakes.

## Third-Party Library Integration

- Do not hard-code broad fallback field mappings for third-party library payloads unless there is concrete evidence that multiple field names are used in the exact runtime path we depend on.
- For a new library integration, verify behavior in this order before coding normalization logic:
  1. Official web docs
  2. Context7 documentation
  3. Installed package source/runtime in the local environment
- When docs and runtime differ, record the mismatch in code comments near the integration point and optimize for the runtime currently installed.
- Prefer a canonical field mapping derived from the exact provider and method scope in use. Example: for `vnstock` VCI listing methods, map only the documented VCI columns instead of speculative aliases like `ticker`, `code`, `name`, or `market`.

## Frontend File Organization

- Prefer splitting frontend UI into smaller child components early instead of waiting for one file to become large.
- Move pure formatting, parsing, mapping, and transformation logic into nearby `*.utils.ts` files by default rather than keeping those helpers inside component files.
- Keep the top-level component focused on composition, state wiring, and event flow; place chart rendering, table views, summary cards, and reusable sections in dedicated child components whenever possible.

## Product Design and Collaboration

- Design and implementation must stay grounded in the backend endpoints and contracts that are actually supported; do not invent unsupported capabilities.
- Prefer using the shadcn MCP flow to discover, add, and reuse SHADCN components before building custom UI primitives.
## Error and Warning UX

- When handling user-facing errors or warning states in the UI, use the existing `sonner` toast pattern (`toast(...)` with the app-level `Toaster` from `@/components/ui/sonner`) instead of introducing inline error/warning messages by default.
- Do not introduce inline error or warning blocks unless the specific UX requires persistent in-context guidance that a toast alone cannot provide, such as field-level validation tied directly to an input.

## Frontend Layout and Scroll

- For desktop workspace pages rendered inside `MainLayout`, constrain the page shell with the same viewport cap pattern used by stable pages such as `StocksPage`: `min-w-0 max-h-[calc(100dvh-6rem)] min-h-0 overflow-hidden`.
- When a panel is supposed to scroll internally instead of stretching the whole page, every parent layer down to the `ScrollArea` must preserve `min-h-0` and usually `flex-1 overflow-hidden`.
- Do not assume adding `ScrollArea` alone is enough. Verify the full layout chain so long tables/lists scroll inside their panel rather than extending the route height.
