# Agent Notes

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

## Error and Warning UX

- When handling user-facing errors or warning states in the UI, use the existing `sonner` toast pattern (`toast(...)` with the app-level `Toaster` from `@/components/ui/sonner`) instead of introducing inline error/warning messages by default.
- Do not introduce inline error or warning blocks unless the specific UX requires persistent in-context guidance that a toast alone cannot provide, such as field-level validation tied directly to an input.
