export type StockCompanyResponseBase = {
  symbol: string
  source: "VCI"
  fetched_at: string
  cache_hit: boolean
}

export type StockCompanyOverviewItem = {
  symbol: string
  id: number | null
  issue_share: number | null
  history: string | null
  company_profile: string | null
  icb_name2: string | null
  icb_name3: string | null
  icb_name4: string | null
  charter_capital: number | null
  financial_ratio_issue_share: number | null
}

export type StockCompanyOverviewResponse = StockCompanyResponseBase & {
  item: StockCompanyOverviewItem
}

export type StockCompanyShareholderItem = {
  id: number | null
  share_holder: string | null
  quantity: number | null
  share_own_percent: number | null
  update_date: string | null
}

export type StockCompanyShareholdersResponse = StockCompanyResponseBase & {
  items: StockCompanyShareholderItem[]
}

export type StockCompanyOfficersFilter = "working" | "resigned" | "all"

export type StockCompanyOfficerItem = {
  id: number | null
  officer_name: string | null
  officer_position: string | null
  position_short_name: string | null
  update_date: string | null
  officer_own_percent: number | null
  quantity: number | null
  type: string | null
}

export type StockCompanyOfficersResponse = StockCompanyResponseBase & {
  items: StockCompanyOfficerItem[]
}

export type StockCompanySubsidiariesFilter = "all" | "subsidiary"

export type StockCompanySubsidiaryItem = {
  id: number | null
  sub_organ_code: string | null
  organ_name: string | null
  ownership_percent: number | null
  type: string | null
}

export type StockCompanySubsidiariesResponse = StockCompanyResponseBase & {
  items: StockCompanySubsidiaryItem[]
}

export type StockCompanyAffiliateItem = {
  id: number | null
  sub_organ_code: string | null
  organ_name: string | null
  ownership_percent: number | null
}

export type StockCompanyAffiliateResponse = StockCompanyResponseBase & {
  items: StockCompanyAffiliateItem[]
}

export type StockCompanyEventItem = {
  id: number | null
  event_title: string | null
  public_date: string | null
  issue_date: string | null
  source_url: string | null
  event_list_code: string | null
  ratio: number | null
  value: number | null
  record_date: string | null
  exright_date: string | null
  event_list_name: string | null
}

export type StockCompanyEventsResponse = StockCompanyResponseBase & {
  items: StockCompanyEventItem[]
}

export const normalizeStockCompanySymbol = (symbol?: string | null): string | null => {
  const trimmedSymbol = symbol?.trim()

  if (!trimmedSymbol) {
    return null
  }

  return trimmedSymbol.toUpperCase()
}

export const normalizeStockCompanyOfficersFilter = (
  filterBy?: string | null,
): StockCompanyOfficersFilter => {
  if (filterBy === "resigned" || filterBy === "all") {
    return filterBy
  }

  return "working"
}

export const normalizeStockCompanySubsidiariesFilter = (
  filterBy?: string | null,
): StockCompanySubsidiariesFilter => {
  if (filterBy === "subsidiary") {
    return filterBy
  }

  return "all"
}
