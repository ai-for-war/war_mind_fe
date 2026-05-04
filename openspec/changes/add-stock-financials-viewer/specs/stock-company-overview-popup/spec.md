## MODIFIED Requirements

### Requirement: Company detail popup shows a beta tab shell
The popup SHALL render a company detail shell that exposes the intended multi-tab information architecture for company data. The shell SHALL include visible tabs for `Overview`, `Shareholders`, `Officers`, `Subsidiaries`, `Affiliate`, `Events`, `News`, `Financials`, `Company Reports`, `Ratio Summary`, and `Prices`. The `Financials` tab SHALL open the financial statement viewer for the selected symbol, and the `Company Reports` tab SHALL preserve the existing company report-link list behavior.

#### Scenario: Popup renders distinct financial and company report tabs
- **WHEN** the company detail popup is open for a selected stock
- **THEN** the tab shell includes a `Financials` tab
- **AND** the previous `Reports` tab is labeled `Company Reports`
- **AND** the user can distinguish financial statement tables from company report links

#### Scenario: User activates the Financials tab
- **WHEN** the user activates the `Financials` tab
- **THEN** the popup renders the stock financials viewer for the currently selected stock symbol
- **AND** the company detail popup remains open with the selected stock identity visible

#### Scenario: User activates the Company Reports tab
- **WHEN** the user activates the `Company Reports` tab
- **THEN** the popup renders the existing company reports panel behavior
- **AND** the popup does not render financial statement table controls in the company reports panel
