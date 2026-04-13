## Why

The stock catalog currently helps users discover symbols, but it stops at list-level metadata and forces users to leave the app or infer too much when they need company context. This change is needed now to turn the catalog into a usable research entry point by exposing a first-pass company detail experience directly from the stock list, while keeping the beta scope narrow to the overview payload that the backend already provides.

## What Changes

- Add a large company detail popup that opens from a selected stock in the existing stock catalog experience
- Render a company detail shell that is designed for future company tabs, but only enables the `Overview` tab in this beta iteration
- Fetch and present `GET /api/v1/stocks/{symbol}/company/overview` inside the popup with a UI hierarchy optimized for:
  - instant stock identity context from the selected catalog row
  - key company facts such as industry classification, charter capital, and issued shares
  - longer-form narrative sections for company profile and business history
- Show non-overview company tabs in a disabled beta state so users can understand the intended future information architecture without expecting those sections to be available yet
- Provide loading, empty, and request-failure states for the overview content without breaking the surrounding stock catalog context
- Preserve the current dark, glassy visual language of the markets area while making the popup more readable for narrative and detail-oriented content

## Capabilities

### New Capabilities
- `stock-company-overview-popup`: A stock-company detail popup launched from the stock catalog that displays company overview content for the selected symbol, keeps non-overview tabs visible but disabled during beta, and handles loading, empty, and error states inside the popup shell

### Modified Capabilities
- None

## Impact

- **New frontend scope**: company overview popup UI, overview data types, API integration, query state, and presentation components under the stocks feature area
- **Modified interaction flow**: the stock catalog table becomes a drill-down entry point for company detail instead of a list-only browsing surface
- **Backend integration**: frontend consumption of `GET /api/v1/stocks/{symbol}/company/overview` as documented in `docs/stock/stock_company_frontend_guide.md`
- **Beta behavior**: other company tabs remain intentionally disabled and are not part of this implementation scope
- **No backend contract change required**: this proposal assumes the current overview response envelope and field set remain the source of truth for beta
